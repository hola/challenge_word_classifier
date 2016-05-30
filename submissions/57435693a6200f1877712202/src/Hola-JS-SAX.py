#!/usr/bin/python
# -*- coding: utf-8 -*-

import json
from os import walk
Bucket=516623
Buffer_size=64579
input_file_name="words.txt"
hash_file="data"
basic=dict()
hashB=bytearray([0]*Bucket)
## Common False Negtive Removal
CFNR=1
## Cut according to word Length
CLEN=15
def removeHF(k):
    l=len(k)
    while l>2:
        l=0
        p=k[-2:]
        if (p=="'s" or p=="ed" or p=="es" or p=="er" or p=="ly"):
            k=k[:-2]
            l=len(k)
        if len(k)>3 and k[-3:]=="ing":
            k=k[:-3]
            l=len(k)
    l=len(k)
    while l>2:
        l=0
        p=k[:2]
        if (p=="un" or p=="co" or p=="re" or p=="in" or p=="de"):
            k=k[2:]
            l=len(k)
        if len(k)>3 and (k[:3]=="non" or k[:3]=="pre" or k[:3]=="pro"):
            k=k[3:]
            l=len(k)    
    return k

def SAX(p):
    h = 0
    for c in p:
        h ^= ( (h << 5) + (h >> 2) + ord(c) )
        h &=0x7FFFFFFF
    return h

### --- reading the input file
print "Scan words.txt"  
fh=open(input_file_name,'r')
indexScan=0
for line in fh:                             #scan lines in words.txt
    indexScan+=1
    k=line.strip().lower()
    if len(k)>=CLEN: continue
    k=removeHF(k)
    l2=SAX(k)
    l3=l2%Bucket                            #extract the modulus in bits
    basic[k]=basic.get(k,l3)                #for debuging 
    hashB[l3]=1                             #build crc filter dictionary
fh.close()

print "Unique words in input file:", len(basic)," (from  total ",indexScan,"words)"

print "building statistics"

#each testN directory holds 1000 testcases.
my="C:\Hola\\test"
CRC_F=dict()
CRC_T=dict()

for i in range(1,11):
    mypath=my+str(i).strip()+"\\"    
    f = []
    for (mypath, dirnames, filenames) in walk(mypath):
        f.extend(filenames)
        break
    for file1 in f:
        with open(mypath+file1) as json_file:
            t = json.load(json_file)
        for k , v in t.items():
            if len(k)>=CLEN: continue
            k=removeHF(k)
            l2=SAX(k)
            l3=l2%Bucket
            if v==False:
                CRC_F[l3]=CRC_F.get(l3,0)+1
            else:
                CRC_T[l3]=CRC_T.get(l3,0)+1

Flist=[]
for k,v in CRC_F.items():                       #Only add false words which have
    if CRC_T.get(k,0)>0:                        #a true counterpart
        v=v-CRC_T[k]                            #False count minus True count of L3
        if v>CFNR: Flist.append(int(k))

### --- building main hash filter
print
print "Building the Data file"
fh=open(hash_file,'wb')
hashF=bytearray([0]*Buffer_size)                 
byte=bit=0
FR=c=0
l=len(Flist)

for i in range(0,Bucket):               #build the hash filter
    if hashB[i]==1:
        c+=1
        if (i in Flist):
            FR+=1
            Flist.remove(i)
            continue
        byte=i/8
        bit=i%8
        hashF[byte]+=pow(2,bit)

fh.write(hashF)
fh.close()
print "# of 1 is hash filter:",c,"of",Bucket
print "Common False SAX's removed:",FR,"of",l

