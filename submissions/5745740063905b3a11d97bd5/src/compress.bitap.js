const fuse = require('./fuse.js');

exports.compress = function(wordData){
	const WORD_TEXT = 0, WORD_SCORE= 1;
	var words = wordData.split(/\r?\n/);
	var wordScores = new Array(words.length);

	words.sort((a,b) => { 
      if(a.length == b.length)return 0;
      return (a.length < b.length?-1:1);
    });

	
	var f = new fuse(words,{threshold:0.2});
	
	for(var w=0, wl=words.length; w<wl; ++w){
		wordScores[w] = [words[w],0];
	}	

	for(var w=0, wl=words.length/2; w<wl; ++w){
		var matches = f.search(words[w]);
		console.log('searching:'+words[w]+' matches.length:'+matches.length);
		for(var m=0, ml=matches.length; m<ml; m++){
			wordScores[matches[m]][WORD_SCORE] += words[w].length;
		}	
	}

	wordScores.sort((a,b) => {
		if(a[WORD_SCORE]==b[WORD_SCORE]){
			if(a[WORD_TEXT].length == b[WORD_TEXT].length)return 0;
			return (a[WORD_TEXT].length > b[WORD_TEXT].length?-1:1);
		}
		return (a[WORD_SCORE] > b[WORD_SCORE]?-1:1);
	});

	//console.log(wordScores[0]);
	return wordScores;
}