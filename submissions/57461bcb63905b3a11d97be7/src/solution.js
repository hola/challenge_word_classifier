var data;

function test(hash) {
	return (data[Math.floor(hash / 8)] >>> (hash % 8)) & 1;
}

function hash(word, seed) {
	var result = 1;
	for (var i of word)
		result = (seed * result + i.charCodeAt(0)) & 0x7FFFFFFF;

	return result;
}

function filter(word) {
	"'s s ing ed nesse ly nes ation able er al est ility ate like ship itie ville les ment e ic ou ism ist ology ity y i iform oid ful ing".split(' ').forEach((end) => {
		if (word.endsWith(end)) word = word.slice(0, -1 * end.length);
	});
	"un non over super inter anti pre sub semi out der ps".split(' ').forEach((begin) => {
		if (word.startsWith(begin)) word = word.slice(begin.length, word.length);
	});
	return word;
}

function filterExp(word) {
	if (word.split(/[aeiou]/).filter((w) => w.length > 4).length > 0)
		return false;
	if (word.split(/['ijqy]/).pop().length == 0)
		return false;
	if (word[0] == 'x')
		return false;
	return word != "";
}
var count = 0;
var dict = {};
var dictFiltered = {};

function filterStat(word, word2) {

	if (count > 13100000) return dict[word] > count / 660000 / 4;

	if (!dict[word]) dict[word] = 0;
	++dict[word];
	++count;
	if (count > 660000 * 4) {
		dictFiltered = {};
		return dict[word] > count / 660000 / 4;
	}

	if (!dictFiltered[word2]) dictFiltered[word2] = 0;
	++dictFiltered[word2];
	return dictFiltered[word2] > count * 3 / 660000 / 4;
}

exports.init = function (inp) {
	data = inp;
};

exports.test = function (word) {
	var size = 67 * 1024 * 8 - 1;
	var word2 = filter(word);
	var bloom = test(hash(word2, 2) % size) && test(hash(word2, 111) % size);
	var stat = filterStat(word, word2);
	var exp = filterExp(word2);
	return bloom && stat && exp;
};