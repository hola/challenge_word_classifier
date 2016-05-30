var array ;
var myMap = {};
var arrayLen = 0;
var frqSummation = 0 ;
var avgFrq = 0 ;
module.exports = {
    init: function(data) 
	{
		array = data.toString("ascii").split("\n");
		var len = array.length;
		for( var i = 0 ; i < len ; ++i)
		{
				var pair = array[i].trim().split(":");
				var value = parseInt(pair[1]);
				frqSummation+= value;
				myMap[pair[0]] = parseInt(pair[1]);		
		}	
		 avgFrq = frqSummation / len;		
	},
	test: function(word) 
	{
		var charArray =  word.trim().split('');
		var wordLength =  charArray.length;
		var tripletOffset = wordLength - 3 ;
		var j = 0;
		var triplet;	
		var value  = 0 ;
		for( ;j < tripletOffset ; j++){
				 triplet = charArray[j]+charArray[j+1]+charArray[j+2];
				if(triplet in myMap )value+= myMap[triplet];
				else return false;
		}	
		triplet = word.substr(j ,wordLength).trim();
		if(triplet in myMap )value+= myMap[triplet];
				else return false;
		if(value >= avgFrq && value  <= 90000  && word.length > 5 && word. length <= 15 )return true;
		return false;
	} 
	
}