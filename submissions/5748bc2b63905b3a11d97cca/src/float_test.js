
var fs = require("fs");
var f = fs.readFile('floats', function (err, data)
{
	console.log(err);
	for (var i=0; i<4; i++)
	{
		console.log(data.readFloatLE(i<<2));
	}
	for (var i=0; i<4; i++)
	{
		//console.log(data.readDoubleLE(i<<3));
	}
	for (var i=0; i<4; i++)
	{
		var val = data.readUInt32LE(i<<2);
		var ary = []
		for (var j=0; j<32; j++)
		{
			ary.push(val&1);
			val >>= 1;
		}
		ary.reverse();
		console.log(ary.join(''));
	}
});

