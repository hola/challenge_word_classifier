from bitarray import bitarray
from config import *

table = bitarray(HASH_SIZE)
table.setall(VALUE_ZERO)

def hash_func(w):
  h = 7
  for i in range(0, len(w)):
    h = 31 * h + ord(w[i])
  return h

with open(MODIFIED_WORDS_FILE) as f:
  for line in f:
    word = line.strip()
    hash_value = hash_func(word) % HASH_SIZE
    table[hash_value] = VALUE_ONE

with open(BIT_FILE, 'w') as f:
  table.tofile(f)
