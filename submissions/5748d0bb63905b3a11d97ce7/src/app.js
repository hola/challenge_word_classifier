var fs = require('fs');
var zlib = require('zlib');
//var solution = require('./solution')// { init : dict => void , test : word => boolean }

var BUCKETS_COUNT = 32000;
var TEST_BUCKETS = 32000;
var FINGERPRINT = 0xFFFF;
var FINGERPRINT_BITS = 16;

var bucket = [];
var fg = new Uint16Array(BUCKETS_COUNT);


for (var b = 0; b < BUCKETS_COUNT; ++b) {
    bucket[b] = [];
    fg[b] = 0;
}

//var buff = fs.readFileSync('vectors.bin');
//var data_8 = new Uint8Array(buff);
//fg = new Uint16Array(data_8.buffer);


var s = fs.readFileSync('words.txt');
s = s.toString().trim().toLowerCase();

var words0 = s.split('\n');

s = s.replace(/'s\n/g, '\n');

var words = s.split('\n');
var keys = { __proto__ : null };

for (var i = 0; i < words.length; ++i) {
    var w = words[i];

    if (keys[w]) {
        keys[w].count++;
    }
    else {
        keys[w] = { count: 1 };
    }
}

i = 0;

counter = [0];
var k1 = 0;

var stripped_words = '', lost_words = '';
s = '';

function condense(w) {
    return w.replace(/[cgpst]h/g, 't').replace(/ck|qu|ll|ss|tt/g, 'k');
}

for (var w in keys) {
    var s2 = condense(w);
    
    if ( (s2.length >= 16) || /^[^aeiouy]{333}$|[^aeiouy]{4,}|[q']|[^aeiouy]x|j[^aeiouy]|[bdfghjklpsvwx]z/.test(s2)
       //|| /([^aeiouy]*[aeiouy]+){8}/.test(s2) 
        ) {
        counter[0] += keys[ w ].count;
        lost_words += s2 + '\n';
        continue;
    }
    
    /*
    var syllables = (s2.match(/[^aeiouy]*[aeiouy]+/g) || []).length;
    var consonants = (s2.match(/[^aeiouy]/g) || []).length;

    //if (s2.length > 88 * syllables) {
    if (consonants > 6 + syllables) {
        counter[0] += keys[ w ].count;
        lost_words += s2 + '\n';
        continue;
    }
    */

    var b = hash(w);
    
    if (b.b == 0) {
        i = i;
        //b = hash(w);
    }    
    
    bucket[b.b].push({ h: b.h, count: keys[ w ].count});
    
    //s2 = s2.replace(/s$/,'');
    var l = s2.length;
    //l = (w.match(/[^aeiouy]*[aeiouy]+/g) || []).length;
    //l = w.length;
    
    counter[ l ] = (counter[ l ] || 0) + keys[ w ].count;
        
    if (l >= 25) {
        console.log(counter[ l ] + ': ' + w);
    }

    ++i;
    
    stripped_words += ('\n' + s2);

    if (keys[ w ].count == 1) {
        k1++;
        //console.log(w);
        s += (w + '\n');
        
        //stripped_words += '*';
    }
}

console.log('Total stripped words: ' + i + ', single words: ' + k1);

fs.writeFileSync('strippedWords.txt', stripped_words);
fs.writeFileSync('rareWords.txt', s);
fs.writeFileSync('lostWords.txt', lost_words);

for (var b = 0; b < BUCKETS_COUNT; ++b) {
    if (b >= TEST_BUCKETS) {
        break;
    }
    
    var curr_bucket = bucket[b];
    var mx = [], mk = [], mc = [];
    var bucket_value = 0;

    for (var i = 0; i < curr_bucket.length; i++) {
        mx.push(curr_bucket[ i ].h);
        mc.push(curr_bucket[ i ].count);
        
        mk.push(1);
    }
   
    
    for (var i = 1, curr_r = 0; i < FINGERPRINT; i <<= 1, curr_r++) {
        //mx.push(i); //ensure there is an element with 1 at current bit position
        //mc.push(1);
        
        //mk.push(1);

        var found_r=-1, max_c = -1;

        for (var r = curr_r; r < mx.length; ++r) {
            if ((mx[r] & i) && max_c < mc[r]) {
                max_c = mc[r];
                found_r = r;
            }
        }
        
        if (found_r >= curr_bucket.length || found_r==-1) {
            mx.push(i); //add an element with 1 at current bit position
            mc.push(1);
            mk.push(1);
            
            var found_r2 = found_r;
            max_c = -1;

            for (var r = curr_r; r < mx.length; ++r) {
                if ((mx[r] & i) && max_c < mc[r]) {
                //if (max_c < mc[r]) {
                    max_c = mc[r];
                    found_r2 = r;
                }
            }

            //mk[found_r2] = 0; //mk[found_r];
            //mx[found_r2] = i;
            found_r = found_r2;
        }
        else {
            bucket_value += mc[found_r];
        }
               
        var tmp = mx[found_r];
        mx[found_r] = mx[curr_r];
        mx[curr_r] = tmp;
        
        mc[found_r] = mc[curr_r];
        mc[curr_r] = max_c;
             
        tmp = mk[found_r];
        mk[found_r] = mk[curr_r];
        mk[curr_r] = tmp;      
        
        
        if (curr_r >= mx.length) {
            r = r;
        }

        for (var j = 0; j < mx.length; ++j) {
            if ( j != curr_r && (mx[j] & i) ) {
                mx[j] ^= mx[curr_r];
                mk[j] ^= mk[curr_r];
            }
        }
    }
    
    

    var bk = 0;

    if (bucket_value >= 1) {
        for (var i = 1, r = 0; i < FINGERPRINT; i <<= 1, ++r) {
            for (j = 0; j < mx.length; ++j) {
                if (mx[j] == i) {
                    if (mk[r] != 0) {
                        bk |= i;
                    }
                    break;
                }
            }
        }
    }
    
    fg[b] = bk; 

    for (var i = 0, bad=0, good=0; i < curr_bucket.length; i++) {
        j = dp(bk, curr_bucket[ i ].h);
        
        if (j) {
            good++;
        }
        else {
            bad++;
        }
        i = i;
    }
    
    if (TEST_BUCKETS < 10000) {
        console.log('Bucket ' + b + ', size: ' + curr_bucket.length + ' good/bad: ' + good + ' / ' + bad);
    }

    //if (max_bk <= 1) {
    //    fg[b] = 0;
    //}

    i = i;
}

s = '';
counter = [0, 0];

for (var j = 0; j < words0.length; ++j) {
    var w = words0[j].replace(/'s$/,'');
    var w0 = words0[j];
    
    var b = hash(w);
    
    if (b.b >= TEST_BUCKETS) continue;
    
    counter[ 87 ] = (counter[ 87 ] || 0) + 1;
    
    if (!test(w0)) {
        counter[ 88 ] = (counter[ 88 ] || 0) + 1;
    }
}

for (var w in keys) {
    break;    
    var s2 = condense(w);
    
    for (i=0; i < keys[w].count; ++i) {
        var b = hash(w);
        
        if (b.b >= TEST_BUCKETS) continue;
        
        counter[ 87 ] = (counter[ 87 ] || 0) + 1;
        
        if (!test(w)) {
            counter[ 88 ] = (counter[ 88 ] || 0) + 1;
        }
    }
}

console.log('True words: ' + counter[ 88 ] + ' false negative :(');

for (var i = 0; i < 80; ++i) {
    if (counter[i]) {
        s += (i + '\t' + counter[i] + '\n');
    }
}
s += ('FN\t' + counter[88] + '\t' + counter[87] + '\n');


fs.writeFileSync('strippedWordsLenghts.txt', s);


var counter = [0, 0];

for (var b = 0; b < BUCKETS_COUNT; ++b) {
    var curr_bucket = bucket[b];
    
    k = Object.keys(curr_bucket).length;
    
    counter[k] = (counter[k] || 0) + 1;
}

s = '';

for (var i = 0; i < 99; ++i) {
    if (counter[i]) {
        s += (i + '\t' + counter[i] + '\n');
    }
}

fs.writeFileSync('bucketSizes.txt', s);


s = fs.readFileSync('falseWords.txt');
s = s.toString().trim().toLowerCase();
s = s.replace(/\r/g, '');

var words = s.split('\n');
s = '';

var counter = [0, 0];

for (var j = 0, k = 0; j < words.length; ++j) {
    var w = words[j];
    w = w.replace(/'s$/g, '');
    
    var b = hash(w);
    
    if (b.b >= TEST_BUCKETS) continue;

    var s2 = condense(w);
    
    counter[ 87 ] = (counter[ 87 ] || 0) + 1;
    
    
    var w0 = words[j];
    
    if (test(w) && !test(w0)) {
        i = i;
    }
        
    if (test(w0)) {
        counter[ 88 ] = (counter[ 88 ] || 0) + 1;
            
        l = 1;
            
        counter[ l ] = (counter[ l ] || 0) + 1;
        s += s2 + '\n';

    }
}

console.log(counter[ 88 ] + ' false words as true words');

fs.writeFileSync('falseStrippedWords.txt', s);

s = '';

for (var i = 0; i < 80; ++i) {
    if (counter[i]) {
        s += (i + '\t' + counter[i] + '\n');
    }
}
s += ('FN\t' + counter[88] + '\t' + counter[87] + '\n');

fs.writeFileSync('falseWordsLenghts.txt', s);

//var gzOptions = { chunkSize: 1024 * 1024, level: 9, strategy: 3 }; // 2 - huffman, 3 - rle
//var compressor = zlib.createGzip(gzOptions);
//compressor.pipe(fs.createWriteStream('vectors.gz'));
//compressor.end( Buffer.from(fg) );

var data_8 = new Uint8Array(fg.buffer)

var wstream = fs.createWriteStream('data');
wstream.write( Buffer.from(data_8) );
wstream.end();

console.log('Press any key to exit');

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', process.exit.bind(process, 0));


return;

function hash(s) {
    var h = 0x811c9dc5;
    
    for (var i = 0; i < s.length; ++i) {
        h ^= s.charCodeAt(i);
        h = (h * 0x01000193);//& 0x7FFFFFFF;
    }
    
    var h1 = h ^ s.length;
    
    h1 ^= h1 >>> 16;
    h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
    h1 ^= h1 >>> 16;

    h = (h1>>>0) % (BUCKETS_COUNT * (FINGERPRINT + 1));
    
    var res = {};
    res.b = (h >>> FINGERPRINT_BITS);
    res.h = (h & FINGERPRINT);
    
    return res;
}   

function murmur(key) {
    var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;
        
    remainder = key.length & 3; // key.length % 4
    bytes = key.length - remainder;
    h1 = 0x811c9dc5;
    c1 = 0xcc9e2d51;
    c2 = 0x1b873593;
    i = 0;
        
    while (i < bytes) {
        k1 = 
	  	((key.charCodeAt(i) & 0xff)) |
	  	((key.charCodeAt(++i) & 0xff) << 8) |
	  	((key.charCodeAt(++i) & 0xff) << 16) |
	  	((key.charCodeAt(++i) & 0xff) << 24);
        ++i;
            
        k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
        k1 = (k1 << 15) | (k1 >>> 17);
        k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;
            
        h1 ^= k1;
        h1 = (h1 << 13) | (h1 >>> 19);
        h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
        h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
    }
        
    k1 = 0;
        
    switch (remainder) {
        case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
        case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
        case 1: k1 ^= (key.charCodeAt(i) & 0xff);
                
            k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
            h1 ^= k1;
    }
        
    h1 ^= key.length;
        
    h1 ^= h1 >>> 16;
    h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
    h1 ^= h1 >>> 13;
    h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
    h1 ^= h1 >>> 16;
        
    h = (h1 >>> 0);

    h = h % (BUCKETS_COUNT * (FINGERPRINT + 1));
    
    var res = {};
    res.b = (h >>> FINGERPRINT_BITS);
    res.h = (h & FINGERPRINT);
    
    return res;
}   

function init(buff) {
    var data_8 = new Uint8Array(buff);
    fg = new Uint16Array(data_8.buffer);
}

function dp(x, y) {
    for (var i = 1, k=0; i < FINGERPRINT; i <<= 1) {
        if ((x & i) && (y & i)) {
            k ^= 1;
        }
    }
    return k;
}

function test(w) {
    w = w.replace(/'s$/, '')
    s = w.replace(/[cgpst]h/g, 't').replace(/ck|qu|ll|ss|tt/g, 'k');
    
    if ((s.length >= 16) || /[^aeiouy]{4,}|[q']|[^aeiouy]x|j[^aeiouy]|[bdfghjklpsvwx]z/.test(s)) {
        var b = hash(w);
        
        if (b.b >= TEST_BUCKETS) {
            return;
        }
        counter[0]++;
        return false;
    }
    
    var b = hash(w);
    
    return dp(fg[b.b], b.h);
}

module.exports.test = test;
module.exports.init = init;