var fs = require('fs');
var b={};
var c={};
fs.readFile('pre-words.txt','utf8', function(err, data){
	var a = data.split("\n");
	console.log('No. of words:'+a.length);
	for (var i = 0; i < a.length; i++) {
		if(!b[a[i].length]){
			b[a[i].length]=[];
			b[a[i].length].push(a[i]);
		}else if(b[a[i].length].indexOf(a[i])==-1)
			b[a[i].length].push(a[i]);
		console.log(i);
	};
	for(var len in b){
		fs.writeFileSync('./groups/'+len+'.txt',b[len].sort().join("\n"));
		c[len] = b[len].length;
	}
	fs.writeFile('./groups/metadata.json',JSON.stringify(c),function(err){console.log("Done!")});
});