//var blomFilter = require("./BloomFilter.js");


var fs = require('fs');


/********** create a hash map of triplet frquency *********/


var actualSourceBuffer = fs.readFileSync("./words.txt");
var allWords = actualSourceBuffer.toString("ascii").split("\n");

var ttlWords = allWords.length;



var map = {};


var valueMap = {};
var tuples = []

var maxLen = 0 ;
		
	for(var i = 0 ; i < ttlWords ; ++i )
	{
		allWords[i] = allWords[i].trim().toLowerCase()
		var charArray =  allWords[i].trim().split('');
		var wordLength =  charArray.length;
		var tripletOffset = wordLength - 3 ;
		
		maxLen += wordLength ;
		//console.log("\n current word : " + allWords[i]);
		var j = 0;
		var triplet;
		var value = 0 ;
		for( ;j < tripletOffset ; j++){
				 triplet = charArray[j]+charArray[j+1]+charArray[j+2];
				if(triplet in map ){
					++map[triplet];
					value+= map[triplet];
				}
				else{
					map[triplet] = 1;
					++value;

				}	
				//console.log("inside triplet : " + triplet + " len : " + triplet.length + " ofset : " + tripletOffset);
		}	
		
		triplet = allWords[i].substr(j ,wordLength).trim();
		//console.log("outside triplet : " + triplet + " len : " + triplet.length + " ofset : " + tripletOffset);

		if(triplet in map )
		{
			++map[triplet];
			value+= map[triplet];
		}
		else
		{	
			map[triplet] = 1;
			++value;

		}
		
		if(value in valueMap)
			++valueMap[value];
		else
			valueMap[value] = 1;
		
	}	

	
	console.log("avg length : " + maxLen / ttlWords);
/********** dump frequency to ttl words map ****************/
for (var key in valueMap) tuples.push([key, valueMap[key]]);
tuples.sort(function(a, b) {
    a = a[1];
    b = b[1];

    return a < b ? -1 : (a > b ? 1 : 0);
});

var text = "" ; 
for (var i = 0; i < tuples.length; i++) {
    var key = tuples[i][0];
    var value = tuples[i][1];

	//if(key.length == 3 && value <= 6 )
		//continue;
	text += key.trim() + ":" +  value    + "\n"; 

}

fs.writeFileSync('./freqToTTlWords.txt', text.trim() , 'ascii');



/************ sort map *******************/


 tuples = [];
for (var key in map) tuples.push([key, map[key]])
tuples.sort(function(a, b) {
    a = a[1];
    b = b[1];

    return a < b ? -1 : (a > b ? 1 : 0);
});


/************ dump sorted map *****************/


var text  = "" ;

console.log("starting dumping ....");
var start = new Date().getTime();
for (var i = 0; i < tuples.length; i++) {
    var key = tuples[i][0];
    var value = tuples[i][1];

	if(key.length == 3 && value <= 6 )
		continue;
	text += key.trim() + ":" +  (  parseFloat( value ) )   + "\n"; 

}


//var keys = Object.keys(map);
//var len = keys.length;

var end = new Date().getTime();
var time = end - start;

console.log('Execution time: ' + time);
console.log("finished hurray ....");



//************** dump keys from triplet sorted map ***************/


fs.writeFileSync('./tripletMap.txt', text.trim() , 'ascii');

var actualSourceBuffer = fs.readFileSync("./tripletMap.txt");
var allWords = actualSourceBuffer.toString("ascii").split("\n");
var text = "";
var total =0.0;
for(var i = 0 ; i < allWords.length ; ++i)
{
	var pair = allWords[i].trim().split(":");
	//console.log(pair[0]+":"+pair[1]);
	text+=pair[0]+"\n";
	total+= parseFloat(pair[1]);
}

console.log(  total);

fs.writeFileSync('./buffer.txt', text.trim() , 'ascii');
