var bloomsize = 512575;//512170;
var bitarr = new Array(bloomsize);

var crcTable = function(){
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
}();

function crc32(str) {
    var crc = 0 ^ (-1);

    for (var i = 0; i < str.length; i++ ) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }

    return ((crc ^ (-1)) >>> 0)|0;
};

function fnv32a( str )
{
	var FNV1_32A_INIT = 0x811c9dc5;
	var hval = FNV1_32A_INIT;
	for ( var i = 0; i < str.length; ++i )
	{
		hval ^= str.charCodeAt(i);
		hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
	}
	return hval >>> 0;
}

function mmh(key, seed) {
	var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;
	
	remainder = key.length & 3; // key.length % 4
	bytes = key.length - remainder;
	h1 = seed;
	c1 = 0xcc9e2d51;
	c2 = 0x1b873593;
	f =  0xffff;
	ff = 0xffffffff;
	i = 0;
	var a=key.charCodeAt;
	while (i < bytes) {
	  	k1 = 
	  	  ((key.charCodeAt(i) & 0xff)) |
	  	  ((key.charCodeAt(++i) & 0xff) << 8) |
	  	  ((key.charCodeAt(++i) & 0xff) << 16) |
	  	  ((key.charCodeAt(++i) & 0xff) << 24);
		++i;
		
		k1 = ((((k1 & f) * c1) + ((((k1 >>> 16) * c1) & f) << 16))) & ff;
		k1 = (k1 << 15) | (k1 >>> 17);
		k1 = ((((k1 & f) * c2) + ((((k1 >>> 16) * c2) & f) << 16))) & ff;

		h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
		h1b = ((((h1 & f) * 5) + ((((h1 >>> 16) * 5) & f) << 16))) & ff;
		h1 = (((h1b & f) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & f) << 16));
	}
	
	k1 = 0;
	
	switch (remainder) {
		case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
		case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
		case 1: k1 ^= (key.charCodeAt(i) & 0xff);
		
		k1 = (((k1 & f) * c1) + ((((k1 >>> 16) * c1) & f) << 16)) & ff;
		k1 = (k1 << 15) | (k1 >>> 17);
		k1 = (((k1 & f) * c2) + ((((k1 >>> 16) * c2) & f) << 16)) & ff;
		h1 ^= k1;
	}
	
	h1 ^= key.length;

	h1 ^= h1 >>> 16;
	h1 = (((h1 & f) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & f) << 16)) & ff;
	h1 ^= h1 >>> 13;
	h1 = ((((h1 & f) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & f) << 16))) & ff;
	h1 ^= h1 >>> 16;

	return h1 >>> 0;
}

function reset(c) {
  bitarr = new Array(bloomsize);
}

function key(n) {
  return Math.abs(n%bloomsize);
}

function badseq(word) {
  var consonants = "bcdfghjklmnpqrstvwxyz'";
  var vowels
  var mc=0,cc=0;
  for (var i = 0; i < word.length; i++) {
    c = word.charAt(i);
    if (consonants.indexOf(c)>=0) cc++;
    else { mc = Math.max(cc,mc); cc=0; }
  }
  return Math.max(cc,mc)>4;
}

function train(word) {
  if (badseq(word)) return 0;
  if (word.length > 15) return 0;
  word = word.toLowerCase().trim().replace("'s","");
  word = word.slice(0,7);
  var i1 = key(crc32(word));
  var i2 = key(mmh(word));
  
  bitarr[i1] = 1;
  bitarr[i2] = 1;
}

function test(word) {
  if (badseq(word)) return 0;
  if (word.length > 15) return 0;
  word = word.toLowerCase().trim().replace("'s","");
  word = word.slice(0,7);
  var i1 = key(crc32(word));
  var i2 = key(mmh(word));

  return bitarr[i1] && bitarr[i2];
}

function save() {
  s = "";
  for (i=0;i<bloomsize;++i)
    s+=(bitarr[i]==1?1:0);
  console.log(s);
}

function init(data) {
  /*var idx=0;
  for(var i in data) {
    var b = data[i];
    for(bi=0;bi<8;++bi)
      bitarr[idx+7-bi]=!!(b&1<<bi);
    idx+=8;
  }*/
}

module.exports = {
  init: init,
  test: test,
  train: train,
  save: save,
  reset: reset
}
