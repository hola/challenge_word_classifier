var fs = require('fs');


var actualSourceBuffer = fs.readFileSync("./words.txt");
var allWords = actualSourceBuffer.toString("ascii").split("\n");

var ttlWords = allWords.length;

var tuples = {};

var pairBuffer = fs.readFileSync("./tripletMap.txt");
var allPairs = pairBuffer.toString("ascii").split("\n");


for(var i = 0 ; i < allPairs.length ; ++i)
{
	var pair = allPairs[i].trim().split(":");
	tuples[pair[0]]  = pair[1] ;
	//console.log(pair[0] + " " + tuples[pair[0]]);
}



var text  = [];

for(var i = 0 ; i < ttlWords ; ++i )
	{
		var probValue = 0.0;
		allWords[i] = allWords[i].trim().toLowerCase()
		var charArray =  allWords[i].trim().split('');
		var wordLength =  charArray.length;
		var tripletOffset = wordLength - 3 ;
		//console.log("\n current word : " + allWords[i]);
		var j = 0;
		var triplet;
		for( ;j < tripletOffset ; j++){
				 triplet = charArray[j]+charArray[j+1]+charArray[j+2];
				probValue += parseFloat(tuples[triplet.trim()]);
		}	
		
		triplet = allWords[i].substr(j ,wordLength).trim();
		//console.log("outside triplet : " + triplet + " len : " + triplet.length + " ofset : " + tripletOffset);
		probValue += parseFloat(tuples[triplet.trim()]);
		
		text.push([allWords[i].trim() , probValue ]);	
	}	
	
	text.sort(function(a, b) {
    a = a[1];
    b = b[1];

    return a < b ? -1 : (a > b ? 1 : 0);
});
	
	
	var dump = "";
	
	var probabilityToTTlWords = {};
	
	for (var i = 0; i < text.length; i++) {
    var key = text[i][0];
    var value = text[i][1];
	
	if(value in probabilityToTTlWords)
		++probabilityToTTlWords[value];
	else
		probabilityToTTlWords[value] = 1;
	

	dump += key.trim() + ":" +  value + "\n"; 
}
	fs.writeFileSync('./probabilityActual.txt', dump.trim() , 'ascii');

	
/************* dumping probability value to ttl words */	
	var dump = "";
	var ttl = 0 ;
	for(var key in probabilityToTTlWords){
		dump+= key + ":" + probabilityToTTlWords[key]+"\n";
		ttl+=  probabilityToTTlWords[key];
	}
	
	console.log(ttl);
	fs.writeFileSync('./probabilityToTTlWords.txt', dump.trim() , 'ascii');
