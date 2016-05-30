var fs = require('fs');
var zlib = require('zlib');
var api = require('./project.min.js');

var data = fs.readFileSync('data.gz'); 	// optional
data = zlib.gunzipSync(data); 			// optional

api.init(data);

var file = process.argv[2] || './test.txt';

var lineReader = require('readline').createInterface({
	input: fs.createReadStream(file)
});

// console.log(' return = ' + api.test("'"));
// console.log(' return = ' + api.test("some'word"));
// console.log(' return = ' + api.test("so'mewo'rd"));
// console.log(' return = ' + api.test("someword'"));
// console.log(' return = ' + api.test("'someword"));
// console.log(' return = ' + api.test("sssssssssssssss"));

lineReader.on('line', function (word) {
	if (api.test(word)) {
		console.log('"' + word + '": "true"');
	} else {
		console.log('"' + word + '": "false"');
	}
});
