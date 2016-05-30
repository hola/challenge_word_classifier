import csv
import mmh3
from bitarray import bitarray

size = 511111;
bit_array = bitarray(size)
bit_array.setall(0)

def mapf(url): 
	b1 = (mmh3.hash(url, 41) & 0xffffffff) % size
	bit_array[b1]=1

with open('dict.txt') as f:
    lines = f.readlines()
    for line in lines:
    	word = line.split("\n")[0].lower()
    	mapf(word)


f=open("bloom_filter_new.txt","wb")
f.write(bit_array)
f.close()

print "done";
