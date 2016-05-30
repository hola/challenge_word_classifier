var prefix= {}, suffix= {};
var slen  = {}, words = {};

module.exports.test = function test(word){
word=word.toLowerCase();
let len=word.length, t=true, f=false;
let apos=f, pre, suf, fsuf;
if (!(len<=34||len==45||len==58||len==60)) return f;
if (word.slice(-2)=='\'s'){
	apos=t; pre=word.slice(0,-2).slice(0,3);
	suf=word.slice(0,-2).slice(-3); fsuf=word.slice(0,-2).slice(-4,-3); }
else{ pre=word.slice(0,3); suf=word.slice(-3); fsuf=word.slice(-4,-3); }

if (len==1&&/[a-z]/.test(word))return t;
if (len in words)
	if (words[len].indexOf(word)>-1||words[24].indexOf(word)>-1)return t;
	else if (len==2)return f;
if (apos&&len==3)
	if (/[a-z]/.test(word.slice(0,1)))return t;else return f;
if (apos&&len==4)
	if (words[24].indexOf(word.slice(0,2))==-1)return f;else return t;

if (pre in prefix){
	if (prefix[pre].indexOf(len)==-1)return f;
	else{
	if (len==3)return t;if (len==4)return t;if (apos&&len==5)return t;
	if (suf in suffix){
		if (slen[suf].indexOf(len)==-1)return f;
		else if(suffix[suf].indexOf(fsuf)==-1)return f;
	}else return f;}
}else return f;

let napos=word.split('\'').length-1;
if (!(word.slice(-2,-1)=='\'')&&(napos==1||napos>1))return f;
switch (len){case 23:return !/[qjw]/.test(word);case 24:return !/[qkjw]/.test(word);
case 25:return !/[qxkjw]/.test(word);case 26:return !/[gfkjquwvxz]/.test(word);
case 27:return !/[kjqwvz]/.test(word);case 28:return !/[gfkjqpuwvz]/.test(word);
case 29:return !/[gkjqwvz]/.test(word);case 30:return !/[bgkjwvyxz]/.test(word);
case 31:return !/[bgfkjquwvz]/.test(word);case 32:return !/[bgfkjmquwvxz]/.test(word);
case 33:return !/[bgfkjmquwvxz]/.test(word);case 34:return !/[bkjqwvz]/.test(word);
case 45:return !/[bdgfhkjqwyxz]/.test(word);case 58:return !/[kjmquvxz]/.test(word);
}return t;}

module.exports.init = function init(data) {
let d=data.toString().split("\n"), i=0, pair=[];words[2]=[];words[24]=[];
while(i<d.length){
if (i>=4937 && i<=10559){
	pair=d[i].split(" "); prefix[pair[0]]=[];genlen(pair[0],pair[1].split(","),'p');}
if (i>=10561 && i<=10586){
	pair=d[i].split(" "); let l=pair[1].split("|");
	for (let j=0; j<l[0].length; j++)
		words[24].push(pair[0]+l[0][j]);
	for (let j=0; j<l[1].length; j++)
		words[2].push(pair[0]+l[1][j]);}
while (i==10588){
	words[3]=d[i].split(" "); i+=2; words[4]=d[i].split(" "); i+=2;	words[5]=d[i].split(" ");}
if (i>=0 && i<=4935){
	pair=d[i].split(" "); let k=pair[0];slen[k]=[];
	suffix[k]=pair[1].split("");genlen(k,pair[2].split(","),'s');}
++i;}
function genlen(k, len, t){
for (let i=0; i<len.length; i++){
let val=len[i];
if (val.includes('-')){
val=val.split('-');
let s=parseInt(val[0]);
while(s<=parseInt(val[1])){
	if (t=='p') prefix[k].push(s); else slen[k].push(s); ++s;}}
else{
val=parseInt(val);
if (t=='p') prefix[k].push(val); else slen[k].push(val);}}}}