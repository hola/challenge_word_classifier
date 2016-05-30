var symb = {
    a: 4,
    b: 9,
    c: 13,
    d: 15,
    e: 2,
    f: 11,
    g: 10,
    h: 14,
    i: 3,
    j: 12,
    k: 28,
    l: 30,
    m: 26,
    n: 27,
    o: 7,
    p: 31,
    q: 29,
    r: 25,
    s: 17,
    t: 21,
    u: 5,
    v: 23,
    w: 19,
    x: 18,
    y: 1,
    z: 22
};

var addr = 16;
var variant = 24;
var nl = 0;


var fs = require('fs');
var zlib = require('zlib');

var array = fs.readFileSync('data_35.dat');
array = JSON.parse(array.toString());
console.log(array.matches.length);

var data = {};
for(var i in array.matches){
    var t1 = array.matches[i];
    data[t1.word] = t1.matches;
}

var words = [];
var singles = [];
for(var i in array.matches){
    if(array.matches[i].matches !== undefined){
        if(array.matches[i].matches.include.length === 0 && array.matches[i].matches.define.length !== 0){
            singles.push(array.matches[i]);
        }
    }
}

singles.sort(function(a,b){
    if(a.word.length > b.word.length) return -1;
    if(a.word.length < b.word.length) return 1;
    return 0;
});


var proceed = [];
for(var i in singles){
    var w = singles[i].word;
    words.push({word:w});
    data[w].i = words.length - 1;    
    for(var j in singles[i].matches.define){
        var w2 = singles[i].matches.define[j];
        if(data[w2].i !== undefined) continue;
        words.push({word:w2,i:i});
        data[w2].i = words.length - 1;
        if(data[w2].define.length !== 0){
            proceed.push(w2);
        }
    }
}

while(proceed.length !== 0){
    var w = proceed.pop();
    var i = data[w].i;
    words.push({word:w,i:i});
    data[w].i = words.length - 1;
    if(data[w].define.length !== 0){
        for(var j in data[w].define){
            var w2 = data[w].define[j];
            if(data[w2].i === undefined){
                proceed.push(w2);
            }            
        }        
    }
}
var maxI = -1;
for(var i in words){
    if(words[i].i !== undefined && words[i].i > maxI) maxI = words[i].i;
}
console.log("maxI",maxI);
function findI(word){
    for(var i in words){
        if(words[i].word === word) return i;
    }
    return -1;
}

var bitData = [];

function write(str){
    var tmp = str.toLowerCase();
    for(var i = 0;i<tmp.length;i++) {
        var bits = toBits(symb[tmp[i]]);
        writeBits(bits);
    }
}
function writeWithAddr(str,id,start,len){
    var tmp = str.toLowerCase();
    for(var i = 0;i<start;i++) {
        var bits = toBits(symb[tmp[i]]);
        writeBits(bits);
    }
    writeBits(toBits(addr));
    writeBits(toBitsInteger(id));
    for(var i = start+len-1;i<tmp.length;i++) {
        var bits = toBits(symb[tmp[i]]);
        writeBits(bits);
    }
}
function writeBits(bits){
    for(var j = 0;j<bits.length;j++){
        bitData.push(bits[j]);
    }
}
console.log(words.length);
for(var i = 0;i<words.length;i++){
    var w = words[i];
    if(w.i !== undefined){
        //console.log(w.i,words[w.i]);
        var start = w.word.indexOf(words[w.i].word);
        var len = words[w.i].word.length;
        writeWithAddr(w.word,w.i,start,len);
    }else{
        console.log("Writing",w.word);
        write(w.word);
    }
    
    writeBits(toBits(nl));
}
console.log(bitData.length);



function toBits(value){
    var bits = []; 
    for (var i = 4; i >= 0; i--) {
       var bit = value & (1 << i) ? 1 : 0;
       bits.push(bit);
    }
    return bits;
}

function toBitsInteger(value){
    var bits = []; 
    for (var i = 17; i >= 0; i--) {
       var bit = value & (1 << i) ? 1 : 0;
       bits.push(bit);
    }
    return bits;
}

function fromBits(bits){
    var tmp = "";
    for(var i = 0;i<bits.length;i++) {
        tmp += bits[i];
    }
    return parseInt(tmp,2);
}


var size = Math.ceil(bitData.length / 8);
console.log(size);
var buf = Buffer.alloc(size,'','ascii');
for(var i = 0;i<size;i++){
    var bits = [];
    bits[0] = bitData[i * 8 + 0];
    bits[1] = bitData[i * 8 + 1];
    bits[2] = bitData[i * 8 + 2];
    bits[3] = bitData[i * 8 + 3];
    bits[4] = bitData[i * 8 + 4];
    bits[5] = bitData[i * 8 + 5];
    bits[6] = bitData[i * 8 + 6];
    bits[7] = bitData[i * 8 + 7];
    
    var num = fromBits(bits);
    //console.log(num);
    buf.writeUInt8(num,i);
}
var zzz = zlib.gzipSync(buf,{level: 9 });
console.log(buf.length);
console.log(zzz.length);
fs.writeFileSync("compressed_35.gz" , zzz);