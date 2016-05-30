((function() {

/** Convert buffer to bit array */
function toArray(buf,off,len) {
  var array = new Array(len*8);
  for (var i = 0; i < len; i++) {
    for (var j = 0; j < 8; j++) {
      array[8*i+j] = (buf[off + i] >> (7 - j)) & 1;
    }
  }
  return array;
}

/* Convert char to integer code */
function code(c) {
  var i = c.charCodeAt() - 97;
  return i < 0 ? 26 : i;
}

/** THIS IS A MINIFIED VERSION OF PorterStemmer.js */
var stemmer=function(){var a={ational:"ate",tional:"tion",enci:"ence",anci:"ance",izer:"ize",bli:"ble",alli:"al",entli:"ent",eli:"e",ousli:"ous",ization:"ize",ation:"ate",ator:"ate",alism:"al",iveness:"ive",fulness:"ful",ousness:"ous",aliti:"al",iviti:"ive",biliti:"ble",logi:"log"},b={icate:"ic",ative:"",alize:"al",iciti:"ic",ical:"ic",ful:"",ness:""},c="[^aeiou]",d="[aeiouy]",e=c+"[^aeiouy]*",f=d+"[aeiou]*",g="^("+e+")?"+f+e,h="^("+e+")?"+f+e+"("+f+")?$",i="^("+e+")?"+f+e+f+e,j="^("+e+")?"+d;return function(c){var f,k,l,m,n,o,p;if(c.length<3)return c;if(l=c.substr(0,1),"y"==l&&(c=l.toUpperCase()+c.substr(1)),m=/^(.+?)(ss|i)es$/,n=/^(.+?)([^s])s$/,m.test(c)?c=c.replace(m,"$1$2"):n.test(c)&&(c=c.replace(n,"$1$2")),m=/^(.+?)eed$/,n=/^(.+?)(ed|ing)$/,m.test(c)){var r=m.exec(c);m=new RegExp(g),m.test(r[1])&&(m=/.$/,c=c.replace(m,""))}else if(n.test(c)){var r=n.exec(c);f=r[1],n=new RegExp(j),n.test(f)&&(c=f,n=/(at|bl|iz)$/,o=new RegExp("([^aeiouylsz])\\1$"),p=new RegExp("^"+e+d+"[^aeiouwxy]$"),n.test(c)?c+="e":o.test(c)?(m=/.$/,c=c.replace(m,"")):p.test(c)&&(c+="e"))}if(m=/^(.+?)y$/,m.test(c)){var r=m.exec(c);f=r[1],m=new RegExp(j),m.test(f)&&(c=f+"i")}if(m=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,m.test(c)){var r=m.exec(c);f=r[1],k=r[2],m=new RegExp(g),m.test(f)&&(c=f+a[k])}if(m=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,m.test(c)){var r=m.exec(c);f=r[1],k=r[2],m=new RegExp(g),m.test(f)&&(c=f+b[k])}if(m=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,n=/^(.+?)(s|t)(ion)$/,m.test(c)){var r=m.exec(c);f=r[1],m=new RegExp(i),m.test(f)&&(c=f)}else if(n.test(c)){var r=n.exec(c);f=r[1]+r[2],n=new RegExp(i),n.test(f)&&(c=f)}if(m=/^(.+?)e$/,m.test(c)){var r=m.exec(c);f=r[1],m=new RegExp(i),n=new RegExp(h),o=new RegExp("^"+e+d+"[^aeiouwxy]$"),(m.test(f)||n.test(f)&&!o.test(f))&&(c=f)}return m=/ll$/,n=new RegExp(i),m.test(c)&&n.test(c)&&(m=/.$/,c=c.replace(m,"")),"y"==l&&(c=l.toLowerCase()+c.substr(1)),c}}();

/**
    Stemming for data compression:
      1. remove suffix 's
      2. apply porter stemmer
      3. remove prefixes
      4. remove suffixes
*/
function stem(word) {
  word = word.replace(/'s$/,'');
  word = stemmer(word);
  var suf = 'inter,super,under,micro,hyper,trans,photo,hydro,multi,proto,tetra,ultra,neuro,macro,ortho,extra,radio,intra,phyto,retro,osteo,supra,angio,infra,benzo,over,anti,semi,poly,para,mono,peri,post,fore,auto,hypo,arch,meta,tele,endo,meso,hemi,pyro,ante,demi,holo,cyto,thio,hemo,non,pre,pro,dis,sub,par,tri,mis,met,uni,pan,epi,mal,ana,syn,iso,apo,bio,geo,neo,zoo,oxy,myo,un,fo,bi,eu,ir,mc'.split(',');
  for (var i = 0; i < suf.length; i++) {
    if (word.startsWith(suf[i]) & (word.length > suf[i].length + 3)) {
      word = word.substr(suf[i].length);
    }
  }
  suf = 'ingli,graph,atori,oscop,board,proof,otomi,sburg,mania,antli,ifer,iest,ngli,less,ship,elik,form,land,ogen,fish,ward,metr,town,hood,vers,back,hous,trop,duct,loid,tail,evil,bird,uria,shli,esqu,root,fer,ger,ier,est,vil,oid,man,lik,met,ean,ili,cop,som,dom,wai,bal,typ,par,wel,mor,pos,wis,os,er,ea,li,we'.split(',');
  for (var i = 0; i < suf.length; i++) {
    if (word.endsWith(suf[i]) & (word.length > suf[i].length + 3)) {
      word = word.substr(0, word.length - suf[i].length);
    }
  }
  return word;
}

function hash(word,m,k) {
  var ret = 536870911 + 131071 * word.length;
  for (var i = 0; i < word.length; i++) {
    var c = code(word[i]);
    ret = (ret * 127 + 131071 * c + i) % 2147483647;
  }
  var x = [];
  for (var i = 0; i < k; i++) {
    x[i] = ret % m;
    ret = (ret * 127) % 2147483647;
  }
  return x;
}

function readBloom(buf,off) {
  var m = buf.readUInt16BE(off) * 8;
  var k = buf.readInt8(off + 2);
  var size = m / 8;
  var array = toArray(buf, off + 3, size);
  return function(word) {
    var h = hash(word,m,k);
    for (var i = 0; i < k; i++) {
      if (!array[h[i]]) {
        return false;
      }
    }
    return true;
  };
}

function readNgr(buf,off) {
  var size = buf.readUInt16BE(off);
  var array = toArray(buf, off + 3 + size, 2197);
  return function(word) {
    for (var i = 0; i < word.length-2; i++) {
      var sub = word.substring(i,i+3);
      if (sub.indexOf("'") >= 0) {
        continue; 
      }
      var c = (code(sub[0]) * 26 + code(sub[1])) * 26 + code(sub[2]);
      if (!array[c]) {
        return false;
      }
    }
    return true;
  }
}

  return function(data) {
    var i = data.indexOf(0) + 1;
    //var bloom = toArray(data,i);
    var bloom = readBloom(data,i);
    var ngr = readNgr(data,i);
    return function(word) {
      if (!ngr(word)) {
        return false;
      }
      if (word.length > 19) {
        return false;
      }
      word = stem(word);
      if (word.length == 0) {
        return false;
      }
      if (word.length > 14) {
        return false;
      }
      if (word.indexOf("'") >= 0) {
        return false;
      }
      if (bloom(word)) {
        return true;
      }
      return false;
    };
  }
})());
