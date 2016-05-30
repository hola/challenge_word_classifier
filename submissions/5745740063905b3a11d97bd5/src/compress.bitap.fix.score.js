const fs = require('fs');
var words = fs.readFileSync('../data/words.txt', 'utf8');
var wordArr = words.split(/\r?\n/);
var wordScoreData = fs.readFileSync('../data/wordScores.json', 'utf8');
var wordScores = JSON.parse(wordScoreData);
wordArr.sort((a,b) => { 
      if(a.length == b.length)return 0;
      return (a.length < b.length?-1:1);
});

const WORD_TEXT = 0, WORD_SCORE= 1;

for(var w=0, wl=wordArr.length/2; w<wl; ++w){
	//find word
	console.log('fixing:'+wordArr[w]);
	for(var s=0, sl=wordScores.length; s<sl; ++s){
		if(wordScores[s][WORD_TEXT] === wordArr[w]){
			wordScores[s][WORD_SCORE] -= wordArr[w].length;
			break;
		}
	}		
}
wordScores.sort((a,b) => {
		if(a[WORD_SCORE]==b[WORD_SCORE]){
			if(a[WORD_TEXT].length == b[WORD_TEXT].length)return 0;
			return (a[WORD_TEXT].length > b[WORD_TEXT].length?-1:1);
		}
		return (a[WORD_SCORE] > b[WORD_SCORE]?-1:1);
	});

fs.writeFileSync('../data/wordScores.fix.json',JSON.stringify(wordScores));