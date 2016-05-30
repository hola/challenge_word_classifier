/*
 *
 * Copyright (c) 2016 Mike Yudaken
 * All rights reserved.
 *
 * This software may be modified and distributed 
 * under the terms of the BSD license.
 * 
 */


'use strict';

var grams;
	/*
	 grams = {
	 			"2":["aa", "ab", ....     ], // all (2 letter) diagrams
	 			"3":["aac", "aai", ...    ], // all (3 letter) trigrams
	 			"short":["a","b", ...     ], // all short (1, 2, 3 char) words
				"long":["llanfair...", ...]  // all long (>= 18 char) words
	}
	*/

exports.init = function(data){
	grams = JSON.parse(data);
}

exports.test = function(word){
	word = word.toLowerCase();
	if (word.length <= 3)
		return(grams.short.indexOf(word) >= 0);
	
	var result = word.match(/^(.+?)('s)?$/);
	word = result[1];

	if (word.length >= 18)
		return(grams.long.indexOf(word) >= 0);

	let undefined_count = 0;
	for (let n = 2; n <= 3; n++){
		if (n < word.length){
			for (let k = 0; k < word.length - n + 1; k++){
				let gram = word.slice(k, k + n);
				let defined = (grams[n].indexOf(gram) >= 0);
				if (!defined)
					undefined_count++;
			}
		}
	}
	return(undefined_count == 0);
}

