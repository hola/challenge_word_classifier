var BITS = 19,
    buf;

// https://github.com/jbt/js-crypto/blob/master/sha1-min.js
var sha1=function(d){var l=0,a=0,f=[],b,c,g,h,p,e,m=[b=1732584193,c=4023233417,~b,~c,3285377520],n=[],k=unescape(encodeURI(d));for(b=k.length;a<=b;)n[a>>2]|=(k.charCodeAt(a)||128)<<8*(3-a++%4);for(n[d=b+8>>2|15]=b<<3;l<=d;l+=16){b=m;for(a=0;80>a;b=[[(e=((k=b[0])<<5|k>>>27)+b[4]+(f[a]=16>a?~~n[l+a]:e<<1|e>>>31)+1518500249)+((c=b[1])&(g=b[2])|~c&(h=b[3])),p=e+(c^g^h)+341275144,e+(c&g|c&h|g&h)+882459459,p+1535694389][0|a++/20]|0,k,c<<30|c>>>2,g,h])e=f[a-3]^f[a-8]^f[a-14]^f[a-16];for(a=5;a;)m[--a]=m[a]+b[a]|0}for(d="";40>a;)d+=(m[a>>3]>>4*(7-a++%8)&15).toString(16);return d};

function mask(str, bits)
{
    return parseInt(str.slice(-Math.ceil(bits/4)), 16) & ((1 << bits) - 1);
}

function init(data)
{
    buf = data;
}

function test(word)
{
    var bitIndex = mask(sha1(word), BITS);
    return Boolean(buf[bitIndex >> 3] & (1 << (bitIndex % 8)));
}

exports.init = init;
exports.test = test;
