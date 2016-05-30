var _ = require('lodash');
var fs = require('fs');
var words = fs.readFileSync('words.txt', 'utf8');

words = words.split(/\n/);

var asc = _.clone(words).sort(function (a, b) { return a.length - b.length; });
var desc = _.clone(words).sort(function (a, b) { return b.length - a.length; });

// console.log(_.head(asc));
// console.log(_.head(desc));

function wLensCount(){
	var lens = {};
	_.each(asc, function (w) {
		if (!_.has(lens, w.length)) {
			lens[w.length] = 1;
		} else {
			lens[w.length] += 1;
		}
	});

	console.log(lens);
}


function wordsByLen(len){
	var count = 0;
	var wrds = [];
	_.each(asc, function (w) {
		if (w.length === len) {
			wrds.push(w);
			count++;
		}
	});

	return {
		wrds: wrds,
		count: count
	};
}

function gen2lensWs(){
	var letters = 'aAyxwvutsrqponmlkjihgfedcbzZYXWVUTSRQPONMLKJIHGFEDCB';
	var letS = letters.split('');
	var result = [];

	_.each(letS, function (l1) {
		_.each(letS, function (l2) {
			if (!l2.match(/[A-Z]/)) {
				result.push(l1 + l2);
			}
		});
	});

	return result;
}


function getGenWsDiff(){
	var getw2l3n = gen2lensWs();
	var w2len = wordsByLen(2).wrds;

	var result = [];

	_.each(getw2l3n, function (w) {
		if (!_.includes(w2len, w)) {
			result.push(w);
		}
	});

	return result.sort(function(a, b){
		if(a.firstname < b.firstname) return -1;
		if(a.firstname > b.firstname) return 1;
		return 0;
	});
}


function countSyllables(w){
	var result = 0;
	if (result.length) { return result; }

	w = w.toLowerCase();
	w = w.replace(/\'/g , '').replace(/e$/ , '');

	var vowelGroups	= w.split(/[^aeiouy]+/);

	var subSyllables = [
		/cial/,
		/tia/,
		/cius/,
		/cious/,
		/giu/,	// belgium!
		/ion/,
		/iou/,
		/sia$/,
		/.ely$/	// absolutely! (but not ely!)
	];

	var addSyllables = [
		/ia/,
		/riet/,
		/dien/,
		/iu/,
		/io/,
		/ii/,
		/[aeiouym]bl$/,		// -Vble, plus -mble
		/[aeiou]{3}/,		// agreeable
		/^mc/,
		/ism$/,				// -isms
		/([^aeiouy])\1l$/,	// middle twiddle battle bottle, etc.
		/[^l]lien/,			// alien, salient [1]
		/^coa[dglx]./, 		// [2]
		/[^gq]ua[^auieo]/,	// i think this fixes more than it breaks
		/dnt$/				// couldn't
	];

	for (var i = 0; i < subSyllables.length; i++) {
		if (w.match(subSyllables[i])) {
			result--;
		}
	}

	for (var i = 0; i < addSyllables.length; i++) {
		if (w.match(subSyllables[i])) {
			result++;
		}
	}

	if (w.length == 1 ) {
		result++;
	}

	if	(vowelGroups.length > 0 && vowelGroups[0].length == 0){
		result += vowelGroups.length - 1;
	} else {
		result += vowelGroups.length;
	}

	return Math.max(result, 1) + '';
}



// var notInc2ws = getGenWsDiff();
// console.log(notInc2ws);


// var c = 0;
// _.each(notInc2ws, function (w) {
// 	if (_.startsWith(w, 'd')) {
// 		c++;
// 		console.log(w);
// 	}
// });
// // console.log(c);
// var getw2l3n = gen2lensWs();
// console.log(getw2l3n.length);




// var treegrams = [];
// _.each(asc, function (w) {
// 	var grs = w.toLowerCase()
// 		.replace(/\'/g , '')
// 		.replace(/e$/ , '')
// 		.match(/.{1,3}/g);

// 	_.each(grs, function (gr) {
// 		if (gr.length === 3 && !_.includes(treegrams, gr)) {
// 			treegrams.push(gr);
// 		}
// 	});
// });

// console.log(treegrams.length);

// fs.writeFile('treegrams.json', JSON.stringify(treegrams), function(err) {
// 	if(err) {
// 		return console.log(err);
// 	}

// 	console.log("The file was saved!");
// });

var beegrams = [];
_.each(asc, function (w) {
	var grs = w.toLowerCase()
		.replace(/\'/g , '')
		.replace(/e$/ , '')
		.match(/.{1,2}/g);

	_.each(grs, function (gr) {
		if (gr.length === 2 && !_.includes(beegrams, gr)) {
			beegrams.push(gr);
		}
	});
});

console.log(beegrams.length);

fs.writeFile('beegrams.json', JSON.stringify(beegrams), function(err) {
	if(err) {
		return console.log(err);
	}

	console.log("The file was saved!");
});


