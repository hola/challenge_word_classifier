function c(bloom, str) {
	r = 5381, i = str.length
	while(i)
		r = (r * 33) ^ str.charCodeAt(--i)
	r = r >>> 0;
	i = r % (bloom.length * 8);
	return (bloom.readUInt8(~~(i / 8)) >> (i % 8)) & 1;
}

function d(s, c) {
	return s.split(c == 'v' ? 'c' : 'v').sort(function (a, b) { return b.length - a.length; })[0].length;
}

function k(data) {
	e = data.toString('ascii', 0, 5234).split('*').map(function (cmd) {
		return [cmd[0], cmd.substring(1).split(';').map(function(pair) {
			return pair.split('-');
		})];
	});
	f = new RegExp('(' + data.toString('ascii', 5234, 5512).match(/.{1,2}/g).join('|') + ')');
	g = data.slice(67112, 68112);
	h = data.slice(5512, 67112);
}

function l(word) {
	word = word.replace(/'s$/, '');

	for (var i in e) {
		r = e[i][0];
		for (var j in e[i][1]) {
			q = e[i][1][j];
			if (q[0]) word = word.replace(new RegExp(r == 'p' ? ('^' + q[0]) : (q[0] + '$')), q[1])
		}
	}

	z = word.replace(/[^aeiouy]/g, 'c').replace(/[^c]/g, 'v');
	
	return !(word.length > 14
		|| word[0] == "'"
		|| !c(h, word) 
		|| d(z, 'v') > 4
		|| d(z, 'c') > 4
		|| (word.match(/\'/g) || []).length >= 2
		|| (word.length >= 4 && !c(g, word.substring(0, 3)))
		|| word.match(f));
}