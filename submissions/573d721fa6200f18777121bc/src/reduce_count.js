var fs = require('fs');
var b=[];
fs.readFile('words.txt','utf8', function(err, data){
	var a = data.split("\n");
	console.log('No. of words:'+a.length);
	for (var i = 0; i < a.length; i++) {
		a[i] = a[i].toLowerCase();
		if(/'s$/.test(a[i])==false)
			b.push(a[i])
	};
	fs.writeFile('pre-words.txt',b.join("\n"), function(err){
		if(err)
			console.log(err);
		else
			console.log("Pre-processed!");
	});
});