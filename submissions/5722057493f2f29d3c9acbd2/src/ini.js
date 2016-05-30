var lineReader = require('line-reader');

var apostrophEndigns = {}
var maxSize = 0
var sizes = {}

lineReader.eachLine('words.txt', function(lineIn, last) {
	var line = lineIn.toLowerCase()
	var splitted = line.split("'")
	if (splitted.length == 2) {
		apostrophEndigns[splitted[1]] = 1
	}

	var size = line.length
	if (sizes[size]) {
		sizes[size]++
	} else {
		sizes[size] = 1
	}

	if(last){
		for (var i in sizes) {
			var intValue = parseInt(i)
			if (sizes[i] > 1000 && intValue > maxSize) {
				maxSize = intValue
			}
		}
		console.log(JSON.stringify({
			a: apostrophEndigns,
			ms: maxSize
		}))
	}
});
