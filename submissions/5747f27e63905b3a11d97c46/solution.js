var netstr,words,cores = [], sufixes = [], prefixes = [];

exports.init = function (buffer) {
	var array = buffer.toString().split("\n");
	netstr = array[0];
	var sufs = array[1].split(",");
	var pres = array[2].split(",");
	var cors = array[3].split(",");
	words = array[4].split(",");
	var count = 0;
	cors.map(function(cor){
		cores.push(cor.trim());
	});
	pres.map(function(pre){
		var re = "^" + pre.trim();
		prefixes.push(new RegExp(re));
	});
	sufs.map(function(suf){
		var re = suf.trim() + "$";
		sufixes.push(new RegExp(re))
	});
}

exports.test = function (word) {
	var net = eval(netstr);
	var re, core;
	var forNet = isForNet(word);
	var result = false;
	var mult1 = (prefixes.length - 1) * (sufixes.length - 1);
	var mult2 = (sufixes.length - 1);
	if (forNet) {
		var matched = false;
		for (var i = 0, l = cores.length; i < l; i++) {
			core = cores[i];
			if (word.indexOf(core) !== -1) {
				matched = {
					rest: word.split(core),
					coreIndex: i,
					sufIndex: -1,
					preIndex: -1
				}
				break;
			}
		}

		if (!matched) {
			return false;
		}

		var lengthCheckForm = word.length - core.length;
		var sudif;
		var predif;
		for (var i = 0, l = prefixes.length; i < l; i++) {
			var preRe = prefixes[i];
			if (preRe.test(matched.rest[0])) {
				matched.preIndex = i;
				predif = (preRe.toString().length -3) / 1+ matched.rest[0].length;
				break;
			}
		}

		for (var i = 0, l = sufixes.length; i < l; i++) {
			var sufRe = sufixes[i];
			if (sufRe.test(matched.rest[1])) {
				matched.sufIndex = i;
				sudif = (sufRe.toString().length -3) / 1 + matched.rest[1].length;
				break;
			}
		}

		if (sudif > 10 || predif > 10) {
			return false;
		}

		var index = matched.coreIndex * mult1 + matched.preIndex * mult2 + matched.sufIndex;
		var predict = net(makeInput(index));
		if (predict > 0.9 || predict < 0.1)  {
			result = true;
		} else {
			result = false; 
		}
		console.log(word, core, predif, prefixes[matched.preIndex], sudif, sufixes[matched.sufIndex], predict);
	} else {
		words.map(function(w){
			if (w === word) {
				result = true;
			}
		});
	}

	return result;

	function makeInput(index){
		var input = index.toString(2);
	    for (var i = input.length; i < 21; i++) {
	       input += "0";
	    }
	    return input.split('').map(function(w){ return +w});
	}

	function isForNet(word){
		if (word.length < 4) { return }
	  	if (word.length > 20) { return}

		commaMatches = word.match(/'/gi);
		if (commaMatches && commaMatches.length > 1) {
		  return;
		}
		if (commaMatches && word.indexOf("'") !== word.length - 2) {
		  return;
		}

		if (/(\w)\1{2}/.test(word) ) {
		  return
		}
		if (/[^aeiouy']{7}/.test(word) ) {
		  return
		}
		r = /[^aeiouy']{7}/;
		if (r.test(word) ) {
		  return
		}
		return true;
	}
}
