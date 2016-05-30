var fs = require('fs');
var stem = fs.readFileSync('stem.txt').toString().split('\n');
var crctbl = [];
function make_crc_table(){
    POLYNOMIAL = 0xEDB88320;
    rem = 0;
    b = 0;
    do
    {
        rem = b;
        for (bit = 8; bit > 0; --bit)
            rem = (rem>>>1)^(rem&1 ? POLYNOMIAL : 0);
        crctbl[b] = rem>>>0;
    } while(++b<256);
}
make_crc_table();
function hash12(wrd){
    var crc = -1>>>0;
    for(var i = 0; i < wrd.length; i++)
        crc = (crctbl[wrd.charCodeAt(i)^(crc&0xff)]^(crc>>>8))>>>0;
    return (~crc)>>>0;
}
var N = 521382
var arr = new Uint8Array(N>>>3);
var n_cv = x=>{
    var y=x.split(''), nc=0, nv=0;
    y.forEach(e=>{'aeiou'.includes(e) ? nv++ : nc++});
    return !nv ? 255 :  1.*nc/nv;
};
var eur1 = x=>{
    var rr = /c[jvx]|cll|d[qx]|edn|evb|fep|f[jv]|gji|goh|grd|iay|iok|j[bcdfghjlmpvwy]|kig|[bfhjkmpvx][qxz]|[wl][qx]|mzs|niy|[blnpt]ll|nn[dg]|prt|q[bcdefghjklmnopqrstvwxyz]|qu[blr]|rss|[rt]x|s[ps]s|tr[dnst]|uex|ujf|upm|v[bfhjkpw]|wv|x[gjknrv]|yq|zaf|z[fjx]|zut/;
    y = x.replace(/[aeoui]/g, '-').replace(/[^-]/g, '+');
    return y.includes('----')||y.includes('++++++')||x.includes("'")||rr.test(x);
};
for (var i=0; i<stem.length; i++)
{
    if (stem[i].length>=13||eur1(stem[i])||n_cv(stem[i])>=7.1) continue;
    var h = hash12(stem[i])%N;
    arr[h>>>3] |= 1<<h%8;
}
var b2 = new Uint8Array(fs.readFileSync('module.min'))
var c = new Uint8Array(arr.byteLength+b2.byteLength);
c.set(b2);
c.set(arr, b2.length);
fs.writeFileSync('data.res', new Buffer(c));
