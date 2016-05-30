# -*- coding: utf-8

"""
 общая идея:
   - заменить частые буквосочетания ( 2 , мб. 3 символа) на 1 симол ( UpperCase)
"""
import struct
from array import array

import WordTester
import Bloom4

letter_dict = "abcdefghijklmnopqrstuvwxyz'"

#  [0, 2, 4, 6, 8, -3] 70.21%
#  [0, 2, 3, -4, -3] 70.01%
#  [0, 2, -3] 68.68%
#  [0, 3, 6, -3] 69.29%
#  [0, 1, 3, -4, -3] 70.07
#  [0, 1, 2, -4, -3] 70.02
#  [0, 3, 6, 9, -3] 69.63
#  [0, 3, 6, -5, -3] 69.98
#  [0, 2, 4, -4, -3] 70.07
#  [0, 2, 4, -4, -3] 69.82%   file 59479 -> gzip 48444
#  [0, 2, -3] 68.63   file 35341 -> gzip 28948
#  [0, -3] 67.85  file 20501 -> gzip 16221
GLOBAL_POS_LIST = [0, 2, -3]

class Bits():
    def __init__(self, size):
        self.size = size
        self.bits = array('I', (0 for i in xrange((size / 32)+1) ))

    def test(self, index):
        return ((self.bits[index / 32] >> (index % 32)) & 1) != 0

    def set(self, index):
        self.bits[index / 32] |= (1 << (index % 32))

    def save_as_raw(self, out_file):
        s = struct.pack('I', len(self.bits))
        assert len(s) == 4, len(s)
        out_file.write(s)

        for i in xrange(len(self.bits)):
            s = struct.pack('I', self.bits[i])
            assert len(s) == 4, len(s)
            out_file.write(s)

    def load_as_raw(self, in_file):
        s = in_file.read(4)
        assert len(s) == 4, len(s)
        n = struct.unpack('I', s)[0]
        self.bits = array('I', (0 for i in xrange(n)))

        for i in xrange(n):
            s = in_file.read(4)
            assert len(s) == 4, len(s)
            self.bits[i] = struct.unpack('I', s)[0]


class LetterStaticticTranslator():
    """
      преобразует слова на основе статического алфавита.
      отдельный алфавит для каждой позиции, но отдельный для последних 2 (pos: -1, -2)
      так же убирает слишком малораспространнённые буквы
      так же заменяет последнюю 's на $
    """
    def __init__(self, max_len=16, min_len=5):
        self.alfa_by_pos = dict()
        self.max_len = max_len
        self.min_len = min_len
        self.filter_percent = 0.003
        self.last_part_size = 3

    def prepare(self, words_set):
        dyn_alfa_pos = dict()
        for i in xrange(self.max_len):
            dyn_alfa_pos[i - self.last_part_size] = dict()

        for wd in words_set:
            wd = str(wd).lower().strip()
            if wd.endswith("'s"):
                wd = wd[:-2] + '$'
            if (len(wd) > self.max_len) or (len(wd) < self.min_len):
                continue
            if "'" in wd: continue
            for i in xrange(len(wd)):
                pp = i - self.last_part_size
                if pp == -1:
                    a = wd[-1:]
                else:
                    a = wd[pp:pp+1]
                if pp not in dyn_alfa_pos:
                    assert False, wd+ '  %d' % len(wd)
                dyn_alfa_pos[pp][a] = dyn_alfa_pos[pp].get(a, 0) + 1

        if self.filter_percent:
            for i in dyn_alfa_pos:
                dd = dyn_alfa_pos[i]
                summ = 0
                for a in dd:
                    summ += dd[a]
                remove_cnt = int(self.filter_percent * summ)
                print "  remove(%d) %d / %d " % (i, remove_cnt, summ)
                for a in sorted(dd,key=dd.get):
                    remove_cnt -= dd[a]
                    if remove_cnt < 0:
                        break
                    n = dyn_alfa_pos[i].pop(a, None)
                    print "   removed %s  %d" % (a ,n)

        if False:
            # print statistic
            letter_dict = "'abcdefghijklmnopqrstuvwxyz$"
            with open('LetterStaticticTranslator.txt', 'w') as f:
                # header
                f.write('alfa | ')
                for i in xrange(self.max_len):
                    f.write(' pos %d | ' % (i - self.last_part_size))
                f.write('\n')
                # rows
                for a in letter_dict:
                    f.write(a + ' | ')
                    for i in xrange(self.max_len):
                        dd = dyn_alfa_pos[i-self.last_part_size]
                        if a in dd:
                            f.write('%d |' % dd[a])
                        else:
                            f.write('- |')
                    f.write('\n')

        # save
        self.alfa_by_pos = dict()
        for i in dyn_alfa_pos:
            dd = dyn_alfa_pos[i]
            alfa_order = list()
            for a in sorted(dd, key=dd.get, reverse=True):
                alfa_order.append(a)
            self.alfa_by_pos[i] = alfa_order

    def save(self, f):
        lst = list()
        for i in list(range(self.max_len)):
            dd = self.alfa_by_pos[i-self.last_part_size]
            s = ''
            for a in dd:
                s += a
            lst.append(s)
        f.write("\n".join(lst) + '\0')

    def load(self, f):
        s = ''
        while True:
            a = f.read(1)
            if a == '\0': break
            s += a

        self.alfa_by_pos = dict()
        str_lst = s.split('\n')
        assert(len(str_lst) == self.max_len), ' %d <> %d ' % (len(str_lst), self.max_len)
        n = 0
        for i in list(range(self.max_len)):
            self.alfa_by_pos[i - self.last_part_size] = (str_lst[n]).strip()
            n += 1

    def translate(self, wd):
        wd = str(wd).lower().strip()
        if wd.endswith("'s"):
            wd = wd[:-2] + '$'
        if (len(wd) > self.max_len) or (len(wd) < self.min_len):
            return

        rez = ''

        for i in xrange(len(wd)-self.last_part_size):
            a = wd[i:i+1]
            if a not in self.alfa_by_pos[i]:
                return
            else:
                n = self.alfa_by_pos[i].index(a)
                rez += chr(ord('A') + n )

        for i in xrange(self.last_part_size):
            pp = i - self.last_part_size
            a = wd[pp:][:1]
            if a not in self.alfa_by_pos[pp]:
                return
            else:
                n = self.alfa_by_pos[pp].index(a)
                rez += chr(ord('A') + n)

        return rez

    def get_full_range(self, start_pos, size=3):
        rez = list()
        assert size == 3, 'todo!'
        for i1 in xrange(len(self.alfa_by_pos[start_pos])):
            for i2 in xrange(len(self.alfa_by_pos[start_pos+1])):
                for i3 in xrange(len(self.alfa_by_pos[start_pos + 2])):
                    s = chr(ord('A')+i1 ) + chr(ord('A')+i2 ) + chr(ord('A')+i3 )
                    rez.append(s)
        return rez

class MultiLen_LetterStaticticTranslator():
    def __init__(self):
        self.letter_trans_by_len = dict()
        self.max_len = 16
        self.min_len = 4

    def prepare(self, words_set):
        words_by_len = dict()
        for wd in words_set:
            if wd.endswith("'s"):
                wd = wd[:-2] + '$'
            if (len(wd) > self.max_len) or (len(wd) < self.min_len):
                continue
            LL = len(wd)
            if LL not in words_by_len:
                words_by_len[LL] = set()
            words_by_len[LL].add(wd)

        for LL in words_by_len:
            if LL not in self.letter_trans_by_len:
                self.letter_trans_by_len[LL] = LetterStaticticTranslator(max_len=LL)
            self.letter_trans_by_len[LL].prepare(words_by_len[LL])

    def save(self, f):
        for LL in xrange(self.min_len, self.max_len+1):
            self.letter_trans_by_len[LL].save(f)

    def load(self, f):
        self.letter_trans_by_len = dict()
        for LL in xrange(self.min_len, self.max_len+1):
            self.letter_trans_by_len[LL] = LetterStaticticTranslator(max_len=LL)
            self.letter_trans_by_len[LL].load(f)

    def translate(self, wd):
        wd = str(wd).lower().strip()
        if wd.endswith("'s"):
            wd = wd[:-2] + '$'
        if (len(wd) > self.max_len) or (len(wd) < self.min_len):
            return

        LL = len(wd)
        return  self.letter_trans_by_len[LL].translate(wd)

    def get_full_range(self, start_pos, size=3):
        assert False
        assert size == 3
        set1 = set()
        set2 = set()
        set3 = set()
        rez = list()
        for LL in self.letter_trans_by_len:
            if (start_pos+0) in self.letter_trans_by_len[LL].alfa_by_pos:
                for a in self.letter_trans_by_len[LL].alfa_by_pos[start_pos+0]:
                    set1.add(a)
            if (start_pos+1) in self.letter_trans_by_len[LL].alfa_by_pos:
                for a in self.letter_trans_by_len[LL].alfa_by_pos[start_pos+1]:
                    set2.add(a)
            if (start_pos+2) in self.letter_trans_by_len[LL].alfa_by_pos:
                for a in self.letter_trans_by_len[LL].alfa_by_pos[start_pos+2]:
                    set3.add(a)
        for a1 in sorted(set1):
            for a2 in sorted(set2):
                for a3 in sorted(set3):
                    rez.append(a1+a2+a3)
        return rez


class More25dict():
    """
       строки длинее 25 сохраняем полностью.
         там
       """
    def __init__(self):
        self.all_words = set()
        self.min_len = 26

    def prepare(self, words_set):
        for wd in words_set:
            if len(wd) >= self.min_len:
                self.all_words.add(wd)

    def save(self, file_out):
        s = "\t".join(sorted(self.all_words))
        print ' More25dict full len = %d  for %d words' % (len(s) +1, len(self.all_words))
        file_out.write(s)
        file_out.write("\0")

    def load(self, file_in):
        s = ''
        while True:
            a = file_in.read(1)
            assert a <> ''
            if a == '\0':
                break
            s += a
        self.all_words = s.split('\t')

    def test(self, wd):
        return wd in self.all_words


class MinMaxLex():
    def __init__(self):
        self.minmax_len = dict()
        self.min_len = 4
        self.max_len = 25

    def prepare(self, words_set):
        for wd in words_set:
            LL = len(wd)
            if self.min_len <= LL <= self.max_len:
                dd = self.minmax_len.get(LL, dict())

                wd_min = dd.get('min')
                if wd_min is None:
                    wd_min = wd
                else:
                    wd_min = min(wd_min, wd)

                wd_max = dd.get('max')
                if wd_max is None:
                    wd_max = wd
                else:
                    wd_max = max(wd_max, wd)

                dd = {'min': wd_min, 'max': wd_max}
                self.minmax_len[LL] = dd
        #print "MinMaxLex - keys " + str(list(self.minmax_len.iterkeys()))

    def save(self, file_out):
        total_len = 1
        #print "  saving MinMaxLex len %d " % len(self.minmax_len)
        for LL in sorted(self.minmax_len):
            dd = self.minmax_len[LL]
            s = '%s\t%s\n' % (dd['min'], dd['max'])
            total_len += len(s)
            file_out.write(s)
        file_out.write("\0")
        #print " save MinMax len = %d" % total_len

    def load(self, file_in):
        self.minmax_len = dict()
        s = ''
        while True:
            a = file_in.read(1)
            assert a <> ''
            if a == '\0':
                break
            s += a
        #if len(s) == 0:
        #    print "WARNING!! len=0"
        for pp in s.split('\n'):
            if pp == '': continue
            m1, m2 = pp.split('\t', 1)
            assert len(m1) == len(m2)
            self.minmax_len[len(m1)] = {'min': m1, 'max': m2}

    def test(self, wd):
        LL = len(wd)
        if LL not in self.minmax_len:
            return False

        if self.min_len <= LL <= self.max_len:
            m1 = self.minmax_len[LL]['min']
            m2 = self.minmax_len[LL]['max']
            return m1 <=wd <= m2

        return True


class Multi_MinMaxLex():
    """
     позиция, буква
      [1, 2, 3, 4, -2] - отброшено 24100 // gzip 30410
      [1, 2, -2] - отброшено 20451 // gzip 21798
      [1, -2] - отброшено 17254 // gzip 16707
      [1] - отброшено 13502 // 11260
    """
    def __init__(self):
        self.pos_lst = [6]

    def prepare(self, words_set):
        multi_set = dict()
        for wd in words_set:
            for i in self.pos_lst:
                if i not in multi_set:
                    multi_set[i] = dict()

                a = wd[i:i+1]
                if a == '': continue

                if a not in multi_set[i]:
                    multi_set[i][a] = set()

                multi_set[i][a].add(wd)

        self.multiMMX = dict()
        for i in multi_set:
            if i not in self.multiMMX:
                self.multiMMX[i] = dict()
            for a in multi_set[i]:
                if a not in self.multiMMX[i]:
                    self.multiMMX[i][a] = MinMaxLex()
                #print "Multi_MinMaxLex %d, %s" % (i, a)
                self.multiMMX[i][a].prepare(multi_set[i][a])

    def save(self, f):
        for i in self.pos_lst:
            n = len(self.multiMMX[i])
            f.write(chr(n))
            for a in self.multiMMX[i]:
                self.multiMMX[i][a].save(f)

    def load(self, f):
        self.multiMMX = dict()
        for i in self.pos_lst:
            if i not in self.multiMMX:
                self.multiMMX[i] = dict()

            n = ord(f.read(1))
            for k in xrange(n):
                mmx = MinMaxLex()
                mmx.load(f)
                if len(mmx.minmax_len) == 0: continue
                wd = mmx.minmax_len[max(mmx.minmax_len.iterkeys())]['min']
                a = wd[i]
                self.multiMMX[i][a] = mmx

    def test(self, wd):
        for i in self.pos_lst:
            a = wd[i:i + 1]
            if a != '':
                if not self.multiMMX[i][a].test(wd):
                    return False
        return True


class DictorPos():
    def __init__(self):
        #  [0, 2, 4, 6, 8, -3] 70.21%
        #  [0, 2, 3, -4, -3] 70.01%
        #  [0, 2, -3] 68.68%
        #  [0, 3, 6, -3] 69.29%
        #  [0, 1, 3, -4, -3] 70.07
        #  [0, 1, 2, -4, -3] 70.02
        #  [0, 3, 6, 9, -3] 69.63
        #  [0, 3, 6, -5, -3] 69.98
        #  [0, 2, 4, -4, -3] 70.07
        #  [0, 2, 4, -4, -3] 69.82%   file 59479 -> gzip 48444
        #  [0, 2, -3] 68.63   file 35341 -> gzip 28948
        #  [0, -3] 67.85  file 20501 -> gzip 16221
        self.pos_lst = GLOBAL_POS_LIST
        self.filter_percent = 0.006

    def prepare(self, words_set, alfas):
        self.parts_by_pos = dict()
        for i in self.pos_lst:
            self.parts_by_pos[i] = dict()

        for wd in words_set:
            for i in self.pos_lst:
                aa = wd[i:][:3]
                if len(aa) != 3: continue
                self.parts_by_pos[i][aa] = self.parts_by_pos[i].get(aa, 0) + 1

        # filter out
        for i in self.pos_lst:
            dd = self.parts_by_pos[i]
            full_range = alfas.get_full_range(i)
            for aa in list(self.parts_by_pos[i]):
                if aa not in full_range:
                    self.parts_by_pos[i].pop(aa, None)
            summ = 0
            for aa in dd:
                summ += dd[aa]
            cnt_to_remove = int(summ * self.filter_percent)
            for aa in sorted(dd, dd.get):
                cnt_to_remove -= dd[aa]
                if cnt_to_remove < 0:
                    break
                self.parts_by_pos[i].pop(aa, None)

    def save(self, f, alfas, anti):
        for i in self.pos_lst:
            dd = self.parts_by_pos[i]
            full_range = alfas.get_full_range(i)
            if anti:
                for aa in anti.anti_pos[i]:
                    full_range.remove(aa)

            bits = Bits(len(full_range))
            k = 0
            for aa in dd:
                n = full_range.index(aa)
                bits.set(n)
                k += 1
            bits.save_as_raw(f)
            print " dict3 pos(%d) saved %d / %d  (%d)" % (i, k, bits.size, int(bits.size/8)+1)

    def load(self, f, alfas, anti):
        self.parts_by_pos = dict()
        for i in self.pos_lst:
            self.parts_by_pos[i] = set()
            full_range = alfas.get_full_range(i)
            if anti:
                for aa in anti.anti_pos[i]:
                    full_range.remove(aa)

            bits = Bits(len(full_range))
            bits.load_as_raw(f)
            for aa in full_range:
                n = full_range.index(aa)
                if bits.test(n):
                    self.parts_by_pos[i].add(aa)

    def test(self, wd):
        for i in self.pos_lst:
            aa = wd[i:][:3]
            if len(aa) != 3: continue
            if aa not in self.parts_by_pos[i]:
                return False
        return True


class MultiLen_DictorPos():
    def prepare(self, words_set, alfas):
        words_by_len = dict()
        for LL in xrange(5, 17):
            words_by_len[LL] = set()

        for wd in words_set:
            LL = len(wd)
            if LL in words_by_len:
                words_by_len[LL].add(wd)

        self.objs_by_len = dict()
        for LL in words_by_len:
            obj = DictorPos()
            obj.prepare(words_by_len[LL], alfas)
            self.objs_by_len[LL] = obj

    def print_stat(self, alfas):
        print "----------------------"
        print "    {:>7}    |    {:>7}      | {:>7}    |   {:>7}   |    {:>7}   |  ".format('pos', 'posY', 'posN', 'allY', 'allN')

        # для всех  - общийДА и общийНЕТ
        allN = set()
        LL = list(self.objs_by_len.iterkeys())[:1][0]
        for pp in self.objs_by_len[LL].pos_lst:
            allN = allN.union( set(alfas.get_full_range(pp)) )
        allY = set()
        for LL in self.objs_by_len:
            for pp in self.objs_by_len[LL].pos_lst:
                dd = set(self.objs_by_len[LL].parts_by_pos[pp])
                if len(allY) == 0:
                    allY = dd
                else:
                    allY = allY.intersection(dd)

                allN = allN.difference(dd)
        print "    {:>7}    |    {:>7}      | {:>7}    |   {:>7}   |    {:>7}   |  "\
            .format('all', ' ', ' ', len(allY), len(allN))

        # для каждой позиции -  позицияДА и позицияНЕТ  + совпадение с общийДА и общийНЕТ
        LL = list(self.objs_by_len.iterkeys())[:1][0]
        for pp in self.objs_by_len[LL].pos_lst:
            posY = set(); posN = set(alfas.get_full_range(pp));
            for LL in self.objs_by_len:
                dd = set(self.objs_by_len[LL].parts_by_pos[pp])

                if len(posY) == 0:
                    posY = dd
                else:
                    posY = posY.intersection(dd)

                posN = posN.difference(dd)

            print "    {:>7}    |    {:>7}      | {:>7}    |   {:>7}   |    {:>7}   |  " \
                .format(pp, len(posY), len(posN),  len(posY.intersection(allY)), len(posN.intersection(allN)))

        print "----------------------"

    def save(self, f, alfas):
        anti = Anti_MultiLen_DictorPos()
        anti.prepare(self, alfas)
        anti.save(f, alfas)

        for LL in xrange(5, 17):
            print "saing for len %d" % LL
            self.objs_by_len[LL].save(f, alfas, anti)

    def load(self, f, alfas):
        anti = Anti_MultiLen_DictorPos()
        anti.load(f, alfas)

        self.objs_by_len = dict()
        for LL in xrange(5, 17):
            obj = DictorPos()
            obj.load(f, alfas, anti)
            self.objs_by_len[LL] = obj

    def test(self, wd):
        LL = len(wd)
        if LL in self.objs_by_len:
            if not self.objs_by_len[LL].test(wd):
                return False
        return True


class Anti_MultiLen_DictorPos():
    def __init__(self):
        self.pos_lst = DictorPos().pos_lst
        self.anti_pos = dict()

    def prepare(self, multidict, alfas):
        anti_pos = dict()
        for pp in  self.pos_lst:
            anti_pos[pp] = set(alfas.get_full_range(pp))

        for LL in multidict.objs_by_len:
            for pp in  self.pos_lst:
                dd = set(multidict.objs_by_len[LL].parts_by_pos[pp])
                anti_pos[pp] = anti_pos[pp].difference(dd)
        # save
        self.anti_pos = dict()
        for pp in self.pos_lst:
            self.anti_pos[pp] = anti_pos[pp]

    def save(self, f, alfas):
        for i in self.pos_lst:
            dd = self.anti_pos[i]
            full_range = alfas.get_full_range(i)

            bits = Bits(len(full_range))
            k = 0
            for aa in dd:
                n = full_range.index(aa)
                bits.set(n)
                k += 1
            bits.save_as_raw(f)
            print " ANTI dict3 pos(%d) saved %d / %d  (%d)" % (i, k, bits.size, int(bits.size / 8) + 1)

    def load(self, f, alfas):
        self.anti_pos = dict()
        for i in self.pos_lst:
            self.anti_pos[i] = set()
            full_range = alfas.get_full_range(i)

            bits = Bits(len(full_range))
            bits.load_as_raw(f)
            for aa in full_range:
                n = full_range.index(aa)
                if bits.test(n):
                    self.anti_pos[i].add(aa)



class OneTwoTree():
    def __init__(self, filename='data.bits'):
        self.fn_bits = filename

        self.dict25 = More25dict()
        self.len_alfa = LetterStaticticTranslator()  # MultiLen_LetterStaticticTranslator() ## LetterStaticticTranslator()
        self.min_max_lex = None ##Multi_MinMaxLex()  ## MinMaxLex()
        self.dict3_pos = MultiLen_DictorPos()

        self.bloom = Bloom4.Bloom(40 * 8 * 1024, [Bloom4.Hash()])

    def prepare(self, words_set):
        self.__init__(self.fn_bits)

        self.dict25.prepare(words_set)
        self.len_alfa.prepare(words_set)

        words_set_new = set()
        for wd in words_set:
            wd = self.len_alfa.translate(wd)
            if wd:
                words_set_new.add(wd)
        words_set = words_set_new

        self.dict3_pos.prepare(words_set, self.len_alfa)
        self.dict3_pos.print_stat( self.len_alfa )

        words_set_new = set()
        for wd in words_set:

            if self.dict3_pos.test(wd):
                words_set_new.add(wd)
        words_set = words_set_new
        if self.min_max_lex:
            self.min_max_lex.prepare(words_set)

        if self.bloom:
            self.bloom.prepare(words_set)

    def save(self, f):
        self.dict25.save(f)
        self.len_alfa.save(f)
        if self.min_max_lex:
            self.min_max_lex.save(f)
        self.dict3_pos.save(f, self.len_alfa)

        if self.bloom:
            self.bloom.save_as_raw(f)

    def load(self, f):
        self.__init__(self.fn_bits)
        self.dict25.load(f)
        self.len_alfa.load(f)
        if self.min_max_lex:
            self.min_max_lex.load(f)
        self.dict3_pos.load(f, self.len_alfa)

        if self.bloom:
            self.bloom.load_from_raw(f)

    def init(self):
        self.stat_dict3_pos = 0
        self.stat_last3 = 0
        self.stat_dict25 = 0
        self.stat_minmax = 0
        self.stat_len_alfa = 0
        self.stat_bloom = 0

        with open(self.fn_bits, 'rb') as f:
            self.load(f)

    def test(self, wd):
        if len(wd) == 1:
            return wd != "'"

        if len(wd) >= self.dict25.min_len:
            self.stat_dict25 += 1
            return self.dict25.test(wd)

        wd = self.len_alfa.translate(wd)
        if not wd:
            self.stat_len_alfa += 1
            return False

        if self.min_max_lex:
            if 3 < len(wd) < 26:
                if not self.min_max_lex.test(wd):
                    self.stat_minmax += 1
                    return False

        if not self.dict3_pos.test(wd):
            self.stat_dict3_pos += 1
            return False

        if self.bloom:
            if not self.bloom.test(wd):
                self.stat_bloom += 1
                return False
        return True

    def print_stat(self):
        print "    stat_dict25       : %d " % self.stat_dict25
        print "    stat_len_alfa     : %d " % self.stat_len_alfa
        print "    stat_minmax       : %d " % self.stat_minmax
        print "    stat_dict3_pos    : %d " % self.stat_dict3_pos
        print "    stat_bloom        : %d " % self.stat_bloom


def TestOneTwoTree():
    tester = WordTester.WordTester()
    tester.load_words()

    obj = OneTwoTree('data1.bin')
    obj.prepare(tester.orig_set)
    with open(obj.fn_bits, 'wb') as f:
        obj.save(f)
    tester.gzip(obj.fn_bits)

    if 1==1:
        print " # test save/load ..."
        obj2 = OneTwoTree('data2.bin')
        with open(obj.fn_bits, 'rb') as f:
            obj2.load(f)
        with open(obj2.fn_bits, 'wb') as f:
            obj2.save(f)
        import filecmp
        assert filecmp.cmp(obj.fn_bits, obj2.fn_bits), 'Files are NOT equal'

    tester.make_test(obj)
    obj.print_stat()

TestOneTwoTree()

def TestLetterStaticticTranslator():
    tester = WordTester.WordTester()
    tester.load_words()

    obj = LetterStaticticTranslator() # MultiLen_LetterStaticticTranslator()  #LetterStaticticTranslator()
    obj.prepare(tester.orig_set)

    with open('test.raw', 'wb') as f:
        obj.save(f)
    tester.gzip('test.raw')

    obj = MultiLen_LetterStaticticTranslator()  # LetterStaticticTranslator()
    with open('test.raw', 'rb') as f:
        obj.load(f)
    with open('test2.raw', 'wb') as f:
        obj.save(f)

#TestLetterStaticticTranslator()