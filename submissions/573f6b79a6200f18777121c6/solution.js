
var trainData = {};

exports.init = function (trainDataFile) {
	var text = trainDataFile.toString();
	var lines = text.split('\n');

	lines.forEach(function(line) {
	    var parts = line.split(',');
	    trainData[parts[0]] = parseFloat(parts[1])/10000;
	});
	  // console.log(trainData);
}

exports.test = function (word) {
	var len = word.length;
	var pred = 0.0;

	var ap = word.indexOf("'");
	if (ap >= 0 && ap < len - 2) {
		return false;
	}

	if (len > 2) {
		for (i = 0; i < word.length-2; i++) {
			var chunk = word.substring(i, i+3);
			if (chunk in trainData) {
				pred += trainData[chunk];
			}
			// console.log(word.substring(i, i+3));
		}
	}
	return pred > 0.5;
}
