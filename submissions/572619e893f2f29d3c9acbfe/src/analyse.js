var fs=require('fs');

var contents=fs.readFileSync(process.argv[2],{encoding:'utf8'});
var words=contents.split("\n");

var Length={};
var minLength=10000;
var maxLength=0;

var maxGl=0;
var maxSl=0;

var maxNum={};
var order={};
var firstLetter={};
var lastLetter={};

var gl='aeiouy';
var sog='bcdfghjklmnpqrstvwxz';

var sav=[];
var iskl=[];

words.forEach(function(value)
{
	var len=value.length;
	if(len>=23) {iskl.push(value); return;}
	else sav.push(value);
	if(len>maxLength) maxLength=len;
	if(len<minLength) minLength=len;
	
	if(!(len in Length)) Length[len]=1;
	else ++Length[len];
	var f=value.charAt(0);
	if(!(f in firstLetter)) firstLetter[f]=1;
	var l=value.charAt(len-1);
	if(!(l in lastLetter)) lastLetter[l]=1;
	var inWord={};
	var g=0;
	var s=0;
	for(var i=0;i<len;++i)
	{
		var c=value.charAt(i);
		if(gl.indexOf(c)>=0)
		{
			if(s>0)
			{
				if(s>maxSl) maxSl=s;
				s=0;
			}
			++g;
		}
		else
		{
			if(g>0)
			{
				if(g>maxGl) maxGl=g;
				g=0;
			}
			++s;
		}
		if(!(c in inWord)) inWord[c]=1;
		else ++inWord[c];
		if(i<len-1)
		{
			var n=value.charAt(i+1);
			if(!(c in order)) order[c]='abcdefghijklmnopqrstuvwxyz\'';
			if(order[c].indexOf(n)>=0) order[c]=order[c].replace(n,'');
			//if(order[c].indexOf(n)<0) order[c].push(n);
		}
	}
	if(s>maxSl) maxSl=s;
	if(g>maxGl) maxGl=g;
	for(var i in inWord)
	{
		if(!(i in maxNum) || inWord[i]>maxNum[i]) maxNum[i]=inWord[i];
	}
});

save('analyse.txt','minLength='+minLength+';\nmaxLength='+maxLength+';\nLength='+JSON.stringify(Length)+';\nmaxGl='+maxGl+';\nmaxSl='+maxSl+';\nmaxNum='+JSON.stringify(maxNum)+';\norder='+JSON.stringify(order)+';\nfirstLetter='+JSON.stringify(firstLetter)+';\nlastLetter='+JSON.stringify(lastLetter));

if(iskl.length>0)
{
	save('iskl.txt',iskl.join("\n"));
	save('wrds.txt',sav.join("\n"));
}

function save(filename,data)
{
	fs.writeFile(filename,data,function(error)
	{
		if(error)
		{
			console.log('Error on saving '+filename+': ');
			console.log(error);
		}
		else console.log(filename+' was saved.');
	});
}