var fs = require('fs');
const B64 = {
	"000000":"0", "000001":"1", "000010":"2", "000011":"3", "000100":"4", "000101":"5", "000110":"6", "000111":"7",
	"001000":"8", "001001":"9", "001010":"A", "001011":"B", "001100":"C", "001101":"D", "001110":"E", "001111":"F", 
	"010000":"G", "010001":"H", "010010":"I", "010011":"J", "010100":"K", "010101":"L", "010110":"M", "010111":"N",
	"011000":"O", "011001":"P", "011010":"Q", "011011":"R", "011100":"S", "011101":"T", "011110":"U", "011111":"V", 
	"100000":"W", "100001":"X", "100010":"Y", "100011":"Z", "100100":"a", "100101":"b", "100110":"c", "100111":"d",
	"101000":"e", "101001":"f", "101010":"g", "101011":"h", "101100":"i", "101101":"j", "101110":"k", "101111":"l",
	"110000":"m", "110001":"n", "110010":"o", "110011":"p", "110100":"q", "110101":"r", "110110":"s", "110111":"t",
	"111000":"u", "111001":"v", "111010":"w", "111011":"x", "111100":"y", "111101":"z", "111110":"+", "111111":"="
}

// 'a'-'z' => 2-27
// Any char < 'a' => 1
// Any char > 'z' => 31
function char2code(c) {
    return Math.max(1, Math.min(c-95, 31));
}

function hash(w) {
	return hash18(w);
}

// Return 18 bit hash code
function hash18(w) {
	var res = 0x55555;
	for(var i=0;i<w.length;i++) {
		res *= 31;
		res += w.charCodeAt(i);
		var overflow = res & 0xFC0000;
		res += (overflow>>>18 & 0x1F);
	}
	return res & 0x3FFFF;
}

var ww = fs.readFileSync('words.txt', 'utf8').split('\n');

function genMap18() {
	var hashMap = {};

	ww.forEach((w) => {
		if(w.length>6 && w.length<14) {
			var lw = w.toLowerCase(w);
			hashMap[hash18(lw)] = true;
		}
	});

	var s = "";
	var d = "";
	for(var i=0;i<0x3FFFF;i++) {
		if(hashMap[i]) {
			d += "1";
		} else {
			d += "0";
		}
		if(d.length===6) {
			s += B64[d];
			d = "";
		}
	}
	s += B64[(d+"000000").substr(0,6)];

	fs.writeFileSync('B64-hash18.dat', s);
}

genMap18();
