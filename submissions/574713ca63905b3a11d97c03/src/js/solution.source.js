function bloomContains(bloom, str) {
	r = 5381, i = str.length
	while(i)
		r = (r * 33) ^ str.charCodeAt(--i)
	r = r >>> 0;
	i = r % (bloom.length * 8);
	return (bloom.readUInt8(~~(i / 8)) >> (i % 8)) & 1;
}

function getMaxInRow(s, c) {
	return s.split(c == 'v' ? 'c' : 'v').sort(function (a, b) { return b.length - a.length; })[0].length;
}

function exportInit(data) {
	substCommands = data.toString('ascii', 0, %NOT_C2_START%).split('*').map(function (cmd) {
		return [cmd[0], cmd.substring(1).split(';').map(function(pair) {
			return pair.split('-');
		})];
	});
	notC2 = new RegExp('(' + data.toString('ascii', %NOT_C2_START%, %MAIN_BLOOM_START%).match(/.{1,2}/g).join('|') + ')');
	prefixbloom = data.slice(%PREFIX_BLOOM_START%, %JS_CODE_START%);
	mainbloom = data.slice(%MAIN_BLOOM_START%, %PREFIX_BLOOM_START%);
}

function exportTest(word) {
	word = word.replace(/'s$/, '');

	for (var i in substCommands) {
		r = substCommands[i][0];
		for (var j in substCommands[i][1]) {
			q = substCommands[i][1][j];
			if (q[0]) word = word.replace(new RegExp(r == 'p' ? ('^' + q[0]) : (q[0] + '$')), q[1])
		}
	}

	z = word.replace(/[^aeiouy]/g, 'c').replace(/[^c]/g, 'v');
	
	return !(word.length > 14
		|| word[0] == "'"
		|| !bloomContains(mainbloom, word) 
		|| getMaxInRow(z, 'v') > 4
		|| getMaxInRow(z, 'c') > 4
		|| (word.match(/\'/g) || []).length >= 2
		|| (word.length >= 4 && !bloomContains(prefixbloom, word.substring(0, 3)))
		|| word.match(notC2));
}