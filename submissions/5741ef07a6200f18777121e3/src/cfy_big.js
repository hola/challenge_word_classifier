var b,l;

module.exports = {
	
	init: function(d) {
		b = d;
		l = d.length*8
	},
	
	test: function(word) {
		var wordLength = word.length,
		i=0,
		s=0,
		letters = "esainortlcudmph'gbyfvkwzxjq",
		limits  =  [39,44,61,72,85,95,104,107,113,113,111,83,70];

		for (; i < wordLength; ++i ) {
			s += letters.indexOf(word[i]);
		}
		if (
			s > limits[wordLength-3] ||
			wordLength > 15 || 
			wordLength < 3 || 
			word.search(/^([^aoiuye])\1|(.)\2\2|'([^s]|.{2,}|)$|[^eaiouy]{5}|[eaiouy]{5}|jq|jx|jz|gj|qx|qz|vq|xj|zx/) != -1
		) {
			return!1;
		}
		
		for(var n=h=0;n<wordLength;n++) h=(h<<5)-h+word.charCodeAt(n); 
		i = (0x7FFFFFFF&h)%l;
		return b.readUInt8(b.length-1-~~(i/8))>>i%8&1;
	}
}