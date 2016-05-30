/* The MIT License (MIT)

Copyright (c) 2016 A.Z.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE */

var arr=new Array(1000000);

exports.init = function(data) {
	
	var b=data.toString();
	var u="";
	var t="";
	
	for(var i=0;i<b.length;i++){
		t=b.charCodeAt(i).toString(2);
		while(t.length % 8 !== 0){
			t="0"+t;
		}
		u+=t;
		
	}
	
	for(var i=0;i<arr.length;i++){
			arr[i]=u[i];
	}
};

exports.test = function(w) {
	if (w.length==1&&w!="'"){
		return true;
	}
	
	if(w[0]=="'"){
		return false;
	}
	
	if (arr[wordHash(w)]!=1){
		return false;
	}
	return true;
};


function activationFunction(sum){
	return 1/(1+Math.exp(-sum));
}

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