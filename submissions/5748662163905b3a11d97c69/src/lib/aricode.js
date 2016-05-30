#!/usr/bin/env node

/*
	Very simple arithmetic coder from the book.
	compress String with all characters.charCodeAt() < 256
*/
var ArithmeticEncoder;
var ArithmeticDecoder;

function Bits() {
	this.buf = []
	this.current = 0;
	this.N = 16;
	this.appendBit = function(bit) {
		this.current <<= 1;
		this.current |= bit;
		this.N--;
		if (!this.N) { 
			this.buf.push(this.current);
			this.current = 0;
			this.N = 16;
		}
	}
	this.finish = function () {
		while (this.N != 16)
			this.appendBit(0);
	}
	this.toBinaryString = function () {
		var res = "";
		for (var i = 0; i < this.buf.length; i++) {
			res += String.fromCharCode(this.buf[i] >> 8);
			res += String.fromCharCode(this.buf[i] & 0xFF);
		}
		return res;
	}

	this.getBit = function(i) {
		var ch = i >> 4;
		if (ch >= this.buf.length)
			return 0;
		var bit = 15 - (i & 15);
		return this.buf[ch] & (1 << bit) ? 1 : 0;
	}
	this.getIterator = function() {
		var index = 0;
		var bitsRemaining = 15;
		var bits = this.buf[0];
		var bit = 0;
		var b = this.buf;
		return function() {
			var i = 1 & (bits >> bitsRemaining);
			if (0 === bitsRemaining--) {
				bitsRemaining = 15;
				bits = b[++index];
			}
			return i;
		}
	}
}

if (!ArithmeticEncoder) {
	(function() {

			var maxPrecision = 28;
			var topValue = (1 << maxPrecision) - 1;
			var firstQtr = (topValue >> 2) + 1;
			var half = 2 * firstQtr;
			var thirdQtr = 3 * firstQtr;
			
			ArithmeticEncoder = function () {
				var low = 0;
				var high = topValue;
				var bitsToFollow = 0;
				var buffer = new Bits();
	
				function appendBitWithFollow(buffer, bit) {
					buffer.appendBit(bit);
					while(bitsToFollow) {
						buffer.appendBit(1 ^ bit);
						bitsToFollow--;
					}
				}
	
				this.encode = function (lowBound, highBound, total) {
	
					var range = high - low + 1;
					high = low + (((range * highBound) / total) | 0) - 1;
					low = low + (((range * lowBound) / total) | 0);
	
					for (;;) {
						if (high < half)
							appendBitWithFollow(buffer, 0);
						else if (low >= half) {
							appendBitWithFollow(buffer, 1);
							low -= half;
							high -= half;
						} else if (low >= firstQtr && high < thirdQtr) {
							bitsToFollow++;
							low -= firstQtr;
							high -= firstQtr;
						} else 
							break;
						low *= 2;
						high *= 2;
						high++;
					}
				}

				this.finalise = function() {
					bitsToFollow++;
					if (low < half)
						appendBitWithFollow(buffer, 1);
					else
						appendBitWithFollow(buffer, 0);
					buffer.finish();
					return buffer;
				}
			}
	
			ArithmeticDecoder = function (buffer) {
				var _low = 0;
				var _high = topValue;
				var value = 0;
				var bitCount = 0;
	
				this.decodeTarget = function(total) {
					return (((value - _low + 1) * total - 1) / (_high - _low + 1)) | 0;
				}
				var iterator = buffer.getIterator();
				function getNextBit() {
					value = value + iterator();
				}
	
				function startDecode() {
					for (var i = 0; i < maxPrecision; i++) {
						value <<= 1;
						getNextBit();
					}
				}
	
				this.decode = function(lowBound, highBound, total) {
					var high = _high;
					var low = _low;
					var range = high - low + 1;
					high = low + (((range * highBound) / total) | 0) - 1;
					low = low + (((range * lowBound) / total) | 0);
					for (;;) {
						if (high < half)
							;
						else if (low >= half) {
							value -= half;
							low -= half;
							high -= half;
						} else if (low >= firstQtr && high < thirdQtr) {
							value -= firstQtr;
							low -= firstQtr;
							high -= firstQtr;
						} else
							break;
						low *= 2;
						high *= 2;
						high++;
						value *= 2;
						value += iterator();
					}
					_high = high;
					_low = low;
				}
				startDecode();
			}
	})();
}

function BasicModel(coder) {
	var counts = [];
	const max = 257;
	for (var i = 0; i < max; i++) counts[i] = 1;
	var total = max;
	const eofSym = max - 1;
	this.update = function(sym) {
			counts[sym]++;
			total++;
	}
	this.computeLower = function(sym) {
			var sum = 0;
			var cnts = counts;
			for (var i = 0; i < sym; i++)
				sum += cnts[i];
			return sum;
	}
	this.emit = function(sym) {
			var low = this.computeLower(sym);
			coder.encode(low, low + counts[sym], total);
	}
	this.emitEof = function() {
			var low = this.computeLower(eofSym);
			coder.encode(low, low + 1, total);
	}
	this.decode = function () {
			var target = coder.decodeTarget(total);
			var cnts = counts;
			var high = cnts[0];
			var c = 0;
			while (target >= high)
				high += cnts[++c];
			if (c === eofSym)
				coder.eof();
			coder.decode(high - cnts[c], high, total);
			return c;
	}
}

var model = new SimpleDriver(BasicModel)

function SimpleDriver(Model) {
	this.compress = function (msg) {
			var coder = new ArithmeticEncoder();
			var model = new Model(coder);
			for (var i = 0; i < msg.length; i++) {
				var c = msg.charCodeAt(i);
				model.emit(c);
				model.update(c);
			}
			model.emitEof();
			return coder.finalise();
	}

	this.decompress = function (buffer) {
		
			var coder = new ArithmeticDecoder(buffer);
			var eof = false;
			coder.eof = function() {
				eof = true;
			}
			var model = new Model(coder);
			var message = "";
			while(true) {
				var c = model.decode();
				if (eof)
					break;
				if (c == 255) {
					model.update(c);
					c = model.decode();
					model.update(c);
					c <<= 8;
					c |= model.decode();
					model.update(c & 0xff);
				} else
					model.update(c);
				message += String.fromCharCode(c);
			}
			return message;
	}
}

var fs = require('fs')

function cli_tool() {
	if (process.argv.length < 3) {
		console.log('aricode name[.ari]')
		console.log()
		console.log('  name --> name.ari')
		console.log('  name.ari --> name.out')
		console.log()
		console.log('Output will be overwriten if exists.')
		return
	}
	
	name = process.argv[2]
	var ari_n = name.indexOf('.ari')
	
	
	if (!fs.existsSync(name)) {
		console.log('file not found')
		return
	}
	
	if (ari_n > 0 && ari_n == (name.length - 4)) {
		var s = ari_file_decode_test(name.substr(0,name.length - 4))
	}
	else
		ari_file_encode(name)
	
	return
}

function color(a) { return '\u001b[38;5;'+a+'m' }
function colorEnd() { return '\u001b(B\u001b[m'}

ari_encode = function(msg) {
	var buffer = model.compress(msg)
	return buffer.toBinaryString()
}

ari_decode = function(ari) {
	var buffer = new Bits()
	for (var f = 0; f < ari.length; f += 2) {
		buffer.buf.push((ari.charCodeAt(f)<<8) + ari.charCodeAt(f+1))
	}
	out = model.decompress(buffer)
	return out
}

ari_file_encode = function(name, silent) {
	var msg = fs.readFileSync(name).toString()
	var aridata = ari_encode(msg)
	if (!silent) {
		console.log('   '+name, '-->', name+'.ari')
		console.log('   '+msg.length, '-->', aridata.length)
	}
	fs.writeFileSync(name + '.ari', aridata, 'binary')
	return aridata.length
}

ari_file_decode = function(name, silent) {
	var ari = fs.readFileSync (name+'.ari').toString ('binary')
	var buffer = new Bits()
	for (var f = 0; f < ari.length; f += 2) {
		buffer.buf .push ((ari.charCodeAt(f )<<8) + ari.charCodeAt (f+1))
	}
	out = model.decompress(buffer);
	if (!silent) {
		console.log('   '+name+'.ari', '-->', name+'.out')
		console.log('   '+ari.length, '-->', out.length)
	}
	fs.writeFileSync(name + '.out', out)
	return out
}

ari_file_decode_test = function(name) {
	var out = ari_file_decode(name)
	if (fs.existsSync(name)) {
		process.stdout.write('   found original '+ name +' verifying...')
		var orig = fs.readFileSync (name).toString ('binary')+''
		if (orig == out) console.log(color(28) + 'OK' + colorEnd())
		else console.log(color(196) + 'FAIL' + colorEnd())
	}
}	

prog = false
if (module.parent == null) {
	prog = true
}
else {
	if (module.parent.filename.indexOf('/yy') >= 0) prog = true
}
if (prog) cli_tool()
