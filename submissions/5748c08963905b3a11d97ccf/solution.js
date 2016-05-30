
dec = (bytes)=>{
let r = [];
for(let i = 0; i < bytes.length; i ++){
let b = bytes.readUInt8(bytes.length - i - 1);
let byte = [];
for(let j = 0; j < 8; j ++){byte.push(b & 1);b = b >> 1;}
r = r.concat(byte.reverse());
};
return r;
}

Xor = (x, y) => (new Array(64)).fill(0).map((v, i) => (x[i] != y[i]) ? 1 : 0);
And = (x, y) => (new Array(64)).fill(0).map((v, i) => x[i] * y[i]);
IsZero = (x) => (x.reduce((x, y) => x+y, 0) === 0);

chit5 = (c) => {
let lc = c.toLowerCase();
if('a' <= lc && lc <= 'z') return lc.charCodeAt(0) - 'a'.charCodeAt(0) + 1;
if(lc == "'") return 28;
return 0;
}

encode=(w)=>{
let r=[], l=w.length;
if(l>32){w=w.substr(0,32);l=32;}
let b=5,m=31;
if(l>12){b=4,m=15};
if(l>16){b=3,m=7};
if(l>21){b=2,m=3};
w.split("").forEach(c=>{
let i=chit5(c)&m;
for(let j=0;j<b;j++){
if(i&(1<<j)){r.push(1);}
else{r.push(0);}}});
if(r.length<64) r=(new Array(64-r.length).fill(0)).concat(r);
return r;
}

class Filter{
constructor(){
this.matchers = {};
this.layout = [
{l:8, b:0x0, e:0x47e},
{l:7, b:0x47e, e:0x82c},
{l:10, b:0x82c, e:0xc72},
{l:18, b:0xc72, e:0xc99},
{l:19, b:0xc99, e:0xcae},
{l:6, b:0xcae, e:0xf3d},
{l:20, b:0xf3d, e:0xf45},
{l:12, b:0xf45, e:0x11f5},
{l:21, b:0x11f5, e:0x11f9},
{l:3, b:0x11f9, e:0x1235},
{l:11, b:0x1235, e:0x15b7},
{l:14, b:0x15b7, e:0x1707},
{l:13, b:0x1707, e:0x18f2},
{l:15, b:0x18f2, e:0x19c8},
{l:16, b:0x19c8, e:0x1a4a},
{l:17, b:0x1a4a, e:0x1a93},
{l:4, b:0x1a93, e:0x1b2e},
{l:9, b:0x1b2e, e:0x1fd2},
{l:5, b:0x1fd2, e:0x212e},
];}


load(data){
let half = data.length / 2;
let eighth = half / 8;
var inversions = Buffer.alloc(half);
var masks = Buffer.alloc(half);
for(let i = 0; i < half; i ++){
let j = i % 8;
inversions[i] = data[j*eighth + (i >> 3)];
masks[i] = data[half + j*eighth + (i >> 3)];
}

this.layout.forEach((r) => {
this.matchers[r.l] = this.decm((r.e - r.b)*8,
inversions.slice(r.b*8, r.e*8), masks.slice(r.b*8, r.e*8));
})
}

decm(l, ins, msk){
var ms = [];
for(let i = 0; i < l; i += 8){
ms.push({i: dec(ins.slice(i, i+8)),m: dec(msk.slice(i, i+8))});
}
return ms;}

test(ww){
let ms = this.matchers[ww.length];
if(!ms) return false;
let w = encode(ww);
for(let i=0; i<ms.length; i++){
if(IsZero(And(ms[i].m, Xor(ms[i].i, w)))) return true;
};
return false;}
};

let f = new Filter();
function init(d){f.load(d);}
function test(w){return f.test(w);}
module.exports = {init: init, test: test}
