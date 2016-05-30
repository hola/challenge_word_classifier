var fs = require("fs"),
	stemmer = require("./porter.js").stemmer,
	txt = fs.readFileSync("./test/words.txt", "ascii").trim(),
	words = txt.split("\n"),
	txt2 = fs.readFileSync("./test/google-10000-english.txt", "ascii").trim(),
	words2 = txt2.split("\n"),
	normalisedWords = [],
	trie = {},
	end = {},
	keepEnd = {},
	endings = [ 0 ],
	zlib = require("zlib"),
	dict,
	mostCommonEnglishWords = [
    'the',
    'be',
    'to',
    'of',
    'and',
    'a',
    'in',
    'that',
    'have',
    'i',
    'it',
    'for',
    'not',
    'on',
    'with',
    'he',
    'as',
    'you',
    'do',
    'at',
    'this',
    'but',
    'his',
    'by',
    'from',
    'they',
    'we',
    'say',
    'her',
    'she',
    'or',
    'an',
    'will',
    'my',
    'one',
    'all',
    'would',
    'there',
    'their',
    'what',
  ];

// var commonPrefixes = [
// 	'anti', 'de', 'dis', 'en', 'em', 'fore', 'in', 'im', 'il', 'ir',
// 	'inter', 'mid', 'mis', 'non', 'over', 'pre', 're', 'semi', 'sub', 'super',
// 	'trans', 'un', 'under',
// ];

// Normalise words
var j = 0;
var stemDistribution = {};
for (var i = 0; i < words.length; i++) {
	var w = words[i].trim();

	// Only alphanumeric characters allowed
	if (w.replace(/[^a-z0-9]/gi,'') != w) {
		continue;
	}

	// Skip any words beginning with uppercase letter
	if (w[0].toUpperCase() == w[0]) {
		continue;
	}

	w = w.toLowerCase();

	// var hasCommonPrefix = false;
	// for (var k = 0; k < commonPrefixes.length; k++) {
	// 	var cp = commonPrefixes[k];
	// 	if (w.length > cp.length && w.slice(cp.length) == cp) {
	// 		hasCommonPrefix = true;
	// 		break;
	// 	}
	// }
	// if (hasCommonPrefix) {
	// 	continue;
	// }

	var stem = stemmer(w);
	if (stem != w) {
		if (j > 0 && stem == normalisedWords[j-1]) {
			continue;
		}

		var stemDistributionKey = '' + stem.length;
		if (stemDistributionKey in stemDistribution) {
			stemDistribution[stemDistributionKey] += 1;
		} else {
			stemDistribution[stemDistributionKey] = 0;
		}

		// Skip too short / too long words
		if (stem.length < 5 || stem.length > 6) {
			continue;
		}

		normalisedWords[j] = stem;
		j++;
		continue;
	}

	// if (w.length < 4 && w.length > 2) {
	// 	normalisedWords[j] = w;
	// 	j++;
	// }
}

// for (var i = 0; i < mostCommonEnglishWords.length; i++) {
// 	normalisedWords[j] = mostCommonEnglishWords[i];
// 	j++;
// }

console.log(stemDistribution);
normalisedWords = [...new Set(normalisedWords)];
console.log(words.length);
console.log(normalisedWords.length);

// Build a simple Trie structure
for ( var i = 0, l = normalisedWords.length; i < l; i++ ) {
	var word = normalisedWords[i], letters = word.split(""), cur = trie;

	for ( var j = 0; j < letters.length; j++ ) {
		var letter = letters[j], pos = cur[ letter ];

		if ( pos == null ) {
			cur = cur[ letter ] = j === letters.length - 1 ? 0 : {};

		} else if ( pos === 0 ) {
			cur = cur[ letter ] = { $: 0 };

		} else {
			cur = cur[ letter ];
		}
	}
}


// Optimize the structure
optimize( trie );

// Figure out common suffixes
suffixes( trie, end );

for ( var key in end ) {
	if ( end[ key ].count > 10 ) {
		keepEnd[ key ] = endings.length;
		endings.push( end[ key ].obj );
	}
}

// And extract the suffixes
finishSuffixes( trie, keepEnd, end );

trie.$ = endings;


var ret = JSON.stringify( trie ).replace(/"/g, "");

var reserved = [ "abstract", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with" ];

for ( var i = 0; i < reserved.length; i++ ) {
	ret = ret.replace( new RegExp("([{,])(" + reserved[i] + "):", "g"), "$1'$2':" );
}

var compressor = zlib.createGzip({
	level: 9,
	memLevel: 9,
	strategy: zlib.Z_FILTERED,
});
compressor.pipe(fs.createWriteStream('./test/data.gz'));
compressor.end(new Buffer(ret, 'ascii'));

function optimize( cur ) {
	var num = 0, last;

	for ( var node in cur ) {
		if ( typeof cur[ node ] === "object" ) {
			var ret = optimize( cur[ node ] );

			if ( ret ) {
				delete cur[ node ];
				cur[ node + ret.name ] = ret.value;
				node = node + ret.name;
			}
		}

		last = node;
		num++;
	}

	if ( num === 1 ) {
		return { name: last, value: cur[ last ] };
	}
}

function suffixes( cur, end ) {
	var hasObject = false, key = "";

	for ( var node in cur ) {
		if ( typeof cur[ node ] === "object" ) {
			hasObject = true;

			var ret = suffixes( cur[ node ], end );

			if ( ret ) {
				cur[ node ] = ret;
			}
		}

		key += "," + node;
	}

	if ( !hasObject ) {
		if ( end[ key ] ) {
			end[ key ].count++;

		} else {
			end[ key ] = { obj: cur, count: 1 };
		}

		return key;
	}
}

function finishSuffixes( cur, keepEnd, end ) {
	for ( var node in cur ) {
		var val = cur[ node ];

		if ( typeof val === "object" ) {
			finishSuffixes( val, keepEnd, end );

		} else if ( typeof val === "string" ) {
			cur[ node ] = keepEnd[ val ] || end[ val ].obj;
		}
	}
}

function findTrieWord(word, cur) {
	if ( cur === 0 ) {
		return false;
	}

	cur = cur || dict;

	for ( var node in cur ) {
		if ( word.indexOf( node ) === 0 ) {
			var val = typeof cur[ node ] === "number" && cur[ node ] ?
				dict.$[ cur[ node ] ] :
				cur[ node ];

			if ( node.length === word.length ) {
				return val === 0 || val.$ === 0;

			} else {
				return findTrieWord( word.slice( node.length ), val );
			}
		}
	}

	return false;
}
