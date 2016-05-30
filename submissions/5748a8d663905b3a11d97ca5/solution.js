'use strict';
var wd=null;function*substr(str,len,nullElem){var pos=0;while(pos<str.length)
{var r=str.substring(pos,len+pos);while(r.length<len)
{r+=nullElem;}
yield r;pos+=len;}
return;}
class WordDetector
{constructor(lenSeq,buf,buf1)
{this.alphobet=['-',"'","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","^","$"];this.lenChars=(this.alphobet.length-1).toString(2).length;this.lenSeq=lenSeq;if(typeof this.lenSeq!=='number')
{throw Error('Error type lenSeq')}
if((this.lenSeq*this.lenChars)>32)
{throw Error('Error len lenSeq')}
this.buf=buf;this.buf1=buf1;if(!!!buf)
{let tmpStr='';for(let i=0;i<this.lenSeq;++i)
{tmpStr+=this.alphobet[this.alphobet.length-1];}
let hs=this.hash(tmpStr);this.buf=new Buffer(((hs%8)===0)?(hs / 8):(parseInt(hs / 8)+1));this.buf.fill(0);this.sumMod=550;}
if(!!!buf)
{this.buf1=new Buffer(this.sumMod*this.sumMod);this.buf1.fill(0);}}
nullElem()
{return this.alphobet[0];}
hash(word)
{if(typeof word!=='string')
{throw new Error('Error type lenSeq')}
if(this.lenSeq!==word.length)
{throw new Error('Error len word '+word.length)}
var res=0;for(let i=0;i<this.lenSeq;++i)
{let t=this.alphobet.indexOf(word[i]);if(t===-1)
{throw new Error('Error char '+word[i]);}
let tt=t<<(i*this.lenChars);res=res|tt;}
return res;}
hash1(h)
{return h%this.sumMod;}
__pos(position)
{if(position>=(this.buf.length*8))
{throw new Error('Error position '+position);}
return[parseInt(position / 8),position%8];}
__pos1(h1,h2)
{var position=this.sumMod*h1+h2;if(position>=(this.buf1.length*8))
{throw new Error('Error position '+position+" "+this.buf1.length);}
return[parseInt(position / 8),position%8];}
__setBit(numb,val,pos)
{return(!!val?(numb|(1<<pos)):(numb&(~(1<<pos))));}
setBit(position,val)
{var p=this.__pos(position);this.buf.writeUInt8(this.__setBit(this.buf.readUInt8(p[0]),val,p[1]),p[0]);}
setBit1(h1,h2,val)
{var p=this.__pos1(h1,h2);this.buf1.writeUInt8(this.__setBit(this.buf1.readUInt8(p[0]),val,p[1]),p[0]);}
getBit1(h1,h2)
{var p=this.__pos1(h1,h2);var t=this.buf1.readUInt8(p[0]);return!!(t&1<<p[1]);}
getBit(position)
{var p=this.__pos(position);var t=this.buf.readUInt8(p[0]);return!!(t&1<<p[1]);}
saveWord(word)
{let gen=substr("^"+word+"$",this.lenSeq,this.nullElem());let lastVal=null;while(true)
{let subword=gen.next();if(subword.done)
{break;}
let hs=this.hash(subword.value);this.setBit(hs,1);if(lastVal!==null)
{let h1=this.hash1(lastVal);let h2=this.hash1(hs);this.setBit1(h1,h2,1);}
lastVal=hs;}}
testWord(word)
{var r=true;let gen=substr("^"+word+"$",this.lenSeq,this.nullElem());let lastVal=null;while(true)
{let subword=gen.next();if(subword.done)
{break;}
let hs=this.hash(subword.value);if(!this.getBit(hs))
{r=false;break;}
if(lastVal!==null)
{let h1=this.hash1(lastVal);let h2=this.hash1(hs);if(!this.getBit1(h1,h2))
{N1++;r=false;break;}}
lastVal=hs;}
return r;}}
module.exports.init=function(data){var l=data.readInt32LE(0);var buf1=data.slice(4,l+4);var buf2=data.slice(4+l);wd=new WordDetector(4,buf1,buf2)}
module.exports.test=function(word){return wd.testWord(word.toUpperCase());};
