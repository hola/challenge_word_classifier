#!/usr/bin/python

import hashlib;
import fileinput;
import struct;

import sys;

def write (filename, array):
  size = len(array) / 8;
  if (size*8 < len(array)):
    size += 1;
  bytes = [0]*size;
  j = 0;
  l = 0;
  f = open(filename, 'wb');
  for i in range(0,len(array)):
    bytes[j] = bytes[j]*2 + array[i];
    l += 1;
    if l == 8:
      l = 0;
      j += 1;
  #print bytes;
  for b in bytes:
    f.write(chr(b));
  f.flush();
  f.close();
   
filename = sys.argv[1];
output = sys.argv[2];
pct = float(sys.argv[3]);

array = [0]*(26*26*26);
for line in fileinput.input(filename):
  [code, pos, neg] = map(int, line.strip().split(' '));
  if (1.0*pos/(pos + neg) > pct):
    array[code] = 1;

print "Total: %d" % sum(array);

write(output, array);

