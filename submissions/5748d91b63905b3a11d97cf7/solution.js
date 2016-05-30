(function () {
	'use strict';
	var G = {'prefixes': []};
	G.init = function (data) {
		var dataStr = '';
		dataStr = data.toString('utf8');
		G.prefixes = JSON.parse(dataStr);
	};
	G.test = function (word) {
		var result = false;
		result = G.testRules(word);
		return result;
	};
	G.testRules = function (word) {
		word = String(word);
		var result = false,
			wLen = word.length || 0,
			len = 0,
			len2 = 0,
			prefixes = [],
			pres = [],
			pre = '',
			firstChar = '',
			i = 0,
			j = 0,
			str = '';

		if (wLen > 60) {
			result = false;
			return result;
		}
		if (wLen === 1) {
            result = true;
            return result;
        }
		firstChar = word.charAt(0)
		if (firstChar === "'") {
			result = false;
			return result;
		}
		prefixes = G.prefixes || [];
		len = prefixes.length || 0;
		for (i = 0; i < len; i += 1) {
			if (wLen > (i + 1)) {
				str = word.substr(i, 2);
				pres = prefixes[i];
				len2 = pres.length || 0;
				for (j = 0; j < len2; j += 1) {
					pre = pres[j];
					if (pre === str) {
						result = false;
						//console.log('RULE CATCH: str: ' + str + ' i: ' + i + ' word: ' + word);
						return result;
					}
				}
			}
		}
		//result = true;
		return result;
	};
	module.exports = {
		'init': G.init,
		'test': G.test
	};
}());
