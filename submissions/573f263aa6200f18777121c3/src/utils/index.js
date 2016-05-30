'use strict'

/**
 *	@param c - cardinality
 */
module.exports = function (c){
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
}
