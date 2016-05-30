function init() {

}

function lastOf(index, word, str) {
	var last = word.slice(-index);
	return last == str ? true : false;
}

function test(word) {

	//TRUE: If single character
	if(word.length == 1) {
		return true
	}

	//FALSE: If long word
	if(word.length > 14) {
		return false
	}

	if(lastOf(3, word, "ing") || lastOf(4, word, "ness")) {
		return true
	}

	word = word.replace("\'", "");
	//TRUE:  If word's second letter is "b", and first character is vowel
	if(word[1] == "b") {
		if(["a", "e", "i", "o", "u"].indexOf(word[0]) > -1) {
			return true
		}
	}

	//TRUE: If word's second letter is vowel
	if(word.length > 2) {
		if(["a", "e", "i", "o", "u"].indexOf(word[1]) > -1) {
			return true
		} else {
			return false
		}
	}
}

module.exports = {
  init: init,
       
  test: test
};