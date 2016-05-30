#!/usr/bin/python

import fileinput;
import struct;

from Hash import hash;
import sys;

output = sys.argv[1];
filename = sys.argv[2];
n = int(sys.argv[3])
size = int(sys.argv[4]);
k = int(sys.argv[5]);

def bloom(size,k):
  m = size*8;
  array = [0]*m;
  ret = {};

  def test(str):
    for i in hash(str,m,k):
      if array[i] == 0:
        return False;
    return True;

  def add(str):
    ret = True;
    for i in hash(str,m,k):
      if array[i] == 0:
        ret = False;
      array[i] = 1;
    return ret;

  def write (filename):
    bytes = [0]*size;
    j = 0;
    l = 0;
    f = open(filename, 'wb');
    for i in range(0,m):
      bytes[j] = bytes[j]*2 + array[i];
      l += 1;
      if l == 8:
        l = 0;
        j += 1;
    bytes = [size / 256, size % 256, k] + bytes;
    for b in bytes:
      f.write(chr(b));
    f.flush();
    f.close();
   
  def dat():
    return array;

  test.add = add;
  test.test = test;
  test.array = array;
  test.size = size;
  test.write = write;

  return test;

b = bloom(size,k);

dup = 0; 
fail = 0;
fp = 0;

try:
  i = 0;
  dup = 0;
  for line in fileinput.input(filename):
    [cnt, word] = line.strip().split(' ');
    if b.add(word):
      dup += 1;
    i += 1;
    if i == n:
      fileinput.close();
      break;
except KeyboardInterrupt:
  pass;

try:
  i = 0;
  fail = 0;
  for line in fileinput.input(filename):
    [cnt, word] = line.strip().split(' ');
    if not b.test(word):
      fail += 1;
    i += 1;
    if i == n:
      fileinput.close();
      break;
except KeyboardInterrupt:
  pass;

try:
  i = 0;
  dup = 0;
  for line in fileinput.input(filename):
    [cnt, word] = line.strip().split(' ');
    if b.test(word + 'abababababab'):
      fp += 1;
    i += 1;
    if i == n:
      fileinput.close();
      break;
except KeyboardInterrupt:
  pass;


b.write(output);
print "inserted: %d" % n;
print "duplicated: %d (%.4f%%)" % (dup, 1.0*dup/n);
print "failed: %d (%.4f%%)" % (fail, 1.0*fail/n);
print "fp: %d (%.4f%%)" % (fp, 1.0*fp/n);

