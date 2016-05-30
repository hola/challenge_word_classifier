var fs = require('fs');
var zlib = require('zlib');

function Bloom(m) {
	this.m = m;
	this.buckets = [];
}

Bloom.prototype.init = function init() {
	for (var i = 0, end = Math.ceil(this.m / 32); i < end; i++) {
		this.buckets[i] = 0;
	}
};

Bloom.prototype.loc = function loc(str) {
	var a = fnv1(str), b = fnv2(a), x = a % this.m;
	return x < 0 ? (x + this.m) : x;
};

Bloom.prototype.add = function add(str) {
	var l = this.loc(str);
	this.buckets[Math.floor(l / 32)] |= 1 << (l % 32);
};

Bloom.prototype.test = function test(str) {
	var l = this.loc(str);
	return ((this.buckets[Math.floor(l / 32)] & (1 << (l % 32))) !== 0);
};

function fnv1(str) {
	var h = 2166136261, c, d;

	for (var i = 0; i < str.length; i++) {
		c = str.charCodeAt(i);
		d = c & 0xff00;
		h = d ? fnvMultiply(h ^ d >> 8) : h;
		h = fnvMultiply(h ^ c & 0xff);
	}
	
	return fnvMix(h);
}

function fnv2(h) {
	return fnvMix(fnvMultiply(h));
}

function fnvMultiply(h) {
	return h + (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
}

function fnvMix(h) {
	h += h << 13;
	h ^= h >>> 7;
	h += h << 3;
	h ^= h >>> 17;
	h += h << 5;
	return h & 0xffffffff;
}

function soundex(s) {
	var a = s.toLowerCase().split(''),
	f = a.shift(),
	r = '',
	codes = {
		a: '', e: '', i: '', o: '', u: '',
		b: 1, f: 1, p: 1, v: 1,
		c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
		d: 3, t: 3,
		l: 4,
		m: 5, n: 5,
		r: 6
	};
	
	r = f +
	a
	.map(function (v, i, a) { return codes[v]; })
	.filter(function (v, i, a) {
		return ((i === 0) ? v !== codes[f] : v !== a[i - 1]);
	})
	.join('');
	
	return (r + '000').slice(0, 4).toUpperCase();
}

var bloom = new Bloom(280 * 1000);
var right = new Bloom(90 * 1000);
var short = new Bloom(40 * 1000);
var hash4 = new Bloom(40 * 1000);
var sex = new Bloom(90 * 1000);

fs.readFileSync('clean6.txt', 'utf-8')
.split('\n')
.forEach(w => bloom.add(w));

fs.readFileSync('cleanright.txt', 'utf-8').split('\n')
.forEach(w => right.add(w));

fs.readFileSync('words.txt', 'utf-8').split('\n')
.filter(w => w.length < 6)
.forEach(w => short.add(w));

fs.readFileSync('hash4.txt', 'utf-8').split('\n')
.forEach(w => hash4.add(w));

var set = [];
fs.readFileSync('words.txt', 'utf-8').split('\n')
.filter(function(word) {
	return word.length >= 6 && word.length <= 13;
})
.map(function(word) {
	return word.slice(0, 2) + soundex(word.slice(2, Math.min(word.length, 10))).toLowerCase();
}).forEach(function(it) {
	if (set.indexOf(it) < 0) {
		set.push(it);
	}
});

set.forEach(w => sex.add(w));

var buf = new Buffer((bloom.buckets.length + right.buckets.length + short.buckets.length + hash4.buckets.length + sex.buckets.length) * 4);
var offset = 0;

for (var k in bloom.buckets) {
	buf.writeInt32BE(bloom.buckets[k], 4 * (offset++));
}
console.log('offset ' + offset);

for (var k in right.buckets) {
	buf.writeInt32BE(right.buckets[k], 4 * (offset++));
}
console.log('offset ' + offset);

for (var k in short.buckets) {
	buf.writeInt32BE(short.buckets[k], 4 * (offset++));
}
console.log('offset ' + offset);

for (var k in hash4.buckets) {
	buf.writeInt32BE(hash4.buckets[k], 4 * (offset++));
}
console.log('offset ' + offset);

for (var k in sex.buckets) {
	buf.writeInt32BE(sex.buckets[k], 4 * (offset++));
}
console.log('offset ' + offset);

fs.writeFileSync('data.gz', zlib.gzipSync(buf));

