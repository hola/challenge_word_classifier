const fs = require('fs')
const zlib = require('zlib')

function hash1(string)
{
	let result = 0;
	for (let i = 0; i < string.length; ++i)
		result = (26 * result + string.charCodeAt(i)-96) & 0x7FFFF;
	return result
}

function bitpos(index) {
	let pos = {}
	pos.octet = Math.floor(index/8)
	pos.mask = 1<<(index%8)
	return pos
}

function toSingl(word) {
	return word.replace(/'s$/,'').replace(/sses$/,'ss').replace('ies','y').replace(/(.{2,}[^s])(s|ion)$/,'$1').replace(/(ly|ing|[ai]ble|ic|e?ment|ism|ity|ous|ive|ful|ness)+$/,'')
}

function addWord(word) {
	sword = toSingl(word);
	if (sword.length<13 && word.length>1 && !/'/.test(sword)) {
		let offset = sword.length==2?65537:0;
		let pos = bitpos(hash1(sword));
		buf[pos.octet+offset] |= pos.mask;
	}
}

let buf
function addWords(size) {
	buf = Buffer.alloc(size);
	fs.readFileSync('allwords.txt','utf8').split('\n').forEach(word=>addWord(word));
}

let counter = {}

function countWrongs(buf,line) {
	let [word,flag] = line.split(' ');
	sword = toSingl(word)
	if (sword.length>=13 || word.length<3 || /'|j[qxz]|q[jxz]|vq|xj|zx|^([blmuwz]q|[flvxy]k|[ghkwy]x|[krvwxy]z|[qx]g|uo|[yz]j|z[cfv])|(g[jz]|j[bfhw]|k[qz]|mq|pz|q[kow]|tq|v[kz]|[wy][jq]|x[ghkz]|z[fjmpqw])$|[^aeiouy]{5,}/.test(sword))
		return;
	let h = hash1(sword);
	if (!counter[h])
		counter[h] = {r:0,w:0};
	let pos = bitpos(h);
	let res = (buf[pos.octet] & pos.mask) != 0;
	if (flag == String(res))
		counter[h]['r']++;
	else {
		counter[h]['w']++;
	}
}

function clearWrongs() {
	fs.readFileSync('testwords.txt','utf8').trim().split('\n').forEach(line=>countWrongs(buf,line));
	for (let iter in counter) {
		let {r,w} = counter[iter];
		if (w>3 && w>r) {
			let pos = bitpos(iter);
			buf[pos.octet] &= ~pos.mask;
		}
	}
	const gzOptions = { chunkSize : 1024*1024 , level : 9 , strategy : 3 }
	fs.writeFileSync('data.gz',zlib.gzipSync(buf,gzOptions),'binary');
}

addWords(65621)
clearWrongs()

