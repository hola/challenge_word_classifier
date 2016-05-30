#!/usr/bin/node

var fs = require('fs');
var readline = require('readline');
var zlib = require('zlib');
var format = require('util').format;

var args = process.argv.slice(2);
var filename = args[0];
var stream = fs.createReadStream(filename);
if (filename.indexOf(".gz") !== -1) {
  stream = stream.pipe(zlib.createUnzip());
}

/** THIS IS A MINIFIED VERSION OF PorterStemmer.js */
var stemmer=function(){var a={ational:"ate",tional:"tion",enci:"ence",anci:"ance",izer:"ize",bli:"ble",alli:"al",entli:"ent",eli:"e",ousli:"ous",ization:"ize",ation:"ate",ator:"ate",alism:"al",iveness:"ive",fulness:"ful",ousness:"ous",aliti:"al",iviti:"ive",biliti:"ble",logi:"log"},b={icate:"ic",ative:"",alize:"al",iciti:"ic",ical:"ic",ful:"",ness:""},c="[^aeiou]",d="[aeiouy]",e=c+"[^aeiouy]*",f=d+"[aeiou]*",g="^("+e+")?"+f+e,h="^("+e+")?"+f+e+"("+f+")?$",i="^("+e+")?"+f+e+f+e,j="^("+e+")?"+d;return function(c){var f,k,l,m,n,o,p;if(c.length<3)return c;if(l=c.substr(0,1),"y"==l&&(c=l.toUpperCase()+c.substr(1)),m=/^(.+?)(ss|i)es$/,n=/^(.+?)([^s])s$/,m.test(c)?c=c.replace(m,"$1$2"):n.test(c)&&(c=c.replace(n,"$1$2")),m=/^(.+?)eed$/,n=/^(.+?)(ed|ing)$/,m.test(c)){var r=m.exec(c);m=new RegExp(g),m.test(r[1])&&(m=/.$/,c=c.replace(m,""))}else if(n.test(c)){var r=n.exec(c);f=r[1],n=new RegExp(j),n.test(f)&&(c=f,n=/(at|bl|iz)$/,o=new RegExp("([^aeiouylsz])\\1$"),p=new RegExp("^"+e+d+"[^aeiouwxy]$"),n.test(c)?c+="e":o.test(c)?(m=/.$/,c=c.replace(m,"")):p.test(c)&&(c+="e"))}if(m=/^(.+?)y$/,m.test(c)){var r=m.exec(c);f=r[1],m=new RegExp(j),m.test(f)&&(c=f+"i")}if(m=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,m.test(c)){var r=m.exec(c);f=r[1],k=r[2],m=new RegExp(g),m.test(f)&&(c=f+a[k])}if(m=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,m.test(c)){var r=m.exec(c);f=r[1],k=r[2],m=new RegExp(g),m.test(f)&&(c=f+b[k])}if(m=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,n=/^(.+?)(s|t)(ion)$/,m.test(c)){var r=m.exec(c);f=r[1],m=new RegExp(i),m.test(f)&&(c=f)}else if(n.test(c)){var r=n.exec(c);f=r[1]+r[2],n=new RegExp(i),n.test(f)&&(c=f)}if(m=/^(.+?)e$/,m.test(c)){var r=m.exec(c);f=r[1],m=new RegExp(i),n=new RegExp(h),o=new RegExp("^"+e+d+"[^aeiouwxy]$"),(m.test(f)||n.test(f)&&!o.test(f))&&(c=f)}return m=/ll$/,n=new RegExp(i),m.test(c)&&n.test(c)&&(m=/.$/,c=c.replace(m,"")),"y"==l&&(c=l.toLowerCase()+c.substr(1)),c}}();

var total = 0;
var set = {};

function stem(word) {
  if (word.endsWith("'s")) {
    word = word.substring(0,word.length-2);
  }
  word = stemmer(word);
  return word;
}

function next(line) {
  var ps = line.split(' ');
  var y = (ps[0] == '1');
  var word = ps[1];
  console.log(ps[0] + ' ' + stem(word));
  total += 1;
}

function finish () {
}

readline.createInterface({input: stream, terminal: false}).on('line', next).on('close', finish);

