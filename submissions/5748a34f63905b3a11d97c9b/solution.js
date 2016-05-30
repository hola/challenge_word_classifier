var trie = {}, letter = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "k", "l", "m", "n", "o", "p", "r", "t", "u", "w", "x", "y", "z"];

var searchWord = (word) => {
	var bufWord = word, node = trie, kost = true;

	while (kost) {
		if (Object.keys(node).length > 0) {
			for (var key in node) {
				if (bufWord == key) {
					kost = false;
					return true;
				} else {
					if (bufWord.indexOf(key) == 0) {
						bufWord = bufWord.substr(key.length);
						node = node[key];
						break;
					} else {
						if (key == Object.keys(node)[Object.keys(node).length - 1]) {
							kost = false;
							return false;
						}
					}
				}
			}
		} else {
			kost = false;
			return false;
		}
	}
};

exports.init = (buffer) => {
	var data = buffer.toString();
	data = data.replace(/([a-z]{1,})\{/g, "$1:\{")
				.replace(/([a-z]{1,})\}/g, "$1:\{\}\}")
				.replace(/([a-z]{1,}),/g, "$1:\{\},")
				.replace(/([a-z]{1,})/g, "\"$1\"");

	trie = JSON.parse(data);
};

exports.test = (word) => {
	var bufWord = word;
	if (word.replace(/^(.*)'s$/, "") === "") {
		word = word.replace(/^(.*)'s$/, "$1");
		if (word.indexOf("'") !== -1) {
			return false;
		}
	} else {
		if (word.indexOf("'") !== -1) {
			return false;
		}
	}

	if (searchWord(word)) {
		return true;
	}

	if (word.replace(/^(.*)ing$/, "") === "") {
		word = word.replace(/^(.*)ing$/, "$1");

		if (searchWord(word)) {
			return true;
		}
	}

	if (word.length < 3 && word.replace(/[a-z]{1,2}/, "") === "") {
		return true;
	} else {
		if (word.length < 3) {
			return false;
		}
	}

	if (word.replace(/^(.*)s$/, "") === "") {
		word = word.replace(/^(.*)s/, "$1");

		if (searchWord(word)) {
			return true;
		}
	}

	for(var i = 0; i < letter.length; i++) {
		if (searchWord(word + letter[i])) {
			return true;
		}
	}

	if (bufWord.replace(/^.*[^euioya']{4,}.*$/, "") === "" ||
		bufWord.replace(/^.*[euioya]{4,}.*$/, "") === "" ||
		bufWord.replace(/^(.)\1.*$/, "") === "" ||
		bufWord.replace(/^.*(.)\1\1.*$/, "") === "" ||
		bufWord.replace(/^.*'[a-rt-z']{1,}$/, "") === "" ||
		bufWord.replace(/^.*(vw|fq|vk|hv|yv|iy|mz|qw|wq|wv|vq|zq|qz|qa|uy|gk|qf|qv).*$/, "") === "" ||
		bufWord.length > 15) {
		return false;
	}

	return true;
};