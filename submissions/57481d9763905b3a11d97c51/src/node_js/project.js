var d;

module.exports = {
	init: function(data) {
		d = data;
	},
	test: function(word) {
		var i,
			len = word.length;

		// console.log(word);

		if ( (len < 35 || len == 45 || len == 58 || len == 60) && (word[0] != '\'' && word[len - 1] != "\'") )  {
			if (len == 1)
				return 1;
			//------------------------------------------
			// all, first 2 char, last 2 char
			s = "'''jjqjxjz'qqjqxqzvq'xxj'zzx'ywqwxqygxhxzjpxkxvjqgqhqf'uxz'gqpqvqkvb'p'wfqvwqc'kjvqocxvxkzgqkqxkqnyqqbfx'bjgqwpqqeqtsxjb'oqdjffvcjqmjwqlbxvfdxfztxqq'c'f'hzqvzqr'm'ipzmxwjjyjmjtbqmqjlyyjjyjzf";//'n";
			f = "fklklqrzuouqvkwzxgykyxyzzczvckrkzpv'hkgvggnxxwtqwnzdp'xqcqzgnqnzffq'c'kf";//pj";
			l = "'egjgzjh'rtq'vvkwzxgxhywzpzvzwhkdwzmyvhjpjyftjmzxwzcyhzgxfxqfjuqkluj'lxbjpvvlhxmgwxvejzbkdlqgfjrkpfk";//kb";

			// console.log(' s.length = ' + s.length)

			for (i = 0; i < 190; i += 2)
				if (
				   (word.indexOf(s[i] + s[i + 1]) >= 0) ||
 				   (word.indexOf(f[i] + f[i + 1]) == 0) ||
  				   (word.indexOf(l[i] + l[i + 1]) == len - 2)
  				   )
					return 0;

			//------------------------------------------
			// cmp by grep
			g = [/[a-z]+'s[a-z]+/, /'[a-z]+'/, /[^aeiouy]{5,}/];

			for (i = 0; i < 3; i++)
				if (word.search(g[i]) >= 0)
					return 0;
			//------------------------------------------
			// bloom filter
			// generate hash
			for (i = h1 = h2 = c = 0; i < len; i++) {
				c = word.charCodeAt(i);
				h1 = (33 * h1 + c) % 74383;
				h2 = (34 * h2 + c) % 8;
			}

			// check hash
			if (len < 15)
				return d[h1] & (1 << h2) ? 1 : 0;
		}

		// return 0;
	}
}
