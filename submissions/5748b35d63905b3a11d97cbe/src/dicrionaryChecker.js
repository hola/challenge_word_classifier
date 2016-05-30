var fs = require('fs');

// var word = '';
// var max = 0;
var dictionaryString = fs.readFileSync('./words.txt', 'utf8');
var dictionary = dictionaryString.split('\n');
for (var i = 0; i < dictionary.length; i++) {
	dictionary[i] = dictionary[i].toLowerCase();
	// if (dictionary[i].length > max) {
	// 	max = dictionary[i].length;
	// 	word = dictionary[i];
	// }
}
// console.log(max);
// console.log(word);


var cube = new Array(100);
for (var square = 0; square < 100; square++) {
	cube[square] = new Array(27);
	for (var line = 0; line < 27; line++) {
		cube[square][line] = new Array(27);
		for (var value = 0; value < 27; value++) {
			cube[square][line][value] = 0;
		}
	}
}

for (var wordIndex = 0; wordIndex < dictionary.length; wordIndex++) {
	var word = dictionary[wordIndex];
	for (var letterIndex = 0; letterIndex < word.length-1; letterIndex++) {
		var current = word[letterIndex].charCodeAt(0);
		if (current === 39) {
			current = 26;
		} else {
			current = current - 97;
		}
		
		var next = word[letterIndex + 1].charCodeAt(0);
		if (next) {
			if (next === 39) {
				next = 26;
			} else {
				next = next - 97;
			}
			// console.log ('current = ' + current + '\n' + 'next = ' + next);
			// console.log(cube[letterIndex][current][next]);
			// console.log(letterIndex + ' ' + current + ' ' + next);
			cube[letterIndex][current][next] = cube[letterIndex][current][next] ? cube[letterIndex][current][next] + 1 : 1;
		}
		// console.log(cube[letterIndex][current][next]);
		// console.log('-----------------');
	}
		console.log(word);
}

console.log(dictionary.length);
process.stdout.write('  ');
for(var i = 0; i < 27; i++) {
	process.stdout.write(String.fromCharCode(i + 97) + ' ');
}
	process.stdout.write('\n');


var position = 0;
for (var current = 0; current < 27; current++) {
	process.stdout.write(String.fromCharCode(current + 97) + ' ');
	for (var next = 0; next < 27; next++) {
		process.stdout.write(cube[1][current][next] + ' ');
	}
	process.stdout.write('\n');
}



// serializing
var result = '[';
for (var position = 0; position < 40; position++) {
	result += '[';
	for (var current = 0; current < 27; current++) {
		result += '[';
		for (var next = 0; next < 27; next++) {
			if (cube[position][current][next]) {
				result += cube[position][current][next];
			}
			if (next !== 26) {
				result += ',';
			}
		}
		result += ']';
		if (current !== 26) {
			result += ',';
		}
	}
	result += ']';
	if (position !== 99) {
		result += ',';
	}
}
result += ']';

fs.writeFileSync ('./result.txt', result, 'utf8');
console.log('done');