import numpy, json, requests, os, pprint, random
from collections import defaultdict

def lower_sort_unique():
	words = numpy.loadtxt('./words.txt', dtype='S')
	
	lines = [line.lower() for line in words]
	words = sorted(lines)

	numpy.savetxt('./unique.txt', numpy.unique(words), fmt="%s")

def wrds_ending_with(ch):
	# gives words ending with ch character
	with open('./sub files/unique.txt', 'r') as file:
		for i in file:
			if ch in i.strip():
				print i,

def replace_apos_s():
	# replaced '\'s' and s with 1 and 2 respectively
	# deleted '\'s' and s word if there non '\'s' or 's' form exists

	apos_exists = s_exists = False
	words = numpy.loadtxt('./unique.txt', dtype='S')
	with open('./apos_s replaced.txt', 'w+') as removed:
		for i in xrange(0, len(words)):
			j = i+1
			while j < len(words) and words[i][0:1] == words[j][0:1] and not words[j][-2:] == '00':
				if words[j][-2:] == '\'s' and words[j][0:-2] == words[i]:
					apos_exists = True
					words[j] = words[j]+'00'
				elif words[j][-1:] == 's' and words[j][0:-1] == words[i]:
					s_exists = True
					words[j] = words[j]+'00'
					break
				j = j+1
			if words[i][-2:] == '00':
				pass
			elif apos_exists and s_exists:
				removed.write('{0}{1}{2}\n'.format(words[i],1,2))
			elif apos_exists:
				removed.write('{0}{1}\n'.format(words[i],1))
			elif s_exists:
				removed.write('{0}{1}\n'.format(words[i],2))
			else:
				removed.write('{0}\n'.format(words[i]))
			apos_exists = s_exists = False


def porter_stemmer():
	os.chdir('./sub files/')

	from nltk.stem.porter import PorterStemmer
	
	words = numpy.loadtxt('./unique.txt', dtype='S')

	stemmer = PorterStemmer()
	for i in xrange(len(words)):
		words[i] = stemmer.stem(words[i])

	numpy.savetxt('stemmed_porter.txt', numpy.unique(words), fmt="%s")

def snowball_stemmer():
	os.chdir('./sub files/')

	from nltk.stem.snowball import SnowballStemmer
	stemmer = SnowballStemmer("english")

	words = numpy.loadtxt('./unique.txt', dtype='S')

	for i in xrange(len(words)):
		words[i] = stemmer.stem(words[i])

	numpy.savetxt('stemmed_snowball.txt', numpy.unique(words), fmt="%s")

def del_apos_s_words():
	# deleted '\'s' and s word if there non '\'s' or 's' form exists

	words = numpy.loadtxt('./unique.txt', dtype='S')
	with open('./del_apos_s_words.txt', 'w+') as removed:
		for i in xrange(0, len(words)):
			j = i+1
			while j < len(words) and words[i][0:1] == words[j][0:1] and not words[j][-2:] == '00':
				if words[j][-2:] == '\'s' and words[j][0:-2] == words[i]:
					words[j] = words[j]+'00'
				elif words[j][-1:] == 's' and words[j][0:-1] == words[i]:
					words[j] = words[j]+'00'
					break
				j = j+1
			if words[i][-2:] == '00':
				pass
			else:
				removed.write('{0}\n'.format(words[i]))


def get_n_len_suffix(n):
	
	words = numpy.loadtxt('./del_apos_s_words.txt', dtype='S')
	count = defaultdict(int)
	
	for i in words:
		count[i[-n:]] += 1
	
	d_view = [(v,k) for k,v in count.iteritems()]
	d_view.sort(reverse=True)

	file = open('./sub files/suffix/'+ str(n) + '.txt', 'w+')
	for v,k in d_view:
		file.write("{0}: {1}\n".format(k,v))
	file.close()


def get_n_len_prefix(n):
	
	words = numpy.loadtxt('./del_apos_s_words.txt', dtype='S')
	count = defaultdict(int)
	
	for i in words:
		count[i[0:n]] += 1
	
	d_view = [(v,k) for k,v in count.iteritems()]
	d_view.sort(reverse=True)

	file = open('./sub files/prefix/'+ str(n) + '.txt', 'w+')
	for v,k in d_view:
		file.write("{0}: {1}\n".format(k,v))
	file.close()


def get_base_of_wrd_with_suffix(suffix):
	# returns abras if word is abrasion and suffix is ion

	words = numpy.loadtxt('./del_apos_s_words.txt', dtype='S')
	count = 0
	with open( './sub files/suffix/' + suffix +'.txt', 'w+') as removed:
		for i in words:
			if i[-len(suffix):] == suffix:
				removed.write('{0}\n'.format(i[0:-len(suffix)]))
				count += 1
	return count


def intersection(file1, file2):
	# returns words occuring in both file1 and file2
	with open(file1, 'r') as f:
		with open(file2, 'r') as u:

			suffix = file1.strip('.txt').split('_')
			suffix.extend(file2.strip('.txt').split('_'))
			
			with open("_".join(sorted(suffix)) + '.txt', 'w+') as c:
				set1 = set(line.strip() for line in f)
				set2 = set(line.strip() for line in u)
				for i in set1.intersection(set2):
					c.write("{0}\n".format(i))


def words_lenwise():

	words = numpy.loadtxt('./unique.txt', dtype='S')
	count = defaultdict(int)

	for i in words:
		count[len(i)] += 1

	d_view = [ (v,k) for k,v in count.iteritems()]
	d_view.sort(reverse=True)
	
	for v,k in d_view:
		print "{0}: {1}".format(v, k)


def words_btwn(start, end):
	words = numpy.loadtxt('./unique.txt', dtype='S')
	
	w = []
	with open('./testcases_'+ str(start)+ '_'+ str(end)+'.txt', 'w+') as f:
		for i in words:
			i = i.strip()
			if len(i) <=end and len(i) >= start:
				# charlen += len(i)
				# count += 1
				# f.write("{0}\n".format(i))
				w.append(i)
		w = list(set(w))
		w.sort()
		print len(w)
		# json.dump({"words": w}, open('./words_of_len_1_2_3.txt', 'w+'))
	# print count, charlen


def get_letters_that_dont_exists():
	# letters that don't exits in n length words

	import string
	words = numpy.loadtxt('./unique.txt', dtype='S')
	count = defaultdict(set)

	for l in xrange(1, 61):
		count[l] = set(string.lowercase)
	
	for word in words:
		word_len = len(word)
		for x in word:
			if x in count[word_len]:
				count[word_len] = count[word_len].difference(set(x))

	print count


def no_vowel():
	
	words = numpy.loadtxt('./unique.txt', dtype='S')
	max_word_len = 0
	for word in words:
		if not any(char in ['a', 'e', 'i', 'o', 'u'] for char in word) and(len(word)) > 4:
			print word, len(word)
			max_word_len = max(max_word_len, len(word))
	print max_word_len


def get_words_having_apos_at_pos_diff_second_last():
	words = numpy.loadtxt('./unique.txt', dtype='S')

	for i in xrange(len(words)):
		w = words[i]
		if len(w.split('\''))-1 == 0:
			pass
		elif len(w.split('\''))-1 == 1:
			if not w.split('\'')[-1] == 's':
				print words[i]
		elif len(w.split('\''))-1 > 1:
			print words[i]
			# pass


def get_testcases(start, end):
	for i in xrange(start, end):
		r = requests.get('https://hola.org/challenges/word_classifier/testcase/'+str(i),
		 auth=('user', 'pass'))
		with open('./test cases/' + str(j) + '.txt', 'wb') as result:
			json.dump(r.json(), result, indent=2)


def merged_testcases(start, end):
	for i in xrange(start, end):
		filename = 'merged_testcases.txt'
		with open(filename, 'a') as mergerd:
			with open(str(i) +'.txt', 'r') as file:
					lines = json.load(file)	
					for k,v in lines.iteritems():
						mergerd.write("{0},{1}\n".format(k,v))


def get_true_testcases(start, end):
	# find duplicates in testcases

	# rand = [random.randrange(1, 2001) for i in xrange(1, 1001)]

	count = defaultdict(int)

	for i in xrange(start, end):
		with open(str(i) +'.txt', 'r') as file:
			lines = json.load(file)
			for k,v in lines.iteritems():
				if v == True:
					count[k] += 1

	d_view = [ (v,k) for k,v in count.iteritems() ]
	d_view.sort(reverse=True)

	# writes true test cases
	with open('true_testcases.txt', 'w+') as mergerd:
		for v,k in d_view:
			mergerd.write("{0}: {1}\n".format(k,v))

	#


def get_false_testcases(start, end):
	# find duplicates in testcases

	count = defaultdict(int)
	merged = open('false_testcases.txt', 'w+')
	
	for i in xrange(start, end):
		with open(str(i) +'.txt', 'r') as file:
			lines = json.load(file)
			for k,v in lines.iteritems():
				if v == False:
					count[k] += 1

	d_view = [ (v,k) for k,v in count.iteritems() ]
	d_view.sort(reverse=True)

	# writes false testcases
	with open('false_testcases.txt', 'w+')  as mergerd:
		for v,k in d_view:
			merged.write("{0}: {1}\n".format(k,v))


def get_test_cases_according_to_len():

	count = defaultdict(int)
	true_count = defaultdict(int)
	false_count = defaultdict(int)
	
	no_words_length =  './no_words_len.txt'
	
	for i in xrange(1, 2001):
		with open('./test cases/' + str(i) + '.txt', 'r') as file:
			lines = json.load(file)
			for k, v in lines.iteritems():
				count[len(k)] += 1
				if v == False:
					false_count[len(k)] += 1
				elif v == True:
					true_count[len(k)] += 1
	
	d_view = [ (v,k) for k,v in count.iteritems() ]
	d_view.sort(reverse=True)
	for v,k in d_view:
		print "{0}: {1}".format(k,v)

	d_view = [ (v,k) for k,v in true_count.iteritems() ]
	d_view.sort(reverse=True)
	print "true_testcases2"
	for v,k in d_view:
		print "{0}: {1}".format(k,v)

	d_view = [ (v,k) for k,v in false_count.iteritems() ]
	d_view.sort(reverse=True)
	print "false_testcases2"
	for v,k in d_view:
		print "{0}: {1}".format(k,v)


def get_prefix():
	# get 3 letter prefixes
	words = numpy.loadtxt('./unique.txt', dtype='S')
	
	prefix_3 = []
	len_words_2 = []
	
	for i in words:
		if len(i.strip()) == 1:
			# all alphabets
			pass
		
		if len(i.strip()) == 2:
			# check in words list
			len_words_2.append(i.strip())
		
		elif len(i.strip()) == 3:
			i = i.strip()
			if i[-2:] == '\'s':
				# contains all alphabets
				pass
			else:
				prefix_3.append(i[0:3])
		
		elif len(i.strip()) == 4:
			if i[-2:] == '\'s':
				# check in 2 letter words
				pass
			else:
				prefix_3.append(i[0:3])
		
		elif len(i.strip()) > 4:
			# remove \'s'
			prefix_3.append(i[0:3])

	
	prefix_3 = list(set(prefix_3))
	prefix_3.sort()

	len_words_2 = list(set(len_words_2))
	len_words_2.sort()
	
	print len(prefix_3)
	print len(len_words_2)	

	with open('../sat may 21/prefix_3.txt', 'w+') as file:
		json.dump({'prefix_3': prefix_3}, file)

	with open('../sat may 21/words_2.txt', 'w+') as file:
		json.dump({'words_2': len_words_2}, file)


def get_4_prefix():
	words = numpy.loadtxt('../unique.txt', dtype='S')
	prefix = []
	for i in words:
		if len(i) < 4:
			pass
		elif len(i) == 4 and i[-2:] == '\'s':
			pass
		else:
			if i[-2:] == '\'s':
				i = i[0:-2]
			prefix.append(i[0:4])
	
	prefix = list(set(prefix))
	prefix.sort()
	print len(prefix)
	json.dump({"prefix_4": prefix}, open('../sat may 21/prefix_4_drop_aposin5lttr.txt', 'w+'))
	

def get_suffix():
	words = numpy.loadtxt('../unique.txt', dtype='S')
	
	suffix_3 = []
	suffix_4 = []

	for i in words:
		i = i.strip()
		if len(i) <= 4:
			# 1 lttr 2 lttr 3 lttr 4 lttr covered in prefix
			pass
		elif len(i) == 5:
			if i[-2:] == '\'s':
				# covered in 3 prefix
				pass
			else:
				suffix_3.append(i[-3:])
				suffix_4.append(i[-4:])
		elif len(i) >= 6:
			if i[-2:] == '\'s':
				i = i[0:-2]
			suffix_3.append(i[-3:])
			suffix_4.append(i[-4:])

	
	suffix_3 = list(set(suffix_3))
	suffix_3.sort()

	suffix_4 = list(set(suffix_4))
	suffix_4.sort()
	
	with open('../sat may 21/suffix_3.txt', 'w+') as file:
		json.dump({'suffix_3': suffix_3}, file)

	with open('../sat may 21/suffix_4.txt', 'w+') as file:
		json.dump({'suffix_4': suffix_4}, file)

	print len(suffix_3)
	print len(suffix_4)


def compress_4_suffix():
	import pprint
	print "suffixes"
	suff3 = json.load(open('../sat may 21/suffix_3.txt'))
	suff4 = json.load(open("../sat may 21/suffix_4.txt"))

	alone = True
	pairs = defaultdict(list)
	combined = {}
	x = 0
	y = 0
	for i in suff3['suffix_3']:
		for j in suff4['suffix_4']:
			if j[-3:] == i:
				x += 1
				alone = False
				pairs[i].append(j[0:1])
		
		# this can be added in words
		if alone:
			print j
			y += 1
			pairs[j] = []

	# this can be added in words
	for k in suff3['suffix_3']:
		if not k in pairs.keys():
			print k 
			y+=1
			pairs[k] = []
	
	for k in pairs.keys():
		lttr = list(set(pairs[k]))
		lttr.sort()
		combined[k] = ''.join(lttr)

	print x, y
	# print(json.dumps(combined))


def compress_3_4_prefix():
	import pprint
	# print "prefixes"
	pref3 = json.load(open('../sat may 21/prefix_3.txt'))
	pref4 = json.load(open("../sat may 21/prefix_4.txt"))

	alone = True
	pairs = defaultdict(list)
	combined = {}
	words_3 = []

	x = 0
	y = 0
	for i in pref3['prefix_3']:
		for j in pref4['prefix_4']:
			if j[0:3] == i:
				x += 1
				alone = False
				pairs[i].append(j[3:4])
		# this can be added in words
		if alone:
			words_3.append(j)
			y += 1

	# this can be added in words
	for k in pref3['prefix_3']:
		if not k in pairs.keys():
			words_3.append(k)
			y+=1
	
	for k in pairs.keys():
		lttr = list(set(pairs[k]))
		lttr.sort()
		combined[k] = ''.join(lttr)

	json.dump({'words': words_3}, open('../sat may 21/words_3.txt', 'w+'))
	# print x, y
	json.dump({'prefix': combined}, open('../sat may 21/pref3+pref4_drop.txt', 'w+'))


def combine_all_files():
	pref = json.load(open('../sat may 21/pref3+pref4_drop.txt'))['prefix']
	suff = json.load(open("../sat may 21/sub files/suff3+suff4.txt"))
	
	# words_2 = json.load(open("../sat may 21/words_2.txt"))['words']
	words_3 = json.load(open("../sat may 21/sub files/words_3.txt"))['words']
	
	# words_2.extend(words_3)
	words = list(set(words_3))
	words.sort()

	data = {'prfix':pref,'suffx':suff,'wrds': ",".join(words)}
	json.dump(data, open('../sat may 21/words_2removed_drop.txt', 'w+'))


def get_diff_vowel():

	words = numpy.loadtxt('../unique.txt', dtype='S')
	count = defaultdict(int)
	diff = []
	for i in words:
		a = ""
		i = i[4:]
		for x in i:
			if x not in 'bcdfghjklmnpqrstvwxyz\'':
				a += x
		else:
			break
		diff.append(a)
		count[a] += 1

	diff = list(set(diff))
	diff.sort()
	print len(diff)
	d_view = [ (v,k) for k,v in count.iteritems()]
	d_view.sort(reverse=True)
		
	for k,v in count.iteritems():
		diff.append(k)

	# json.dump({"vowels": diff}, open('../sat may 21/mid_456_withoutdroppingSUFF_vowel.txt', 'w+'))


