var aB=new ArrayBuffer(65000),arr=new Uint8Array(aB);
module.exports.init=function init(b){if(b===undefined)return undefined;var L=new Uint8Array(b);arr=L.slice();return true;};
function f(p){var h=0,i=0,len=p.length;for(i=0;i<len;i++){h^=((h<<5)+(h>>2)+p.charCodeAt(i));h=h&0x7fffffff;}return h;};
module.exports.test=function test(w){if(w.length>14) return false;var w1=p0(p1(w.toLowerCase())),h=(f(w1))%(516623),Byte=h>>3,Bit=1<<(h&7);return ((arr[Byte]&Bit)==Bit)?true:false;}
function p0(s){var l=s.length;while(l>2){l=0;var p=s.slice(0,2);if((p=="un"||p=="co"||p=="re"||p=="in"||p=="de")){
l=s.length-2;s=s.slice(2);}p=s.slice(0,3);if(s.length>3&&(p=="non"||p=="pre"||p=="pro")){l=s.length-3;s=s.slice(3);}}return s;}
function p1(s){var l=s.length;while(l>2){l=0;var p=s.slice(-2);if(s.length>2&&(p=="'s"||p=="ed"||p=="es"||p=="er"||p=="ly")){
l=s.length-2;s=s.slice(0,l);};if(s.length>3&&s.slice(-3)=="ing"){l=s.length-3;s=s.slice(0,l);}}return s;}
