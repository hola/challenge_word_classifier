'use strict'

var v=[]
var init = function (data) {     
    for (var i = 0; i < data.length; i++) {
        var b = data[i]      
        for (var j = 0; j < 8 ; j++) {                        
            v[8 * i + 7 - j] = b % 2;
            b=(b-b%2)/2;            
        }        
    }    
}

var test = function (word) {
    var w = word;
    if (w == "'") return false;
    if (w.length == 1) return true;    
    var c = process(word);    
    return c>=0&&c<v.length&&(v[c]==1);
}
exports.init = init;
exports.test = test;

var crcTable = null;
var makeCRCTable = function(){
    var c;
    var crcTable = [];
    for(var n =0; n < 256; n++){
        c = n;
        for(var k =0; k < 8; k++){
            c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
}

var crc32 = function(str) {
    crcTable = crcTable || (crcTable = makeCRCTable());
    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return (crc ^ (-1)) >>> 0;
};

var process = function (w) {
    var lgMaxCuvant = 15;  // lg=14=>  -3 cuv bune pe test 34
    var dictSize = 500000;    
    var nrConsErr = 5 // cons=4 => -3 cuv bune pe test 34
    w = w.toLowerCase();

    if (w.indexOf("'") >= 0 && (w.indexOf("'") != w.length - 2 || w.substr(w.length - 2) != "'s")) return -1;
   
    if (w.substr( w.length - 2) == "'s")
        w = w.substr(0, w.length - 2)       
    if (w.substr(w.length - 1) == "s")
        w = w.substr(0, w.length - 1)
  
    if (w.length > lgMaxCuvant) return -1;
  
    for (var i = 0; i < w.length - nrConsErr + 1; i++) {
        var cuVocala = false;
        for (var k = 0; k < nrConsErr; k++) {
            var l = w.substr(i + k, 1);
            if (l == 'a' || l == 'e' || l == 'i' || l == 'o' || l == 'u' || l == 'y' || l == "'")
                cuVocala = true;
        }
        if (!cuVocala) return -1;
    }

    for (var i = 0; i < w.length - 2; i++) 
        if(w.substr(i,1)==w.substr(i+1,1)&&w.substr(i,1)==w.substr(i+2,1)) return -1;
    
    var l=w.substr(0, 1);  
    if (l == w.substr(1, 1)) return -1;// && (l == 'a' || l == 'e' || l == 'i' || l == 'o' || l == 'u' || l == 'y' || l == "w")) return false;
    
    var nrv=0;
    var nrc = 0;
    for (var i = 0; i < w.length ; i++) {
        var l = w.substr(i, 1);
        if (l == 'a' || l == 'e' || l == 'i' || l == 'o' || l == 'u' || l == 'y' || l == "'")
            nrv++;
        else
            nrc++;            
    }
    if (nrv==0) return -1;
    if (nrv * 6 <= nrc) return -1;

    var s = "qjqzqxjqjzjxzxxjvqwxgxhxvjqgqhwqqyqpkxzjqfqcqvpxfqxzvwvxvbqkfxjvkzxkcxqbqngqjbkqcjqdsxqwqmpqfzjwjfjgqlfvbxqqqttxdxvfvzmxqowjpzzqyqjtjmbqqrjjzfmqqejhjlxqvhjpxgvpfjxxbzjkxrtqvgjyjcvmqsdqlxjdxn"   
    for (var i = 0; i < s.length; i += 2)
        if (w.indexOf(s.substr(i, 2)) >= 0) return -1;
    
    var c = crc32(w);
    c = c % dictSize;
    return c;
}
