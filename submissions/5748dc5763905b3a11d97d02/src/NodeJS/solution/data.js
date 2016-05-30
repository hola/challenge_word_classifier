dataPos+=3;
let readln=function(){
let pos=data.indexOf('\n',dataPos);
let s=data.toString('utf8',dataPos,pos);
dataPos=pos+1;
return s;
}
let suffixes={};
while(1){
let s=readln();
if(!s)break;
suffixes[s]=1;
}
let prefixes={};
while(1){
let s=readln();
if(!s)break;
prefixes[s]=1;
}
let isVowel=function(word,pos){
let c=word[pos];
return /[aeiou]/.test(c)||c==='y'&&(pos==0||!isVowel(word,pos-1));
}
let hasBadConseq=function(word){
let q=0;
let prev=0;
let mq=0;
let qq={1:0,2:0,3:0,4:0};
for(let i=0;i<=word.length;i++){
  let v=i==word.length?!prev:isVowel(word,i);
  if(i==0||prev==v)q++;
  else{
    if(mq<q)mq=q;
    qq[q]++;
    q=1;
  }
  prev=v;
}
return mq>4||qq[4]>1||qq[4]+qq[3]>2||qq[4]+qq[3]+qq[2]>5;
}
let m=function(word,s,e){
let m=0;
let prev=0;
for(let i=s;i<e;i++){
  let v=isVowel(word,i);
  if(prev!=v){
    m++;
    prev=v;
  }
}
return m>>1;
}
let cutStem=function(word){
let iter=0;
while(1){
  let cut=0;
  for(let i=0;i<word.length;i++){
    let suffix=word.substr(i,word.length-i);
    let removeDoubles=0;
    if(suffix==='s'&&(iter>0||i>0&&word[i-1]==='s'))continue;
    if(suffix==='ing'||suffix==='ed')removeDoubles=1;
    if(/^([ia]bl|iz|is|at)/.test(suffix))removeDoubles=1;
    let mb=/^(s|ful|less)$/.test(suffix)?1:2;
    if(suffixes[suffix]){
      if(m(word,0,i)<mb)continue;
      word=word.substr(0,i-(removeDoubles&&i>1&&word[i-1]===word[i-2]&&/[bdfglmnprt]/.test(word[i-1])?1:0));
      cut=1;
      break;
    }
  }
  if(!cut)break;
  iter++;
}
while(1){
  let cut=0;
  for(let i=word.length;i>0;i--){
    let prefix=word.substr(0,i);
    if(prefixes[prefix]){
      if(m(word,i,word.length)<2)continue;
      word=word.substr(i,word.length-i);
      cut=1;
      break;
    }
  }
  if(!cut)break;
}
return word;
}
let bitSet=function(){
let bits=[];
function test(index){
  return (bits[index>>5]>>>(index&31))&1;
}
function set(index){
  bits[index>>5]|=1<<(index&31);
}
return {test:test,set:set,bits:bits};
}
let bloom=function(size){
let bits=bitSet();
function hash(word){
  let h=0;
  for(let i=0;i<word.length;i++)h=(h*31+word.charCodeAt(i))&0xFFFFFFFF;
  return h;
}
function mod(a,b){
  a%=b;
  if(a<0)a+=b;
  return a;
}
function test(word){
  return bits.test(mod(hash(word),size));
}
return {test:test,bits:bits};
}
let filter=bloom(498780);
for(let i=0;dataPos<data.length;dataPos+=4,i++)filter.bits.bits[i]=data.readInt32LE(dataPos);
let visited={};
let visitedSize=0;
module.exports.test=function(word){
if(word.endsWith('\'s'))word=word.substring(0,word.length-2);
if(word.indexOf('\'')>=0)return 0;
if(word.length<3)return 1;
if(word.length>16)return 0;
word=cutStem(word);
if(!filter.test(word))return 0;
let vq=visited[word];
if(!vq)vq=0;
visited[word]=vq+1;
visitedSize++;
if(vq)return !prefixes[word]&&vq>(visitedSize<2500000?0:visitedSize<4500000?1:visitedSize<6000000?2:visitedSize<7000000?3:4);
if(word.length>13||visitedSize>425245||hasBadConseq(word))return 0;
let mb=m(word,0,word.length);
return mb>0&&mb<6&&!/([^acdeghilmnoprstuwy]k|[^abdefghiklmnoprstuy]w|j([^acdehiklnoprsuy]|$)|q([^aeiou]|$)|y[^abcdefghiklmnoprstuvwx])/.test(word);
}
ET
abilities
ability
able
abled
abler
ablies
abling
ably
al
ance
ancies
ancy
ant
ate
ated
ating
ation
ative
ativities
ativity
ator
bilities
bility
ble
bled
bler
blies
bling
bly
e
ed
ence
encies
ency
ent
er
ful
ibilities
ibility
ible
ibled
ibler
iblies
ibling
ibly
ic
ies
ing
isabilities
isability
isable
isabled
isabler
isablies
isabling
isably
isation
ise
ised
iser
isibilities
isibility
isible
isibled
isibler
isiblies
isibling
isibly
ising
ism
ist
ities
ity
ive
ivities
ivity
izabilities
izability
izable
izabled
izabler
izablies
izabling
izably
ization
ize
ized
izer
izibilities
izibility
izible
izibled
izibler
iziblies
izibling
izibly
izing
less
ly
ment
ness
ou
ous
s
y

after
amphi
ante
back
circum
counter
cryo
deuter
electro
extra
fore
gyro
hemi
hypo
infra
inter
intra
intro
iso
magn
megalo
meta
mis
multi
non
omni
ortho
out
over
photo
post
preter
proto
pseudo
retro
self
semi
socio
sub
super
supra
syl
trans
ultra
un
under
up
vice

