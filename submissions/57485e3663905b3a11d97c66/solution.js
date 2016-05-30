var rootNode = {arr: [], bitMask: 0, hashCode: 0};
var dataGlobal = null;
var iGlobal = 0;

var init = function(data){	
	dataGlobal = data;
	makeTrieRecursive(rootNode);
}

var test = function(word){	
	
		wordPrefix = word.substring(0,4);
		return containsRecursive(word, wordPrefix, rootNode);
	
}

var containsRecursive = function(word, wordPrefix, currNode){	
	if (wordPrefix.length == 0){
		if(currNode.bitMask % 2 == 1){
			var maxLen = currNode.bitMask >> 1;			
			if(word.length > maxLen){
				return false;
			}
			else{					
				//return checkHash(word, currNode.hashCode);
				return true;
			}
		}
		else{
			return false;
		}
	}
	if (currNode.arr[charToIndex(wordPrefix.charCodeAt(0))]){
		return containsRecursive(word, wordPrefix.substring(1), currNode.arr[charToIndex(wordPrefix.charCodeAt(0))]);
	}
	else return false;
}

var checkHash = function(word, hashCode){
	var hashInt = hashCodeCalc(word);
	if (hashInt < 0) hashInt = -hashInt;
	var index = hashInt % 7;
	var retVal = 1;
	retVal = retVal << index;
	retVal = retVal & hashCode;
	return (retVal != 0) ? true : false;
}

var hashCodeCalc = function(str) {
	var hash = 0;
    if (str.length == 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash;
    }
    return hash;
}

var makeTrieRecursive = function(currNode){
	while(iGlobal != dataGlobal.length){
		if (dataGlobal[iGlobal] == 123){
			//read bit mask
			currNode.bitMask = dataGlobal[iGlobal+1];
			//currNode.hashCode = dataGlobal[iGlobal+2];
			iGlobal = iGlobal + 2;
			return;
		}
		
		var index = charToIndex(dataGlobal[iGlobal])
		currNode.arr[index] = {arr: [], bitMask: 0, hashCode: 0};
		iGlobal++;
		
		makeTrieRecursive(currNode.arr[index]);
	}
}

var charToIndex = function(c){
	if (c == 39){
		return 26;
	}
	return c - 97;
}


module.exports = {
	init: init,
	test: test
}

