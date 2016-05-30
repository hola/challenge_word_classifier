function hash(word) {
	var s = 0;

	for (var c of word)
		s += c.charCodeAt(0);

	return s;
};

function Pattern(size) {
	this.count = 0;
	this.chains = [];

	while (size-- > 0)
		this.chains.push([]);
};

Pattern.prototype = {
	addWord: function(word) {
		this.count++;

		for (var i = 0; i < word.length; ++i)
			if (!this.chains[i].includes(word[i]))
				this.chains[i].push(word[i]);
	},

	compact: function(str) {
		var out = "";

		var last = 0;
		var add = false;
		for (var i = 0; i < str.length; ++i) {
			if (str.charCodeAt(i) - last == 1 && i + 1 < str.length && str.charCodeAt(i + 1) - last == 2) {
				if (!add)
					out += "-";
				add = true;
			}
			else {
				add = false;
				out += str.charAt(i);
			}
			last = str.charCodeAt(i);
		}

		return out;
	},

	create: function() {
		if (this.count < 5)
			return ".";

		for (var chain of this.chains)
			chain.sort();

		var str = "";
		for (var chain of this.chains) {
			str += "[";

			var chars = "";
			for (var c of chain)
				chars += c;
			chars = this.compact(chars);

			str += chars + "]";
		}

		return str;
	}
};

var fs = require("fs");

var words = fs.readFileSync("words.txt", "utf8");
words = words.toLowerCase();
words = words.split("\n");

var data = {};
for (var word of words) {
	var wordSize = word.length;
	var wordHash = hash(word);

	if (wordSize < 5 || wordSize > 17)
		continue;

	if (!(wordSize in data))
		data[wordSize] = {};

	if (!(wordHash in data[wordSize]))
		data[wordSize][wordHash] = new Pattern(wordSize);

	data[wordSize][wordHash].addWord(word);
}

for (var wordSize in data)
	for (var wordHash in data[wordSize])
		data[wordSize][wordHash] = data[wordSize][wordHash].create();

fs.writeFileSync("data.json", JSON.stringify(data));
