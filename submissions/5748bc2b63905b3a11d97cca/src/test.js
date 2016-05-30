var fs = require("fs");
var main = require("./main_compressed");

var f = fs.readFile('data/test_small.csv', function (err, data)
{
	if (err)
	{
		console.log(err);
		return;
	}
	if (main.init)
	{
		main.init(fs.readFileSync('data.bin'));
	}
	var ary = data.toString().split("\n");
	var total = 0;
	var passed = 0;
	var log = [];
	for (var i=0; i<ary.length; i++)
	{
    if (i % 100 == 0) {
      console.log(i);
      console.log(passed);
    }
		var a = ary[i].split(',');
		if (a[0].length > 0)
		{
			++total;
			var res = main.test(a[0]);
			a[1] = a[1].replace("\r", "");
			var ans = (a[1] == "0" ? false : true);
			if (res == ans)
			{
				++passed;
			}
			else
			{
				log.push(a[0]+"... failed.");
			}
		}
	}
	fs.writeFile("./log", log.join("\n"), function (err)
	{
		if (err)
		{
			console.log(err);
			return;
		}
		console.log("./log recorded.");
	});
	console.log(passed+"/"+total+" passed.");
});
