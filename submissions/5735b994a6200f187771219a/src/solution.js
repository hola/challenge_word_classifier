'use strict'

function Bloom(size) {
	var data;

	if (typeof size !== 'number') {
		data = size;
		size = data.length * 8;
	}

	var n = Math.ceil(size / 8);
	this.m = n * 8;
	var buckets = this.buckets = new Int8Array(n);

	if (data) {
		for (var i = 0; i < n; ++i) {
			buckets[i] = data[i];
		}
	}
}

Bloom.prototype.add = function (str) {
	var index = this.index(str);
	var buckets = this.buckets;
	buckets[Math.floor(index / 8)] |= 1 << (index % 8);
};

Bloom.prototype.test = function (str) {
	var index = this.index(str);
	var buckets = this.buckets;

	if (!(buckets[Math.floor(index / 8)] & (1 << (index % 8)))) {
		return false;
	}

	return true;
};

Bloom.prototype.index = function (str) {
	var h = hash(str) % this.m;
	return h < 0 ? (h + this.m) : h;
};

function hash(str) {
	var hash = 123;

	for (var i = 0, n = str.length; i < n; ++i) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i);
	}

	return hash;
}

var MAX_WORD_SIZE = 15;
var MAX_WORD_SIZE_BLOOM = 8;

var bloom;

function init(data) {
	bloom = new Bloom(data);
}

function test(word) {
	return heuristic(word) && bloom.test(stem(word));
}

function heuristic(word) {
	var rare = word.match(/[jqxz]/g);

	return !(word.length > MAX_WORD_SIZE
		|| word.match(/'(?!s$)/)
		|| word.match(/[bcdfghjklmnpqrstvwxz]{5,}/)
		|| word.match(/[bcdfgjpqvwxz]{3,}/)
		|| word.length > 3 && !word.match(/[aeiouy]/)
		|| rare && rare.length > 2);
}

function stem(word) {
	return word
		.replace(/(s?')?s$/, '')
		.replace(/^non/, '')
		.replace(/^(un|de)(.+)(able|ability|ing|ingly|ingness|ed)$/, '$1')
		.replace(/(able|ability|ing|ingly|ed|er|ment)$/, '^')
		.replace(/(ion|ive|ively|ivity)$/, '%')
		.replace(/ful(ly)?$/, '')
		.substr(0, MAX_WORD_SIZE_BLOOM);
}

exports.Bloom = Bloom;
exports.heuristic = heuristic;
exports.stem = stem;

exports.init = init;
exports.test = test;
