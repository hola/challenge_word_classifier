const fs = require('fs');
const zlib = require('zlib');

var words=fs.readFileSync("words.txt").toString().split("\n");

console.log("Initial words count: "+words.length);
var objWords={};
for(var i=0;i<words.length;i++){
	if(words[i].length>1)//пусть в проверке, она лёгкая
		objWords[words[i].toLowerCase().replace("\t","")]=1;
}

var arrToWrite=[];
var testObj={};
var wordCounter=0;
var testCounter=0;
var curHash="";
Object.keys(objWords).forEach(function(key) {

	curHash=wordHash(key);
	
	arrToWrite.push(curHash);
	testObj[curHash]=1;
	wordCounter++;
});

var uniqueArrToWrite=[];
Object.keys(testObj).forEach(function(key) {
		uniqueArrToWrite.push(key);
		
		if((key.split("'").length - 1)>1){
			console.log(key);
		}
		
		testCounter++;
});



arrToWrite.sort(function(a,b){return a - b;});

uniqueArrToWrite.sort(function(a,b){return b - a;});
var buffer;
var params={
	level: 9,
	strategy: 1,
	data_type: 0
}
console.log("Words: "+wordCounter+" Numbers: "+testCounter);
fs.writeFileSync("arrToWrite.dat",arrToWrite.join("\n"));
fs.writeFileSync("uniqueArrToWrite.dat",uniqueArrToWrite.join("\n"));

//hash for a word
function wordHash(key){
		var tempNum=0;
		var currentCode=0;
		var tempStr="";
		var hashLenght=6;
	
	for(var i=0;i<key.length;i++){
		
		currentCode=key.charCodeAt(i);
		if (currentCode==39){
			currentCode=0;
		} else {
			currentCode=currentCode-96;
		}
		
		tempNum+=Math.pow((currentCode),(i+1)/9);
		
	}
	
	tempNum=tempNum+key.length;
	tempNum=tempNum.toString().replace(".","");
	tempNum=activationFunction("0."+tempNum); 
	tempStr=tempNum.toString().replace(".","").substring(2,hashLenght+1);
  	while(tempStr.length<hashLenght){
		tempStr=key.length.toString().substring(0,1)+tempStr;
	}  
	return tempStr;
}

function activationFunction(sum){
	
	//Sigmoid
	return 1/(1+Math.exp(-sum));
}
