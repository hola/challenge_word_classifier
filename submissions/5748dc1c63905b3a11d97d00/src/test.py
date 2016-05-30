#!/usr/bin/env python3

import json, argparse, gzip, re
import frcode
from collections import defaultdict
import random
# import numpy

def opt_gz_filetype(filename):
	if filename.endswith('.gz'):
		return gzip.open(filename, 'r')
	else:
		return open(filename, 'r')

random.seed(127)

parser = argparse.ArgumentParser('')
parser.add_argument('--words', type=opt_gz_filetype, required=True)
parser.add_argument('--prefixes', type=opt_gz_filetype, required=True)
parser.add_argument('--suffixes', type=opt_gz_filetype, required=True)
parser.add_argument('--testcase', type=opt_gz_filetype, required=True)
parser.add_argument('--lengths', type=opt_gz_filetype)
args = parser.parse_args()

if args.lengths:
	len_probs = { int(l): float(pct)/100 for (l,pct) in [ line.decode('utf-8').rstrip('\n\r').split('\t') for line in args.lengths ] }


prefixes = set(frcode.unfrcode(args.prefixes))
suffixes = set(frcode.unfrcode(args.suffixes))
words = list([ line.rstrip('\n\r').lower() for line in args.words ])
testcase = json.load(args.testcase)

vowel_re = re.compile('[aeiouy]')

if False:
	for word in words:
		if word.endswith("'s"):
			if word[:-2] not in words:
				print("%s is in words, but singular form is not." % (word,))
#		else:
#			if (not word.endswith('s') and not word.endswith('ly') and not word.endswith('ist') and word.upper() != word) and word+"'s" not in words:
#				print("%s is in words, but plural form is not." % (word,))

rates = defaultdict(lambda: 0)
# print(random.randint(0, 1e9))
for word in sorted(testcase.keys()):

	assert(testcase[word] == (word in words))

	s = word
	if len(s)<5 or len(s)>12:
		if args.lengths:
			result = (len(s) in len_probs) and (random.random() < len_probs[len(s)]) # random.choice([True, False])			
		else:
			result = False
	else:
		s = s.lower()
		if s.endswith("'s"):
			s = s[:-2]
		s = vowel_re.sub('', s)
		result = (s[:4] in prefixes and s[2:] in suffixes)
	
	# result = random.choice([True, False])
#	if (result != (word in words)):
#		print(word, word in words, result)

	rates[ ((word in words), result) ] += 1

for key in rates:
	print(key, rates[key])
