'use strict';

const CONSONANT = 'bcdfghjklmnpqrstvwxyz';
const VOWEL = 'aeiou';
const CONSONANT_KEY = 'CONSONANT';
const VOWEL_KEY = 'VOWEL';

module.exports = {
	init(data) {
		this.data = JSON.parse(data.toString());
	},
	
	test(word) {
		let score = 0;
		
		for (let segment of this.data.segments) {
			for (let test of segment.tests) {
				let testExp = this._createExpression(test);
				let match = word.match(testExp);
				
				if (match) {
					score += match[0].length * segment.multiplier;
				}
			}
		}
		
		return score >= 0;
	},
	
	_createExpression(test) {
		const normalisedTest = test.replace(CONSONANT_KEY, CONSONANT).replace(VOWEL_KEY, VOWEL);
		
		return new RegExp(normalisedTest, 'gi');
	}
};