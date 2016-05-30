module.exports = {
	test: test,
	init: init
};

function Bloom(m) {
	this.m = m;
	this.buckets = [];
}

Bloom.prototype.loc = function loc(str) {
	var a = fnv1(str), b = fnv2(a), x = a % this.m;
	return x < 0 ? (x + this.m) : x;
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

var bloom;
var right;
var short;
var hash4;
var sex;

function test(word) {
	if (word.length > 13) return false;
	if (word.length < 6) return check(word, short);

	var b1 = check(word.slice(0, Math.min(word.length, 6)), bloom);
	var b2 = word.length > 6 ? check(word.slice(6), right) : true;
	var b3 = sex.test(word.slice(0, 2) + soundex(word.slice(2, Math.min(word.length, 10))).toLowerCase());
	var b4 = check2(word, hash4);

	return b1 && b2 && b3 && b4;
}

function check(str, filter) {
	return filter.test(str);
}

function check2(str, filter) {
	for (var i = 0; i < str.length - 3 && i < 5; i++) {
		if (!(check(str.slice(i, i + 4) + i, filter))) return false;
	}

	return true;
}

var soundex = function (s) {
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
};

function init(buf) {
	bloom = new Bloom(280 * 1000);
	right = new Bloom(90 * 1000);
	short = new Bloom(40 * 1000);
	hash4 = new Bloom(40 * 1000);
	sex = new Bloom(90 * 1000);

	for (var i = 0; i < 8750; i++) {
		bloom.buckets[i] = buf.readInt32BE(4 * i);
	}

	for (var i = 8750; i < 11563; i++) {
		right.buckets[i - 8750] = buf.readInt32BE(4 * i);
	}

	for (var i = 11563; i < 12813; i++) {
		short.buckets[i - 11563] = buf.readInt32BE(4 * i);
	}

	for (var i = 12813; i < 14063; i++) {
		hash4.buckets[i - 12813] = buf.readInt32BE(4 * i);
	}

	for (var i = 14063; i < 16876; i++) {
		sex.buckets[i - 14063] = buf.readInt32BE(4 * i);
	}
}
