const zlib  = require('zlib');
const fs    = require('fs');
const cfy   = require('./solution.js');
const https = require('https');

function c(x) {
	console.log(x);
}

function hash(x) {
  var hash = 0, i, chr, len;
  if (x.length === 0) return hash;
  for (i = 0, len = x.length; i < len; i++) {
    chr   = x.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash & 0x7FFFFFFF;
}

function getBit(i,b) { 
	return b.readUInt8(b.length-1-~~(i/8))>>i%8&1
}

function writeBuf(file, buf) {
	if ( fs.existsSync(file) ) {
		fs.unlink(file);
	}
	fs.appendFileSync(file, buf);
}

function setBit(i, buf, set) {
	var byte = buf.length-1 - ~~(i/8);
	var bit  = i%8;
	
	var val = buf.readUInt8(byte);
	if ( set ) {
		buf.writeUInt8(val | (0x01<<bit), byte);
	} else {
		buf.writeUInt8(val & ~(0x01<<bit), byte);
	}
}

function cutWords(from, to) {
	var contents = fs.readFileSync(from, 'utf8');
	var words    = contents.split('\n');
	cfy.init( new Buffer(1).fill(0xFF) );
	var cuted = "";
	for ( w in words ) {
		if ( cfy.test(words[w]) ) {
			if ( words[w].length >= 3  ) { 
				cuted += "\n" + words[w];
			}
		}
	}
	
	if ( fs.existsSync(to) ) {
		fs.unlink(to);
	}
	fs.appendFileSync(to, cuted.substr(1));
}

function makeBloomFile(from, to, bytes) {
	var bits     = bytes*8;
	var contents = fs.readFileSync(from, 'utf8');
	var words    = contents.split('\n');
	var filter   = new Buffer(bytes).fill(0x00);
	for ( var w in words ) {
		var offset   = hash(words[w])%bits;
		setBit(offset, filter, true);
	}
	var bloomZiped = zlib.gzipSync(filter);
	writeBuf(to, bloomZiped);
	c(bloomZiped.length);
}

function doTest(test) {
	var contents = fs.readFileSync('data.gz');
	cfy.init( zlib.gunzipSync(contents) );
	var hits = 0;
	var all  = 0;
	for ( var i in test ) {
		//console.log(i + " " + test[i] + " MY" + cfy.test(i));
		all++;
		if ( test[i] == cfy.test(i) ) {
			hits++;
		}
	}

	console.log(hits/all + "%");
}

cutWords('words.txt', 'cutedWords.txt');
makeBloomFile('cutedWords.txt', 'data.gz', 68761);

//================================================================
// Offline test
//================================================================

var words    = fs.readFileSync("words.txt",    'utf8').split('\n');
var badWords = fs.readFileSync("badWords.txt", 'utf8').split('\n');

var test = {};
for ( var i in words    ) { test[words[i]] = true; }
for ( var i in badWords ) { test[badWords[i]] = false; }
doTest(test);

//================================================================
// Online test
//================================================================
/*
for ( var i = 0; i < 100; i++ )
https.get('https://hola.org/challenges/word_classifier/testcase/'+ (~~(Math.random()*1000000)), (res) => {
	res.on('data', (d) => {
		//eval("var test = " + d.toString() + ";");
		//doTest(test);
		var file = 'tests/'+(~~(Math.random()*1000000));
		if ( fs.existsSync(file) ) {
			fs.unlink(file);
		}
		fs.appendFileSync(file, d);
	});
}).on('error', (e) => {
  console.error(e);
});
*/