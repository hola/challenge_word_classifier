function main(word)
{
	isWord = true
	ap = word.split("'");
	
	if ( ap[1] != undefined )
	{
		if ( ap[1].length != 1 && ap[1].length != 4 )
			isWord = false;
		if ( ap[0][ap[0].length-1] == 's' )
			isWord = false;
	}
	
	if ( /(?:sms|eifs|rlid|als|ria|kirk|stric|tires|rwin|biod|dgeon|discri|aros|mpen|beved|vasc|stici|metry|ding|sting|gias|chim|bihard|stled|scenc|rder|ment|ticle|cote|ugga|mxu|oxes|survei|popl|ntil|gicy|sation|raffite|nadahs|dobas|fical|tlondis|extreb|wium|piulg|raran|cygc|uu|rouleme)|(?:[^aeiouy']{4,})|(?:([^aeoiuyls'])\1[^aeoiuy'])|(?:([eou])\2[aeoiu])/.test(word) )
		isWord = false;
	if ( /^[a]+$/.test(ap[0]) )
		isWord = true;
	
	if ( word.length > 29 )
		isWord = false;
	
	return isWord;
}

module.exports = {
  init: function(data){
		// m-m-m-monster test :~)
    // м-м-м-монстер тест :~)
    console.log('Бдыщь. Бдух... Инициализация')
		console.log('Bdish. Bdooh... Initialization')
		
		console.log('Let\'s start this competition!')
  },
  test: main
}