#!/usr/bin/python
# -*- coding: utf-8 -*-

import json
import binascii
Bucket=515464
Buffer_size=64433
input_file_name="words.txt"
hash_file="data"
basic=dict()
hashB=bytearray([0]*Bucket)
## Common False Negative Ratio
CFNR=1
## Cut words from Length
CLEN=15
## Function for searching known Suffixes and Prefixes
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

### --- reading the input file
print "Scan words.txt"
fh=open(input_file_name,'r')
indexScan=0
for line in fh:                             #scan lines in words.txt
    indexScan+=1
    k=line.strip().lower()
    if len(k)>=CLEN: continue
    k=removeHF(k)
    l2=binascii.crc32(k)&0x0FFFFFFFF
    l3=l2%Bucket                            #extract the modulus in bits
    basic[k]=basic.get(k,l3)                #for debuging unique word-crc k-v 
    hashB[l3]=1                             #build crc filter dictionary
fh.close()
print "Unique words in input file:", len(basic)," (from  total ",indexScan,"words)"
print
### --- scanning prefixes and suffixes
print "Evaluating popular prefixes and suffixes"
HCT=dict()
FCT=dict()
for test,v in basic.items():
    l=len(test)
    if l==1: continue
    HCT[test[0]+test[1]]=HCT.get(test[0]+test[1],0)+1
    FCT[test[l-2]+test[l-1]]=FCT.get(test[l-2]+test[l-1],0)+1
HCTlist=[]
FCTlist=[]
###
for k,v in HCT.items():
    if v>2: HCTlist.append((v,k))
HCTlist.sort(reverse=True)
l=len(HCTlist)
if l>20:l=20
###
for k,v in FCT.items():
    if v>2: FCTlist.append((v,k))
FCTlist.sort(reverse=True)
###
print '           Cnt Hdr    Cnt Ftr '
print '----------+----------+----------+'
for i in range(0,l):
    print '#',i+1,':\t  ',HCTlist[i],'    ',FCTlist[i]
print
### --- build False Negative BITs
print "building statistics"
from os import walk
my="C:\Users\\aqrav\Downloads\challenge_word_classifier-master\challenge_word_classifier-master\Works\\test"
CRC_F=dict()
CRC_T=dict()
for i in range(1,6):
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
            l2=binascii.crc32(k)&0x0FFFFFFFF
            l3=l2%Bucket
            if v==False:
                CRC_F[l3]=CRC_F.get(l3,0)+1
            else:
                CRC_T[l3]=CRC_T.get(l3,0)+1
## build the CFNR array
Flist=[]                                        #Name of CFNR array
for k,v in CRC_F.items():                       #Only add false words which have
    if CRC_T.get(k,0)>0:                        #a true counterpart
        v=v-CRC_T[k]                            #False count minus True count of L3
        if v>CFNR: Flist.append(int(k))

### --- building "data"
print
print "Build 'data' file"
fh=open(hash_file,'wb')
hashF=bytearray([0]*Buffer_size)                 
byte=bit=0
FR=cnt=0
l=len(Flist)
for i in range(0,Bucket):               #build the hash binary array
    if hashB[i]==1:
        cnt+=1
        if (i in Flist):
            FR+=1
            Flist.remove(i)
            continue
        byte=i/8
        bit=i%8
        hashF[byte]+=pow(2,bit)
fh.write(hashF)
fh.close()
print "population size in filter:",cnt,"of",Bucket
print "Common False CRC's removed:",FR,"of",l
