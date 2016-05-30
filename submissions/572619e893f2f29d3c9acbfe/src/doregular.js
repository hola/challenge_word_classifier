var fs=require('fs');
var contents=fs.readFileSync(process.argv[2],{encoding:'utf8'});

var words=contents.split("\n");
var library={'_':0};
words.forEach(function(value)
{
	if(value==='') return;
	var len=value.length;
	var tmp=library;
	for(var i=0;i<len;++i)
	{
		var c=value.charAt(i);
		if(!(c in tmp))
		{
			tmp[c]={0:false,'_':0};
			tmp['_']++;
		}
		tmp=tmp[c];
	}
	tmp[0]=true;
});
var recursLibrary=function(library)
{
	for(var i in library)
	{
		if(i==0 || i=='_') continue;
		recursLibrary(library[i]);
	}
	for(var i in library)
	{
		if(i==0 || i=='_') continue;
		if(library[i][0]===false && library[i]['_']==1)
		{
			var j;
			for(j in library[i])
			{
				if(j!=0 && j!='_') break;
			}
			library[i+j]=library[i][j];
			delete library[i];
		}
	}
	
};
recursLibrary(library);

var regular='';
var reg=function(library)
{
	var out=[];
	for(var i in library)
	{
		if(i==0 || i=='_') continue;
		var tmp=i;
		var buf=reg(library[i]);
		if(buf!='()')
		{
			tmp+=buf;
			if(library[0]) tmp+='?';
		}
		out.push(tmp);
	}
	return '('+out.join('|')+')';
};
regular+=reg(library);
save(process.argv[3]||'regular.txt',regular);

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