var aB=new ArrayBuffer(64433),arr=new Uint8Array(aB);
module.exports.init=function init(b){if(b===undefined)return undefined;var L=new Uint8Array(b);arr=L.slice();return true;};
function m(){var c,T=[];for(var n=0;n<256;n++){c=n;for(var k=0;k<8;k++){c=((c&1)?(0xEDB88320^(c>>>1)):(c>>>1));}T[n]=c;}return T;};
function f(s){var T=global.T||(global.T=m()),crc=0^(-1);for (var i=0;i<s.length;i++){crc=(crc>>>8)^T[(crc^s.charCodeAt(i))&0xFF];}return (crc^(-1))>>>0;};
module.exports.test=function test(w){if(w.length>14) return false;var w1=pf(sf(w.toLowerCase())),h=f(w1)%(515464),Byte=h>>3,Bit=1<<(h&7);return ((arr[Byte]&Bit)==Bit)?true:false;}
function pf(s){var l=s.length;while(l>2){l=0;var p=s.slice(0,2);if(p=="un"||p=="co"||p=="re"||p=="in"||p=="de"){l=s.length-2;s=s.slice(2);}p=s.slice(0,3);if(s.length>3&&(p=="non"||p=="pre"||p=="pro")){l=s.length-3;s=s.slice(3);}}return s;}
function sf(s){var l=s.length;while(l>2){l=0;var p=s.slice(-2);if(p=="'s"||p=="ed"||p=="es"||p=="er"||p=="ly"){l=s.length-2;s=s.slice(0,l);};if(s.length>3&&s.slice(-3)=="ing"){l=s.length-3;s=s.slice(0,l);}}return s;}
