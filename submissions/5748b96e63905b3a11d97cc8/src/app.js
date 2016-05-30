var classifier = require('./classifier.js');
var fs = require('fs');
fs.readFile('data.txt', 'utf8', function (err, content) {
	if (err) throw err;
	classifier.init(new Buffer(content));
	console.log(classifier.test('chair'));
	console.log(classifier.test('table'));
	console.log(classifier.test('spoon'));
	console.log(classifier.test('xxwwy'));
	console.log(classifier.test(75));
	console.log(classifier.test([1, 2, 3]));
	console.log(classifier.test(null));
	console.log(classifier.test({ foo: 'foo' }));
});