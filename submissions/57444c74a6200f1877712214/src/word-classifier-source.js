function hash(word) {
	var s = 0;

	for (var c of word)
		s += c.charCodeAt(0);

	return s;
};

var data;

module.exports = {
	init: function(newData) {
		data = JSON.parse(newData.toString());
	},

	test: function(word) {
		var wordSize = word.length;
		var wordHash = hash(word);

		return wordSize in data && wordHash in data[wordSize] && new RegExp(data[wordSize][wordHash]).test(word);
	}
};