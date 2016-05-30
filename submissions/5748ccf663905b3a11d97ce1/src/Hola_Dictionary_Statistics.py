
# coding: utf-8

# In[2]:

import operator
import json
import Hola_Dictionary


# In[5]:

class Hola_Reverse_Sequence_Representer():
    def get_alphabet(self):
        return "abcdefghijklmnopqrstuvwxyz'$"

    def get_offset(self, reversed_seq):
        alphabet = self.get_alphabet()
        l = len(alphabet)
        order = len(reversed_seq)
        pos = 0
        for i in range(0, order):
            sym = reversed_seq[i]
            sym_pos = alphabet.index(sym)
            pos += sym_pos * (l ** (order - i - 1))
        return pos

    def get_root_subchain(self, root, order = 3):
        alphabet = self.get_alphabet()
        l = len(alphabet)
        start = alphabet.index(root) * (l ** (order-1))
        stop = (alphabet.index(root) + 1) * (l ** (order-1))
        return start, stop
    
    def parse_word(self, word, order = 3):
        reversed_seq = []
        root = '$'
        for i in range(1, len(word)):
            sub_seq = [root]
            for j in range(0, order-1):
                if i + j > len(word):
                    sub_seq.append('$')
                else:
                    sub_seq.append(word[-i-j])
            branch = word[-i]
            nest = word[-i-1]
            reversed_seq.append(sub_seq)
            root = word[-i]
        return reversed_seq
    
#representer = Hola_Reverse_Sequence_Representer()
#print representer.parse_word('xyz', 3)
#print representer.get_offset(['$','$','$'])


# In[3]:

class Hola_Dictionary_Statistics():
    _dict = None
    
    def __init__(self, hola_dictionary):
        self._dict = hola_dictionary
        
    def _get_length_distribution(self):
        distrib = {}
        for word in self._dict.get_words():
            length = len(word)
            freq = distrib.get(length, 0)
            distrib[length] = freq + 1
    
        total = sum(distrib.values())
        return {key: float(distrib[key]) / total for key in distrib}
        
        
    def get_significant_length(self, percentile, with_frequency=False):
        distrib = self._get_length_distribution()
        sorted_distrib = sorted(distrib.items(), key=operator.itemgetter(1), reverse=True)
        values = []
        accumulate = 0
        for key, p in sorted_distrib:
            if accumulate + p <= percentile:
                if with_frequency:
                    values.append((key, p, accumulate + p))
                else:
                    values.append(key)
            accumulate += p
        return values
    
    
#dict_eng = Hola_Dictionary.Hola_Dictionary_English()
#dict_eng.read('words.txt')
#stat_eng = Hola_Dictionary_Statistics(dict_eng)
#print stat.get_significant_length(0.99, True)
#print stat_eng.get_significant_length(0.99)

#import Hola_Test_System
#test_system = Hola_Test_System.Hola_Test_System()
#dict_stop = Hola_Dictionary.Hola_Dictionary_Stop(test_system)
#dict_stop.read(15, 50)
#stat_stop = Hola_Dictionary_Statistics(dict_stop)
#print stat_stop.get_significant_length(0.99, True)


# In[7]:

class Hola_Dictionary_Markov_Chain():
    _dict = None
    _order = 3
    _chain = []
    _representer = None
    _sign_len = None
    
    def __init__(self, hola_dictionary, order = 3):
        self._dict = hola_dictionary
        self._order = order
        self._representer = Hola_Reverse_Sequence_Representer()
        
    def train(self, significant_length_percentile = 0.99):
        self._chain = [0] * pow(len(self._representer.get_alphabet()), self._order)
        stat = Hola_Dictionary_Statistics(self._dict)
        self._sign_len = stat.get_significant_length(significant_length_percentile)
        
        for word in self._dict.get_words():
            if len(word) not in self._sign_len:
                continue
            for reversed_seq in self._representer.parse_word(word, self._order):
                offset = self._representer.get_offset(reversed_seq)
                self._chain[offset] = self._chain[offset] + 1
                
        for root in self._representer.get_alphabet():
            subchain_start, subchain_stop = self._representer.get_root_subchain(root, self._order)
            subchain = self._chain[subchain_start:subchain_stop]
            total = sum(subchain)
            for i in range(subchain_start, subchain_stop):
                if total == 0:
                    self._chain[i] = 0
                else:
                    self._chain[i] = self._chain[i] / float(total)
        formatter = lambda f: 0 if f == 0 else round(f*100, 3)
        self._chain = [formatter(f) for f in self._chain]
                
    def save_to_file(self, file_name):
        f = open(file_name, 'w+')
        f.write(json.dumps(self._chain))
        f.close()
        
    def test(self, word):
        if len(word) not in self._sign_len:
            return [0] * len(self._representer.parse_word(word, self._order))
        plist = []
        for reversed_seq in self._representer.parse_word(word, self._order):
            offset = self._representer.get_offset(reversed_seq)
            plist.append(self._chain[offset])
        return plist
            
        

#chain = Hola_Dictionary_Markov_Chain(dict_eng, 3)
#chain.train(0.99)
#chain.save_to_file('mc_eng_3.json')
#print chain.test('ignewutkgnjndgusdgudigjidgdshghdjgodgjig')
#print chain.test('krakatau')

