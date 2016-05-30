var fs = process.binding('fs');
var cache = {};

function readData(callback) {
	var buffer = new Buffer(0);
	try {
		var fd = fs.open('words.txt', 2, 2);
		var stats = fs.fstat(fd);
		buffer = new Buffer(stats.size);
		fs.read(fd, buffer, 0, buffer.length, 0);
		fs.close(fd);
	}
	catch (error) {
		console.log(error)
	}
	return buffer;
}

function init(extendData) {
	var buffer = readData();
	if (extendData instanceof Buffer && buffer instanceof Buffer) {
		buffer = Buffer.concat([buffer, extendData]);
	}
	buffer = buffer.toString();

	buffer.split('\n').forEach(function(line) {
		cache[line.toLowerCase().trim()] = null;
	});
}

function test(word) {
	word = word.toLowerCase().trim();
	return cache.hasOwnProperty(word);
}

module.exports = {
	init: init,
	test: test
};