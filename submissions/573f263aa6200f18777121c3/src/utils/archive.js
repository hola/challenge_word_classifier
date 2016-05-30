'use strict'

module.exports = {
	pack : function (data) {
		var result = new Uint8Array((data.length >> 3) + 1).fill(0),
			shift = 1;

		for (var i = 0; i < data.length; ++i) {
			shift = (i & 7) ? (shift << 1) : 1;

			if (data[i])
				result[i >> 3] |= shift;
		}
		var out = Buffer.alloc(4);
		out.writeUInt32LE(result.length); 
		return Buffer.concat([out, Buffer.from(result)]);
	},

	unpack : function (data, start, length) {
		var l = start + (length || data.length),
			result = [];

		for (var i = start || 0; i < l; ++i) {
			for (var bit = 0; bit < 8; ++bit)
				result.push( +((data[i] & (1 << bit)) > 0));
		}
		return result;
	}
};
