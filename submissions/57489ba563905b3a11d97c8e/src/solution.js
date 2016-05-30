module.exports.init = init;
module.exports.test = test;

var data;
var vowels = ['a', 'e', 'i', 'o', 'u', 'y'];

function init(buffer) {
	data = JSON.parse(	
		buffer.toString('utf-8')
	);
}

function test(word) {	
	var wrong;
	switch (word.length) {
		case 2: 
			wrong = check(word, 2, data[0]);
			break;
		case 3: 
			wrong = check(word, 3, data[1]);
			break;
		case 4: 
			wrong = check(word, 4, data[2]);
			break;
		default:
			wrong = false
				|| checkLength(word)
				|| wrongApostrof(word)
				|| check40(word, data[3])
				|| check4n(word, data[4]);
			break;
	}
	
	return !wrong;
}

function check(w, c, d) {
	for (var i = 0; i < c - 1; i++) {
		if (!d[w[i]]) {
			return true;
		} else {
			d = d[w[i]];
		}
	}
	
	var isDot = d.indexOf('.') !== -1;
	var pos = d.indexOf(w[c - 1]) !== -1;
	
	return (isDot && pos) || (!isDot && !pos);
}

function check40(w, d) {
	return check(w[0] + w[1] + w[2] + w[3], 4, d);
}

function check4n(w, d) {
	n = w.length - 1;
	return check(w[n - 3] + w[n - 2] + w[n - 1] + w[n], 4, d);
}

function checkLength(w) {
	return [
		2, 3, 4, 5, 6, 7, 8,
		9, 10, 11, 12, 13, 14
	].indexOf(w.length) === -1;
}

function getRowWord(w) {
	var ch = w.indexOf("'");
	
	if (ch === 1) {
		return w.substr(2);
	} else if (ch !== -1 && ch === w.length - 2) {
		return w.substr(0, w.length - 2);
	} else {
		return w;
	}
}

function getDiff(arr1, arr2) {
	return arr1.filter(function(i) {
		return arr2.indexOf(i) < 0;
	});
}

function getUnique(array) {
    return array.filter(function(el, index, arr) {
        return index == arr.indexOf(el);
    });
}

function wrongApostrof(w) {	
	if (w.split("'").length - 1 > 1) {
		return true;
	}
	
	var p = w.indexOf("'");
	
	if (p === -1) {
		return false;
	}
	
	var end = w.length - 2;
	
	if (
		!end
		|| (p !== 1 && p !== end)
		|| (p === end && vowels.indexOf(w[end + 1]) !== -1)
	) {
		return true;
	}
	
	return false;
}