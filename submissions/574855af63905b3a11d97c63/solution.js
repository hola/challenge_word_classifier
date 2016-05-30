
let bits;
let size = Math.pow(2, 19)-14;

function init(buffer) {
	bits = buffer;
}


function test(k) {
	if (k.length > 20)
		return false;

	if (k[0] == "'" || k[k.length-1] == "'")
		return false;

	if (k[0] == 'y')
		return false;

	if (/[qxzj]/.test(k))
		return false;

	if (/^[^ayiuoe]{3,}/.test(k))
		return false;

	if (/((?![aeyiou])[a-z]){5,}/.test(k))
		return false;

	if (k.match(/'/g) &&k.match(/'/g).length > 1)
		return false;

	if (/'...*/.test(k))
		return false;

	if (/(.).*?(\1.*){3,}/.test(k))
		return false;

	if (/(.)\1{2,}/.test(k))
		return false;

	let index = hash(k) % size;
	return (bits[Math.floor(index / 8)] >>> (index % 8)) & 1;
}

function hash(str) {
	let hash = 17;
	for(let c of str)
		hash = (hash*31 + c.charCodeAt()) & 0x7FFFFFFF;
	return hash;
}

module.exports = { init, test };
