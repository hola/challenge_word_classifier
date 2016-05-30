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
var nl = 0;
var fs = require('fs');
var zlib = require('zlib');

var array = fs.readFileSync('words_35.txt').toString().split("\n");
var bitData = [];

function write(str){
    var tmp = str.toLowerCase();
    for(var i = 0;i<tmp.length;i++) {
        var bits = toBits(symb[tmp[i]]);
        writeBits(bits);
    }
}

function writeBits(bits){
    for(var j = 0;j<bits.length;j++){
        bitData.push(bits[j]);
    }
}

function toBits(value){
    var bits = []; 
    for (var i = 4; i >= 0; i--) {
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

for(var i in array){
    array[i] = array[i].toLowerCase();    
}

for(var i = array.length - 1; i >= 0; i--){
    if(array[i].indexOf('\'s') !== -1){
        array.splice(i, 1);        
    }
    if(array[i].indexOf('\'d') !== -1){
        array.splice(i, 1);
    }
    if(array[i].indexOf('\'t') !== -1){
        array.splice(i, 1);
    }
    if(array[i].indexOf('\'re') !== -1){
        array.splice(i, 1);
    }
    if(array[i].indexOf('\'th') !== -1){
        array.splice(i, 1);
    }
}

for(var i = 0;i<array.length;i++){
    var word = array[i];
    write(word);
    writeBits(toBits(nl));
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