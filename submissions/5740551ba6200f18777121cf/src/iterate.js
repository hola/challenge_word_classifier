'use strict'
const fs = require('fs');
const zlib = require('zlib');
var bloom = require('./bloom');
var buffer = new Uint8Array(2197 + 0x0FFFFF+1);
var arg = process.argv[2];
var log = '';
if (arg == undefined) throw new Error('undefined arg');
arg=arg*1;
bloom.init();

function bitIndex(s){
    var res = 26*26*(s.charCodeAt(0)-97)+26*(s.charCodeAt(1)-97)+(s.charCodeAt(2)-97);
    return res;
}

function setBit(u8,bitIndex){
    var bytei= Math.floor(bitIndex/8);
    var biti = bitIndex % 8;
    var mask = 1 << biti;
    u8[bytei] = u8[bytei] | mask;
}

function getBit(u8,bitIndex){
    var bytei= Math.floor(bitIndex/8);
    var biti = bitIndex % 8;
    var mask = 1 << biti;
    return u8[bytei] & mask;
}

var falsewords = fs.readFileSync('falsewords.txt','utf-8').trim().split('\n');
var truewords = fs.readFileSync('words.txt','utf-8').trim().toLowerCase();

for (var i=97; i<=122; i++)
    for (var j=97; j<=122; j++)
        for (var k=97; k<=122; k++){
            if(truewords.indexOf(String.fromCharCode(i,j))==-1){
                continue;
            }
            var s = String.fromCharCode(i,j,k);
            var ind = truewords.indexOf(s);
            var count=0;
            while(ind >=0){
                count++;
                ind = truewords.indexOf(s,ind+1);
            }
            if(count > arg){
                setBit(buffer,bitIndex(s));
            }else{
                //console.log(s);
            }
        }
var words = truewords.split('\n');
for (let i in words){
    bloom.add(buffer,words[i]);
}


fs.writeFileSync('buffer',zlib.gzipSync(new Buffer(buffer)),'binary');
