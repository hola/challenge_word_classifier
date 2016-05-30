'use strict'
/**
 *	@inline utils/index.js
 *	@param c - cardinality
 */
var idx = (function (c){
	/**
	 *	@returns index of letter in set (\' - latest symbols)
	 */
	var idx = function(letter) { 
			if (letter === '\'') return c - 1;
			return letter.charCodeAt() - 97 /** 'c' - 'a' == 2 **/;
		};

	return {
		/**
		 *	@param w - letter quartet
		 */
		get : function (w) {
			var result = 0,
				l = w.length,
				i = 0;
			while (--l >= 0) {
				result += Math.pow(c,l) * idx(w[i++]);
			};
			return result;
		}
	};
})(27),

/**
 * @inline part of file utils/archive.js
 *
 * Conver binary data to array
 *
 * @param data Buffer
 * @param start read position
 * @param length data size
 */
unpack = function (data, start, length) {
	var l = start + (length || data.length),
		result = [];
		for (var i = start || 0; i < l; ++i) {
		for (var bit = 0; bit < 8; ++bit)
			result.push( +((data[i] & (1 << bit)) > 0));
	}
	return result;
},

/**
 *	Dictionary statistic	
 */
filter = [
	{
		size : 3,									// 1,2,3-gramm statistic
		cb : function (word, data, d) {
			for (var i = 0; i < word.length - d; ++i) {
				if (!data[idx.get(word.slice(i, i + d + 1))]) {
					return false;
				}
			}
			return true;
		}
	}, {
		size : 2,
		cb : function (word, data, i) {		// abcde -> abcd, bcde
			return word.length > 4 + i ?
				data[idx.get(word.substring(i, i + 4))] : true;
		}
	}, {
		size : 4,
		cb : function (word, data, i) {		// abcd -> abc, bcd
			return word.length > 3 + i*4 ?
				data[idx.get(word.substring(i*4, i*4 + 3))] : true;
		}
	}, {
		size : 13,
		cb : function (word, data, i) {		// abcdef -> ace, bdf
			return word.length > 4 + i ?
				data[idx.get(word[i] + word[i + 2] + word[i + 4])] : true;
		}
	}, {
		size : 27,									//  abc -> a, b, c
		cb : function (word, data, i) {
			return word.length > i ? data[idx.get(word[i])] : true;
		}
}];

module.exports = {
	init : function (data) {
		// extract data
		filter.forEach(function(el) {
			el.data = [];
			for (var layer = 0; layer < el.size; ++layer) {
				var size = data.readUInt32LE();
				el.data.push(unpack(data, 4, size));
				data = data.slice(size + 4);
			}
		});
	},

	test : function (word) {
		// check filters
		return filter.reduce( function (result, item) {
			return result && item.data.reduce( function (res, data, i) {
				return res && item.cb(word, data, i);
			}, true);
		}, true);
	}
};

