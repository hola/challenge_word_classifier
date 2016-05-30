'use strict'; /*jslint node:true*/
const fs = require('fs');

var MT = function() {
    this.N = 624;
    this.M = 397;
    this.MATRIX_A = 0x9908b0df;
    this.UPPER_MASK = 0x80000000;
    this.LOWER_MASK = 0x7fffffff;
    this.mt = new Array(this.N);
    this.mti=this.N+1;
    this.init_seed(19650218);
}

MT.prototype.reset = function() {
    this.init_seed(19650218);
}    

MT.prototype.init_seed = function(s) {
    this.mt[0] = s >>> 0;
    for (this.mti=1; this.mti<this.N; this.mti++) {
        var s = this.mt[this.mti-1] ^ (this.mt[this.mti-1] >>> 30);
        this.mt[this.mti] = (((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253) + this.mti;
	this.mt[this.mti] >>>= 0;
    }
}

MT.prototype.random_int = function() {
    var y;
    var mag01 = new Array(0x0, this.MATRIX_A);
    if (this.mti >= this.N) {
	var kk;
	if (this.mti == this.N+1)
	    this.init_seed(5489);
	for (kk=0;kk<this.N-this.M;kk++) {
	    y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
	    this.mt[kk] = this.mt[kk+this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
	}
	for (;kk<this.N-1;kk++) {
	    y = (this.mt[kk]&this.UPPER_MASK)|(this.mt[kk+1]&this.LOWER_MASK);
	    this.mt[kk] = this.mt[kk+(this.M-this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
	}
	y = (this.mt[this.N-1]&this.UPPER_MASK)|(this.mt[0]&this.LOWER_MASK);
	this.mt[this.N-1] = this.mt[this.M-1] ^ (y >>> 1) ^ mag01[y & 0x1];
	this.mti = 0;
    }
    y = this.mt[this.mti++];
    y ^= (y >>> 11);
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= (y >>> 18);
    return y >>> 0;
}

function FNV() {
    this.hash = 0x811C9DC5 /* offset_basis */
}

FNV.prototype = {
    reset: function() {
        this.hash = 0x811C9DC5;
    },
    update: function(data) {
	if(typeof data === 'string') {
	    data = Buffer(data)
	} else if(!(data instanceof Buffer)) {
	    throw Error("FNV.update expectes String or Buffer")
	}
	for(var i = 0; i < data.length; i++) {
	    this.hash = this.hash ^ data[i]
	    this.hash += (this.hash << 24) + (this.hash << 8) + (this.hash << 7) + (this.hash << 4) + (this.hash << 1)
	}
	return this;
    },
    digest: function(encoding) {
	encoding = encoding || "binary"
	var buf = new Buffer(4)
	buf.writeInt32BE(this.hash & 0xffffffff, 0)
	return buf.toString(encoding)
    },
    value: function() {
	return this.hash & 0xffffffff
    }
}

var gbuf = new Buffer(4);
var fnv = new FNV;

function magic_hash(word, rng) {
    let salt = rng.random_int();
    gbuf.writeInt32BE(salt & 0xffffffff, 0);
    fnv.reset();
    fnv.update(gbuf);
    fnv.update(word);
    return fnv.value();
}

function main(){
    let words = JSON.parse(fs.readFileSync('words.json', 'utf8'));
    let rng = new MT;
    for (let word of words) {
        rng.reset();
        for (let i = 0; i < 45000; i++ ) {
            fs.writeSync(1, magic_hash(word, rng) + '\n');
        }
    }
}

main();
//process.exit(main()||0);


