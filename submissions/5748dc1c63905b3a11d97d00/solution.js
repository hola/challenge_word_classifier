
function unfrcode(buf, cb) {
	const LOCATE_MAGIC = '\x00LOCATE02\x00';
	let offset = LOCATE_MAGIC.length;
	if (buf.toString('ascii', 0, offset) != LOCATE_MAGIC) {
		throw 'unfrcode: locatedb file header mismatch: ' + buf[0];
	}
	let l = 0, path = '';
	while (offset < buf.length) {
		let dl = buf.readInt8(offset);
		++offset;
		if (dl == 128) {
			dl = buf.readInt16LE(offset);
			offset += 2;
		}
		l += dl;
		let nullOffset = buf.indexOf('\x00', offset, 'utf-8');
		if (nullOffset == -1) {
			nullOffset = buf.length;
		}
		path = path.slice(0, l) + buf.toString('utf-8', offset, nullOffset);
		offset = nullOffset + 1;
		cb(path);
	}
}

function unarchive(buf, cb) {
	const SIMPLE_ARCHIVE_FORMAT_MAGIC = '\x00JSONARCHIVE\x00';
	let offset = SIMPLE_ARCHIVE_FORMAT_MAGIC.length;
	if (buf.toString('ascii', 0, offset) != SIMPLE_ARCHIVE_FORMAT_MAGIC) {
		throw 'simple archive format header mismatch';
	}
	let descriptorSize = buf.readUInt32LE(offset);
	offset += 4;
	// descriptor = [["filename", len], ...]
	let descriptor = JSON.parse(buf.toString('utf-8', offset, offset + descriptorSize));
	offset += descriptorSize;
	
	descriptor.forEach(function(entry, i) {
		let entryName = entry[0];
		let entrySize = entry[1];
		cb(entryName, buf.slice(offset, offset+entrySize));
		offset += entrySize;
	});
}

let pfxs = {}, sfxs = {};
let vowel_re = /[aeiouy]/g;

function init(data) {
	
	unarchive(data, function(filename, buf) {
		switch (filename) {
			case "d1": unfrcode(buf, function(line) {
					sfxs[line] = 1;
				}); break;
			case "d2": unfrcode(buf, function(line) {
					pfxs[line] = 1;
				}); break;
		}
	});
}

function test(word) {
	if (word.length < 5 || word.length > 12) {
		return false;
	}
	word = word.toLowerCase();
	if (word.slice(-2) == "'s") {
		word = word.slice(0, -2);
	}
	word = word.replace(vowel_re, '');
	return pfxs.hasOwnProperty(word.slice(0, 4)) && sfxs.hasOwnProperty(word.slice(2));
}

module.exports = { "test": test, "init": init };