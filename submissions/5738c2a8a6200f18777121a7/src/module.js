"use strict";

var features = {};

module.exports.init = function(buffer) {
	var weight = 1.0;

	buffer.toString().split(/\n/).forEach(function(e) {
		var parts = e.split(";");

		if (parts.length === 2) {
			var delta = parseFloat(parts[1]);

			weight -= delta;

			features[parts[0]] = weight;
		}
	});
};

function check(word, size) {
	var weight = 0.0;

	for (var i = 0; i < word.length - size + 1; i++) {
		var part = word.substr(i, size);

		if (part in features) {
			weight += features[part];
		}
	}

	return weight;
}

module.exports.test = function(word) {
	if (word.length > 19) {
		return false;
	}

	var weight = 0.0;

	weight += check(word, 3);
	weight += check(word, 4);
	weight += check(word, 5);

	return weight > 0.613;
};
