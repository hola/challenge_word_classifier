/* © 2016 Serj Karasev */
const LN=27,b2=22400,b3=41150,b4=48350,bfs1=8*b2,bfs2=8*18750,bfs3=8*7200,f=false;
var bb;
function init(d) {bb=new Buffer(d);}
function lti(c) {if (c!=0x27) return (c-0x61);else return 26;}
function hash(s,len) { var h=new Uint32Array(1);h[0]=0;for (var i=0;i<len;i++) {h[0]=((h[0]*1664525)+s.charCodeAt(i)+1013904223);} return h[0];}
function tb(n,i) {var b=bb.readUInt8(n+Math.floor(i/8)); return (b>>(i%8))&1;}
function tb2(i,j,i1,i2,ind1,ind2) {var ind=LN*i1+i2;var b=bb.readUInt8(b4+92*ind1+92*ind2+Math.floor(ind/8));return (b>>(ind%8))&1;}
function test(w) {
var i,j,len,len2,s,i1,i2,mlc,ind1;
len=w.length;
if (len<=0||w.charCodeAt(0)==0x27) return f;
if (len<5) {s=w; len2=len; } else {len2=5;s=w.substr(0,5);}
if (tb(0,hash(s,len2)%bfs1)==0) return f;
if (len<=5) {s="";len2=0;}
else if (len<11) {len2=len-5;s=w.substr(5,len2);}
else {s=w.substr(5,6);len2=6;}
if (tb(b2,hash(s,len2)%bfs2)==0) return f;
if (len<=9) {s="";len2=0;}
else if (len<16) {len2=len-9;s=w.substr(8,len2);}
else {s=w.substr(8,7);len2=7;}
s=w.substr(len-1,1)+s; len2++;
if (tb(b3,hash(s,len2)%bfs3)==0) return f;
mlc=len<25?len:25;
for (i=0,ind1=0;i<mlc-1;i++) {
for (j=i+1;j<mlc;j++) {
i1=lti(w.charCodeAt(i));
i2=lti(w.charCodeAt(j));
if (tb2(i,j,i1,i2,ind1,j-i-1)==0) return f;}
ind1+=24-i;}
return true;}
exports.init=init;
exports.test=test;