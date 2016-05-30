"use strict";

var invalids = [
	/[eyuioa]{4}/,		//four or more joint vowels
	/[^eyuioa]{4}/,		//Four or more joint consonants
	/q[^u]/,			//not 'u' after 'q'
	/'[^s]/,			//not 's' after apostrophe
	/[^a-z']/,			//not latin or apostrophe symbol
	/'.{2}/,			//apostrophe not penultimate in the word
	/'$/,				//apostrophe at word's end
];

module.exports = {

	test: function(word) {
		
		word = word.toLowerCase();

		return !invalids.some( function(reg) {
			
			return reg && reg.exec(word);
			
		})
		
	}
}