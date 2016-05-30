/**
 * Created by askander on 27.05.2016.
 */

exports.init = function(data){
    buffer=data; }
exports.test = function(word){    return check_filter(word);}
var MURMURHASH_M = 0x5bd1e995;
var BUFFER_SIZE = 60000;
function negative(num) {
    if (num < 127) {
        return num;
    }
    return num | 0xffffff00
}

var imul = (function () {
    if (Math.imul) {
        return Math.imul;
    } else {
        return function (a, b) {
            return ((((a >> 16) * b) & 0xffff) << 16) + ((a & 0xffff) * b)
        }
    }
})()

function murmurhash2js(key, seed) {
    var l = key.length;
    var h = seed ^ l;
    var i = 0;
    var k = 0;
    while (l >= 4) {
        k = (key[i] |
        (key[i + 1] << 8) |
        (key[i + 2] << 16) |
        (key[i + 3] << 24));
        k = imul(k, MURMURHASH_M)
        k ^= k >>> 24;
        k = imul(k, MURMURHASH_M)
        h = imul(h, MURMURHASH_M) ^ k
        l -= 4;
        i += 4;
    }

    switch (l) {
        case 3:
            h ^= negative(key[i + 2]) << 16;
        case 2:
            h ^= negative(key[i + 1]) << 8;
        case 1:
            h ^= negative(key[i]);
            h = imul(h, MURMURHASH_M)
    }
    h ^= h >>> 13;
    h = imul(h, MURMURHASH_M)
    h ^= h >>> 15;
    return h >>> 0;
}
function murmurhash(key, seed) {
    if (typeof key === 'string') {
        key = new Buffer(key);
    } else if (!Buffer.isBuffer(key)) {
        key = new Buffer(String(key));
    }
    if (typeof seed !== 'number') {
        seed = 97;
    }
    return  murmurhash2js(key, seed);
}

function getKey(hash) {
    var k = (hash >>>16)^(hash >>>24);
    var key=1<<(k%8);
    return key;
}
function check_filter(word) {   
    var str = word.toLowerCase();
    var seed1 = 0x9747b28c;
    str=removEnd(str);
    str=removSuffix(str);
    str=removSuffix(str);
    str=removPreffix(str);
    var check1=true;
    var hash = murmurhash(str,seed1);
    var index = hash & 0xffff;
    var k = (hash >>>16)^(hash >>>24);
    var key = getKey(hash);
    if(index<BUFFER_SIZE){

        if((buffer[index]&key)===0)check1=false;
    }    
    return check1;
}
function removEnd(str) {
    var s =str;
    if((str.length>5)&&(str.indexOf("'s")===str.length-2)) s=str.slice(0,-2);
    return s;
}
function removSuffix(str) {
    var s =str;
    var list = ["nesses","ness","ations","tions","ation","tion","able",
        "ments","ment","ive","ian","ings","ing","isms","ism","ists","ist","ers",
        "er","al","ed","an","ly"];
    for(var i in list){
        if((str.length>4+list[i].length)&&(str.indexOf(list[i])===str.length-list[i].length)){
            s=str.slice(0,-list[i].length);
            break;
        }
    }
    return s;
}
function removPreffix(str) {
    var s =str;
    var list = ["pre","non","re","co","un","in"];
    for(var i in list){
        if((str.length-list[i].length>3)&&(str.indexOf(list[i])===0)){
            s=str.slice(list[i].length);
            break;
        }
    }
    return s;
}
