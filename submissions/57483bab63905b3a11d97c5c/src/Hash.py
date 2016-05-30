#!/usr/bin/python

def code(c):
  return 26 if c < 0 else c;

def hash(word,m=4294967296,k=1):
  ret = 536870911 + 131071 * len(word);
  for i in range(0,len(word)):
    c = code(ord(word[i]) - 97);
    ret = (ret * 127 + 131071 * c + i) % 2147483647;
  x = [0]*k;
  for i in range(0,k):
    x[i] = ret % m; #(ret << 13 % 2147483647) % m;
    ret = (ret * 127) % 2147483647;
  return x;


