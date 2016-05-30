function main(word){
	var data  = pdata[2];
	
	for(var i=0,j=0;i<word.length;i+=2,j++){
		var str = word.substr(i,2);

		if (data[j].indexOf(str)==-1) return false;
	}
	

	
	data  = pdata[3];

	var t = word[0];
	if (word.length>2)
		t+=word[2];
	if (word.length>4)
		t+=word[4];
	if (data[0].indexOf(t) === -1) return false;
	
	

	
	return true;
}
var pdata = {};
function getOneCommbination(arr) {
 var output = [];
 var current = [];
 for (var i = 1; i < arr.length; i++) {
  var item = arr[i];
  if (item.indexOf(':') !== -1) {
   output.push(current);
   current = [];
   continue;
  }
  current.push(item.trim());
 }
 
 return output;
}

function getDataFromFile(str) {
 var spl = str.split('#');
 
 
 var two = getOneCommbination(spl[0].trim().split("\r"));
 var three = getOneCommbination(spl[1].trim().split("\r"));
 
 return { 2: two, 3: three };
}


module.exports = {
	
  init: function(data){
    var line = data.toString("ascii");
	//console.log(line);
	pdata = getDataFromFile(line);
  },
  test: main
}