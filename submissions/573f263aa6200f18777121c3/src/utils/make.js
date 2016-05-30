'use strict'

var log = function(){},
	dot = function() {};

if (process.argv[2] == "-v") {
	log = console.log;
	dot = function () {process.stdout.write('.');}
}

var getWords = function (fileName) {
	var	fs = require("fs"),
		data = [],
		words = fs.readFileSync(fileName).toString().split("\n");

	log("Opening file: ", fileName);

	// convert to lover case and dedublication
	for(var i in words) {
	    data[words[i].toLowerCase()] = 1;
	}

	log("Original file size: ", words.length, "words");

	words = [];
	for(var i in data) {
		words.push(i);
	}

	log("Compressed file size: ", words.length, "words");

	return words;
};

var makeStat = function(words) {
	var	cardinality = 27,
		idx = require("./index")(cardinality),
		result = [],
		filter = [{
			count : 3,
			threshold : 1,
			size : function (cardinality, power) { return Math.pow(cardinality, power+1);},
			cb : function(key, power, stat) {
				if (key.length > power) 
					for (var i = 0; i < key.length - power; ++i)
						++stat[idx.get(key.substring(i, i + power + 1))];
			}
		}, {
			count : 2,
			threshold : 0,
			size : function (cardinality) { return Math.pow(cardinality,4);},
			cb : function (key, start, stat) {
				if (key.length > start + 4) 
					++stat[idx.get(key.substring(start, start + 4))];
			}
		}, {
			count : 4,
			threshold : 0,
			size : function (cardinality) { return Math.pow(cardinality,3);},
			cb : function (key, start, stat) {
				if (key.length > start*4 + 3) 
					++stat[idx.get(key.substring(start*4, start*4 + 3))];
			}
		}, {
			count : 13,
			size : function (cardinality) { return Math.pow(cardinality, 3);},
			threshold : 2,
			cb :  function(key, start, stat) {
				if (key.length > 4 + start) 
					++stat[idx.get(key[start] + key[start + 2] + key[start + 4])];
			}
		}, {
			count : 27,
			threshold : 1,
			size : function (cardinality) { return cardinality;},
			cb : function (key, start, stat) {
				if (key.length > start)
					++stat[idx.get(key[start])];
			}
		}];

	log("Calculate statistic");
	filter.forEach(function(el) {
		for (var power = 0; power < el.count; ++power) {
			var stat = new Array(el.size(cardinality, power)).fill(0);
			words.forEach(function (key) { el.cb(key, power, stat);});
			stat.forEach( function (val, i, ar) {if (val < el.threshold) ar[i] = 0;});
			result.push(stat);
			dot();
		}
	});
	log();
	return result;
};

var dumpToFile = function (data, fileName) {
	var	fs = require("fs"),
		file = fs.createWriteStream(fileName + ".bin"), 
		archive = require("./archive");

	// pack | tar
	log("Compression");
	data.forEach(function(item, i) {
		var pack = archive.pack(item);
		file.write(pack);
		dot();
	});
	file.end();
	log();

	// gzip
	var	r = fs.createReadStream(fileName + ".bin"),
		zlib = require('zlib'),
		gzip = zlib.createGzip({level : zlib.Z_BEST_COMPRESSION}),
		w = fs.createWriteStream(fileName + ".gz");
	r.pipe(gzip).pipe(w);
};


var	words = getWords("words.txt"),
	stat = makeStat(words);

dumpToFile(stat, "./data/data");

