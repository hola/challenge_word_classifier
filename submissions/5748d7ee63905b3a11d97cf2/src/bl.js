function calulateHashes(key, size, slices) {
	function fnv(seed, data) {
		var h = new FNV()
		h.update(seed)
		h.update(data)
		return h.value() >>> 0
	}
	var h1 = fnv(Buffer("S"), key)
	var h2 = fnv(Buffer("W"), key)
	var hashes = []
	for(var i = 0; i < slices; i++) {
		hashes.push((h1 + i * h2) % size)
	}
	return hashes
}
function Bloem(size, slices, buffer) {
	this.size   = size
	this.slices = slices
	this.bitfield = new BitBuffer(size, buffer)
}
Bloem.prototype = {
	add: function(key) {
		var hashes = calulateHashes(key, this.size, this.slices)
		for(var i = 0; i < hashes.length; i++) {
			this.bitfield.set(hashes[i], true)
		}
	},
	has: function(key) {
		var hashes = calulateHashes(key, this.size, this.slices)
		for(var i = 0; i < hashes.length; i++) {
			if(!this.bitfield.get(hashes[i])) return false
		}
		return true
	}
}
function BitBuffer(number, buffer) {
	var size = Math.ceil(number / 8)
	if (buffer != undefined && buffer.length == size) {
		this.buffer = buffer
	} else {
		this.buffer = new Buffer(size)
		this.buffer.fill(0)
	}
}
BitBuffer.prototype = {
	set: function(index, bool) {
		var pos = index >>> 3
		if(bool) {
			this.buffer[pos] |= 1 << (index % 8)
		} else {
			this.buffer[pos] &= ~(1 << (index % 8))
		}
	},
	get: function(index) {
		return (this.buffer[index >>> 3] & (1 << (index % 8))) != 0
	}
}
function FNV() {
	this.hash = 0x811C9DC5
}
FNV.prototype = {
	update: function(data) {
		if(typeof data === 'string') {
			data = Buffer(data)
		} else if(!(data instanceof Buffer)) {
			throw Error("FNV.update expectes String or Buffer")
		}
		for(var i = 0; i < data.length; i++) {
			this.hash = this.hash ^ data[i]
			this.hash += (this.hash << 24) + (this.hash << 8) + (this.hash << 7) + (this.hash << 4) + (this.hash << 1)
		}
        return this;
	},
	value: function() {
		return this.hash & 0xffffffff
	}
}
var bloom = null;
module.exports = {
	test:( word ) => {
		return bloom.has( Buffer.from(word.toLowerCase(), 'utf8') )
	},
	init:init = ( data ) => {
		bloom = new Bloem(556074,0.5825127670374226, data)
	}
}
