### HOLA dictionary compression competition.

It was obvious from the beginning that machine learning is not thebest suit for this task. In short, machine learning is to build a dictionary from the huge reference data, as opposed to this, here we already have the dictionary, what we can do is just to try and compress it better.

Learning patterns from the false words is also very difficult, because they are generated randomly.

So here I utilize very simple pattern:

1. check if the word is longer than 15 characters or exactly 4, consider false.
2. check if the word has 4+ consonants in a row, consider false.
3. filter out garbage sequences two and three characters long.
4. use a good hash function and distribute true words in a bloom filter hash table.
5. do some magic.

Hash table is saved compressed with arithmetic encoder.

Garbage sequences are scanned in false words and compared with true words, some simple euristics are applied manually. Example garbage sequences are: qzw, qzs, qzx, qze.

Magic is a random learning hash function. Characters in a tested word are replaced with others improving hash distribution. This is true machine learning, but my notebook is too weak to do enough runs, so I only found few good mutations. Also I knew about the competition only two days before the deadline. Here is the resulting magic function:

```js
do_magic=function(a){
	var i,A="',s,r,ng,ly,un,at,ni,an,al,ut,ha,al,am,ea,ve,co,il,pi,og,po,ep,iv".split(','),
	B=",,k,w,,,mg,nk,dn,ol,qv,1z,js,bz,'o,zd,cj,jt,bp,us,j1,nx,h1".split(',')
	for(i=0;i<A.length;i++)a=a.replace(new RegExp(A[i],'g'),B[i])
	return a
}
```

