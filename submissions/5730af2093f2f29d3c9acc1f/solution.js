module.exports = {

	normalizedStats: {},

	init: function(data) {
		this.normalizedStats = JSON.parse(data.toString());
	},

	test: function(word) {

		let scores = {
		  '0': 1,
		  '1': 1,
		  '2': 1,
		  '3': 3,
		  '4': 99,
		  '5': 1789,
		  '6': 19314,
		  '7': 276949,
		  '8': 5723448,
		  '9': 136778921,
		  '10': 2941228261,
		  '11': 73850791104,
		  '12': 1584957859432,
		  '13': 32364965008018,
		  '14': 827680406115254,
		  '15': 29113748504896230,
		  '16': 624958138511105800,
		  '17': 20985589825523474000,
		  '18': 208666482816770150000,
		  '19': 4.979762773510154e+21,
		  '20': 6.9816876971380236e+22,
		  '21': 3.110944111764657e+25,
		  '22': 1.7633553214658837e+25,
		  '23': 2.8416026172239315e+25,
		  '24': 4.999442690451929e+25,
		  '25': 1.0885408579871028e+27,
		  '26': 5.158035592155208e+28,
		  '27': 2.6729426900821543e+27,
		  '28': 5.176523534133946e+30,
		  '29': 1.8635559732178213e+31,
		  '30': 9.722544864162617e+24,
		  '31': 272065734157271040000,
		  '32': 1.7412206986065347e+22,
		  '33': 0,
		  '34': 1.4124464126796251e+28,
		  '45': 2.4287424040589874e+33,
		  '58': 67581255116390400000,
		  '60': 0 
		}

		if (word.length <= 2)
			return false;

		// if the word has an apostraphe, but doesn't end with 'apostraphe s' then chances are it's not a real word
		if (word.indexOf('\'') != -1 && (word.substr(word.length - 1) != 's' || word.indexOf('\'') != word.length - 2))
			return false;

		// if the word ends with 'apostraphe s' then cut the word ending
		if (word.indexOf('\'') != -1 && word.indexOf('\'s') == word.length - 2 && word.substr(0,word.length - 2).indexOf('\'') == -1)
			word = word.substr(0, word.length - 2);

		// Couldn't find any word in the test cases that is real and longer than 22 characters
		if (word.length > 22)
			return false;

		// this is rare, but I should still find a better solution
		if (word.length == 2)
			return true;
		if (word.length < 4)
			return false; // todo: maybe i can add a dictionary of all the words here...


		// start calculating
		let wordSum = 1;
		for (let i=0; i<word.length - 2; i++) {
			let wordPart = word.substr(i, 3);
			if (this.normalizedStats.hasOwnProperty(wordPart)) {
				wordSum *= this.normalizedStats[wordPart];
			}
		}

		// this means it's definitely not a real word
		if (wordSum == 0)
			return false;

		let scoreFactor = word.length * 0.2;
		return Math.abs(wordSum - scores[word.length]) <= (scores[word.length] * scoreFactor);
		//return Math.abs(wordSum - lengthScores[word.length].t) < Math.abs(wordSum - lengthScores[word.length].f);

	}

};