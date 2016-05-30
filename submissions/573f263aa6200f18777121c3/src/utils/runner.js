'use strict'

var hola = require ("../module.min"),
	fs = require("fs"),
	test_data = JSON.parse(fs.readFileSync(process.argv[2] || "data/test.json"));

if (hola.init) {
	var	zlib = require('zlib'),
		data = fs.readFileSync("data/data.gz"),
		unpack = zlib.gunzipSync( data);
	hola.init(unpack);
}

var test = function(data) {
	var res = {
		total : 0,
		success : 0,
		false_positive : 0,
		false_negative : 0
	}

	for (var word in data) {
		if (hola.test(word) == data[word]) {
			++res.success;
		} else if (data[word]) {
			++res.false_negative;
		} else {
			++res.false_positive;
		}
		++res.total;
	}

	return res;
};

var res = test(test_data);
console.log("Success:", res.success/res.total);
console.log("false positive:", res.false_positive/res.total);
console.log("false negative:", res.false_negative/res.total);
