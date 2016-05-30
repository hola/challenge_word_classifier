import sys
from config import *

word_set = set()
with open(WORDS_FILE) as f:
  for line in f:
    word = line.strip().lower()
    word_set.add(word)

# Nouns with apostrophe
apos_words = set(w for w in word_set if w.endswith('\'s') and not w.endswith('\'s\'s'))
for w in apos_words:
  word_base = w[:-2]
  if word_base in word_set:
    word_set.remove(word_base)
    word_set.remove(w)

    if word_base.endswith('s'):
      plural_word = word_base + 'es'
    else:
      plural_word = word_base + 's'
    if plural_word in word_set:
      # Represent "word" and "word's" and "word(e)s" as "word="
      word_set.remove(plural_word)
      new_word = word_base + "="
      word_set.add(new_word)
    else:
      # Represent "word" and "word's" as "word+"
      new_word = word_base + "+"
      word_set.add(new_word)

# Verbs
ed_words = set(w for w in word_set if w.endswith('ed'))
verb_suffix = set(['s', 'ed', 'ing', 'ingly'])
e_verb_suffix = verb_suffix | set(['es', 'ion', 'ional', 'ionally', 'ions']) - set(['s'])

for w in ed_words:
  word_base = w[:-2]
  e_word = word_base + 'e'
  ing_word = word_base + 'ing'

  if ing_word in word_set:
    # Most likely a verb: remove all derived forms
    suffix = e_verb_suffix
    if word_base in word_set and e_word not in word_set:
      suffix = verb_suffix
    for s in suffix:
      new_word = (word_base + s)
      if new_word in word_set:
        word_set.remove(new_word)

word_list = list(word_set)
word_list.sort()

nf = open(MODIFIED_WORDS_FILE, 'w')
for w in word_list:
  nf.write('%s\n' % (w))
nf.close()
