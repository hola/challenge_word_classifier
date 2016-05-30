'use strict';
/* The license for the Stemmer is covered in https://github.com/kristopolous/Porter-Stemmer/blob/master/BSD-License.txt and is incorporated herein by reference.*/
var stemmer=function(){function h(){}function i(){console.log(Array.prototype.slice.call(arguments).join(" "))}var j={ational:"ate",tional:"tion",enci:"ence",anci:"ance",izer:"ize",bli:"ble",alli:"al",entli:"ent",eli:"e",ousli:"ous",ization:"ize",ation:"ate",ator:"ate",alism:"al",iveness:"ive",fulness:"ful",ousness:"ous",aliti:"al",iviti:"ive",biliti:"ble",logi:"log"},k={icate:"ic",ative:"",alize:"al",iciti:"ic",ical:"ic",ful:"",ness:""};return function(a,l){var d,b,g,c,f,e;e=l?i:h;if(3>a.length)return a;
g=a.substr(0,1);"y"==g&&(a=g.toUpperCase()+a.substr(1));c=/^(.+?)(ss|i)es$/;b=/^(.+?)([^s])s$/;c.test(a)?(a=a.replace(c,"$1$2"),e("1a",c,a)):b.test(a)&&(a=a.replace(b,"$1$2"),e("1a",b,a));c=/^(.+?)eed$/;b=/^(.+?)(ed|ing)$/;c.test(a)?(b=c.exec(a),c=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,c.test(b[1])&&(c=/.$/,a=a.replace(c,""),e("1b",c,a))):b.test(a)&&(b=b.exec(a),d=b[1],b=/^([^aeiou][^aeiouy]*)?[aeiouy]/,b.test(d)&&(a=d,e("1b",b,a),b=/(at|bl|iz)$/,f=/([^aeiouylsz])\1$/,d=/^[^aeiou][^aeiouy]*[aeiouy][^aeiouwxy]$/,
b.test(a)?(a+="e",e("1b",b,a)):f.test(a)?(c=/.$/,a=a.replace(c,""),e("1b",f,a)):d.test(a)&&(a+="e",e("1b",d,a))));c=/^(.*[aeiouy].*)y$/;c.test(a)&&(b=c.exec(a),d=b[1],a=d+"i",e("1c",c,a));c=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;c.test(a)&&(b=c.exec(a),d=b[1],b=b[2],c=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,c.test(d)&&(a=d+j[b],e("2",c,a)));c=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
c.test(a)&&(b=c.exec(a),d=b[1],b=b[2],c=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,c.test(d)&&(a=d+k[b],e("3",c,a)));c=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;b=/^(.+?)(s|t)(ion)$/;c.test(a)?(b=c.exec(a),d=b[1],c=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,c.test(d)&&(a=d,e("4",c,a))):b.test(a)&&(b=b.exec(a),d=b[1]+b[2],b=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,
b.test(d)&&(a=d,e("4",b,a)));c=/^(.+?)e$/;if(c.test(a)&&(b=c.exec(a),d=b[1],c=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/,b=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*([aeiouy][aeiou]*)?$/,f=/^[^aeiou][^aeiouy]*[aeiouy][^aeiouwxy]$/,c.test(d)||b.test(d)&&!f.test(d)))a=d,e("5",c,b,f,a);c=/ll$/;b=/^([^aeiou][^aeiouy]*)?[aeiouy][aeiou]*[^aeiou][^aeiouy]*[aeiouy][aeiou]*[^aeiou][^aeiouy]*/;c.test(a)&&b.test(a)&&(c=/.$/,a=a.replace(c,""),e("5",
c,b,a));"y"==g&&(a=g.toLowerCase()+a.substr(1));return a}}();

var size = 502433;
var seeds = [342];
var bits = [];

function testBit(i) {
  return (bits[Math.floor(i / 32)] >>> (i % 32)) & 1;
}

function hash(str, seed) {
  var result = 1;
  for (var i = 0; i < str.length; ++i) {
    result = (seed * result + str.charCodeAt(i)) & 0xFFFFFFFF;
  }
  return Math.abs(result) % size;
}

function test(str) {
  for (var i = 0; i < seeds.length; i++) {
    var seed = seeds[i];
    if (!testBit(hash(str, seed) % size)) {
      return false;
    }
  }
  return true;
}

exports.init = function(data) {
  for (var i = 0; i < data.length / 4; i++) {
    bits[i] = data.readInt32BE(i*4);
  }
};

exports.test = function(word) {
  if (word.length === 1 || word.length === 2) {
    return true;
  }
  if (word.length >= 16) {
    return false;
  }
  if (word.indexOf("''") !== -1) {
    return false;
  }
  if (word.endsWith('\'s')) {
    word = word.slice(0, -2);
  }
  if (word.endsWith('ed')) {
    word = word.slice(0, -2);
  }
  if (word.endsWith('es')) {
    word = word.slice(0, -2);
  }
  if (word.endsWith('s')) {
    if (['a', 'e', 'i', 'o', 'u', 'y'].indexOf(word.charAt(word.length - 2)) === -1) {
      word = word.slice(0, -1);
    }
  }
  return test(stemmer(word));
};