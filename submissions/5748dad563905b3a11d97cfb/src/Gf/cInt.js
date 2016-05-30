
const fs = require('fs');
const zlib = require('zlib');

var pathtofiles='.\\data\\';

fileNames=fs.readdirSync(pathtofiles);
var res="";

var rawData="";
var arrForData="";


for(var fff=0;fff<fileNames.length;fff++){ 
console.log(fileNames[fff]);

var data = fs.readFileSync(pathtofiles+fileNames[fff]).toString().split("\n");
var arr=new Array();


arr=new Array(1000000);


for(var i=0;i<arr.length;i++){
	arr[i]=0;
} 
var index=0;

	for(var d=0;d<data.length;d++){
		index=parseInt(data[d]);
		arr[index]=1;

	}
	rawData+=arr.toString().replace(/\,/g,'')+"\n";
	arrForData+=arr.toString().replace(/\,/g,'');
	

}
var tempStr=arrForData.toString().replace(/\,/g,'');
arrForData.length=0;

//Bit packing
console.log("before 8 "+tempStr.length);

var tempStrForLongArr="";

while(tempStr.length % 8 !== 0){
	tempStr+="0";
	
}
console.log("after 8 "+tempStr.length);

for(var i=0;i<tempStr.length;i=i+8){
	for(var j=i;j<i+8;j++){
		tempStrForLongArr+=tempStr[j].toString();
	}
	
	res+=String.fromCharCode(parseInt(tempStrForLongArr,2));
	tempStrForLongArr="";
}
 

var buffer;
	var params={
	level: 9,
	strategy: 1,
	data_type: 0,
}

buffer = zlib.gzipSync(res,params);
	
fs.writeFileSync("data.gz", buffer);

  
fs.writeFileSync("data.dat", res);

 
buffer = zlib.gzipSync(rawData,params);
	
fs.writeFileSync("map.gz", buffer);

  
fs.writeFileSync("map.dat", rawData);
 








