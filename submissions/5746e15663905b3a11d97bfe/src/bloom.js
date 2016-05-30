bitarray = require('./bitarray')

module.exports.from = function (words, m, k) {
    return new function () {
        this.m = m
        this.buf = Buffer.alloc(m)
        words.forEach(function(w) {
            for (var h = 0; h < k; h++) {
                bitarray.set(this.buf, murmur(w,h) % (m * 8))            
            }
        }, this);

        this.test = function (w) {
            for (var h=0;h<k;h++) {
                if (!bitarray.test(this.buf,murmur(w,h) % (m * 8))) {
                    return false;
                }
            }
            return true;
        }
        
        this.add = function (w) {
            for (var h = 0; h < k; h++) {
                bitarray.set(this.buf, murmur(w,h) % (m * 8))            
            }
        }
    }
}
 
//  var makeCRCTable = function(){
//     var c;
//     var crcTable = [];
//     for(var n =0; n < 256; n++){
//         c = n;
//         for(var k =0; k < 8; k++){
//             c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
//         }
//         crcTable[n] = c;
//     }
//     return crcTable;
// }
// var crcTable = makeCRCTable();
// var h = function(str) {
//     var crc = 0 ^ (-1);

//     for (var i = 0; i < str.length; i++ ) {
//         crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
//     }

//     return (crc ^ (-1)) >>> 0;
// };
// function murmur (str,seed) { return h(str)}
function murmur(str, seed) {
    //   var crypto = require('crypto');
    //   return crypto.createHash('sha1').update(str).digest().readUInt32LE(4*seed);
  var
    l = str.length,
    h = seed ^ l,
    i = 0,
    k;
  
  while (l >= 4) {
  	k = 
  	  ((str.charCodeAt(i) & 0xff)) |
  	  ((str.charCodeAt(++i) & 0xff) << 8) |
  	  ((str.charCodeAt(++i) & 0xff) << 16) |
  	  ((str.charCodeAt(++i) & 0xff) << 24);
    
    k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));
    k ^= k >>> 24;
    k = (((k & 0xffff) * 0x5bd1e995) + ((((k >>> 16) * 0x5bd1e995) & 0xffff) << 16));

	h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16)) ^ k;

    l -= 4;
    ++i;
  }
  
  switch (l) {
  case 3: h ^= (str.charCodeAt(i + 2) & 0xff) << 16;
  case 2: h ^= (str.charCodeAt(i + 1) & 0xff) << 8;
  case 1: h ^= (str.charCodeAt(i) & 0xff);
          h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
  }

  h ^= h >>> 13;
  h = (((h & 0xffff) * 0x5bd1e995) + ((((h >>> 16) * 0x5bd1e995) & 0xffff) << 16));
  h ^= h >>> 15;

  return h >>> 0;
}

module.exports.murmur = murmur