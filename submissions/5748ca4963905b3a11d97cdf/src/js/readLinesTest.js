'use strict'; /*jslint node:true*/
const fs = require('fs');
const vm = require('vm');
const zlib = require('zlib');

var txt=fs.createReadStream('C:/Job/correctExe.lua8');
console.log(txt)

		var lineReader = require('readline').createInterface({
		  //input: fs.createReadStream(testcases)
		  input: fs.createReadStream('C:/Job/correctExe.lua')
		});
		
		var res=[0,0]
		lineReader.on('line', function (line) {
				console.log('line=',line)
				//res[test(context, line)?1:0]++
		});    	
	