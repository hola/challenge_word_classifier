/*
	Hola Dictionary Competition
	Generate Dictionary
	(c) Andrey Gershun, 2016
*/

var fs = require('fs');
var htest = require('./htest');

const MX = 8; // Maximum level of analysis
const ST = 7; // Lowest level of analysis
const AB = 3; // Number of tail characters
const LIM = 157; // Number of minimum words in the nest
const DIV = 8;  // Divider for tail packing

const ABC = "'abcdefghijklmnopqrstuvwxyz$";
//const XYZ = "0123456701234567012345670123"; // Depack alphabet
const XYZ = require('./xyz'); // Depack alphabet


var node; // Huffman tree 

// Assign generate procedure to the module
module.exports = {generate:generate};

/**
	Generate data with dictionary
	@return Buffer with dictionary
*/
function generate() {

	var patt = []; // TODO: May be remove it

	// Step 1: Save all bases into the dictionary

	var ddd = {}; 	// Dictionary of dictionaries with entries by their length
	var gg = htest.gwords.slice();	// Copy of array with good words
	var ad = []; // Global array for entries

	for(var i=0;i<ST;i++) {
		ddd[MX-i] = {}; // Prepare dictionary nest

		var dd = {};	// Local dictionary with entries
		var ad1 = []; 	// Local array for entries

		gg.forEach(function(w){			// Save into the dictionary number of good words
			var k = w.substr(0,MX-i);	
			if(!dd[k]) dd[k] = {k:k,q:0}; // k - is a word, q = number of words
			dd[k].q++;
		});

		// Save all antries with number of good words > LIM
		for(var kd in dd) {
			d = dd[kd];

			if(d.q > LIM) {
				ddd[MX-i][d.k] = []; // Save the dictionary
				ad.push(d.k);	// Save key in the global list for packing
				ad1.push(d.k);  // Save the key in the local list 
			}
		}

		// Save all endings

		// Clear array of good words (gg) from selected entries (e)
		gg = gg.filter(w => !ad1.some(e => w.substr(0,e.length)==e));
		console.log('Step:',i, ad1.length, gg.length, gg.length/htest.gwords.length);
	}
	ad = ad.sort(); // For packing
	console.log('Entries:',ad.length);


	// Step 2: Put all the tails into array

	htest.gwords.forEach(function(w) {
		for(var i=0;i<ST;i++) {
			if(ddd[MX-i][w.substr(0,MX-i)]) {
				var cw = bi(w.substr(MX-i));
				ddd[MX-i][w.substr(0,MX-i)].push(cw);
			}
		}
		return true;
	});

	var saa = '';
	var saa = [];
	var akk = [];
	for(var i=0;i<ST;i++) {
		akk = akk.concat(Object.keys(ddd[MX-i]));
	}
	akk = akk.sort();

	akk.forEach(function(cw){

		var aa = createDict(ddd[cw.length][cw], AB);
		var sa = codeDictPass1(aa);
		saa = saa.concat(sa);

		if(false) {
		// Для тестирования
			var a = {};
			ddd[cw.length][cw].forEach(function(f) {
				a[f] = true;
			});
			ddd[cw.length][cw] = a;
		}

	});

	var bs = '';

	var bpairs = packArray(htest.fpairs,2);	// Pack bad pairs

	var bad = packArray(ad,MX);				// Pack dictionary

	var hf = createHuffman(saa);			// Pack tails with Huffman tree

	var ns = packNodeLevel(hf.node);		// Pack nodes

	bs += bpairs + bad + ns + hf.res;

	// Step 4: Create binary buffer from binary string

	let len = Math.ceil(bs.length/8);
	const buf = new Buffer(len);
	for(let i=0;i<len;i++) {
		buf[i] = parseInt((bs.substr(i*8,8)+'00000000').substr(0,8),2);
	}	

	return buf;
}

/**
	Pack Huffman tree into binary string
	@param {object} Haffman tree
	@return {string} binary string

	Recursive function to pack each level
*/
function packNodeLevel(node) {
	let s = '';
	for(let i=0;i<2;i++) {	
		if(typeof node[i] == 'string' || node[i] === "undefined") {
			s += '1';
			if(node[i] === "undefined") {
				s += '000000000';
			} else {
				s += ('000000000'+(+node[i]).toString(2)).substr(-9);
			}
		} else {
			s += '0';
			s += packNodeLevel(node[i]);
		}
	}
	return s;
}

/**
	Convert string to 8-bit
	@param w {string} word
	@return {string} 8-bit string
*/
function bi(w) {
	var s = '';
	for(var i=0;i<Math.min(w.length,AB);i++) {
		var ch;
		if(w[i] == "'") ch = 0;
		else ch = w.charCodeAt(i)-96;

//		s += "0123456789ABCDEF"[ch % DIV];
		s += XYZ[ch];
	}
	return s;
}

/**
	Pack and code array of words with 28-bit coding
	@param ad {array} array of words
	@return {string} binary string
*/
// TODO: remove and simplify
function packArray(ad,maxlvl) {
	var dd = createDict(ad,maxlvl);
	return codeDict28(dd,maxlvl);
}

/** 
	Pack dictionary to 28 bit coding
	@param dd {object} Object
	@return {string} Binary string with acked dictionary
*/
function codeDict28(dd,maxlvl,lvl) {
//	console.log(199,dd.j);
	if(!lvl) lvl = 0;
	var s = '';

	var kk = Object.keys(dd);
	var kl = kk.length;

	if(kl == 0 || (kl==1 && dd['$'])) {
		s += '0'+('00000'+ABC.indexOf('$').toString(2)).substr(-5)+'0';
	} else if(kl <= 5) {
		s += '0';

		kk.forEach(function(k,idx){
			var code = ABC.indexOf(k);
			s += ('00000'+code.toString(2)).substr(-5);
			if(idx < 4) {
				if(idx<kl-1) s+= '1'; else s+='0';
			}
		});

	} else {
		s += '1';
		var pat = [
			0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0,0,0,
			0,0,0,0,0,0,0,0
		];

		ABC.split('').forEach(function(k,idx){
			if(dd[k]) {
				pat[idx] = 1;
			}
		});
		s += pat.join('');	
	}

	if(lvl < maxlvl-1) {
		ABC.split('').forEach(function(k){
			if(dd[k] && k!='$') {
				s += codeDict28(dd[k],maxlvl,lvl+1);
			}
		});
	}

	return s;
}

/**
	Convert dictionary to array of numbers
	@param dd {object}
	@param lvl {number} Current level
	@return {array} Array of numbers
*/

function codeDictPass1(dd,lvl) {
	if(!lvl) lvl = 0;
//	if(lvl >= AB) return [];

	var sa = [];
	var kk = Object.keys(dd);
	var kl = kk.length;

	var pat = [];

	if(dd['$']) pat.push(1); 
	else pat.push(0);

	for(var i=0;i<DIV;i++) pat.push(0);

	var ddk = Object.keys(dd).sort();
	ddk.forEach(function(k) {
		if(k!='$') {
			pat[+k+1] = 1;
		}
	});

	sa.push(parseInt(pat.join(''),2));
	
//	if(sa[sa.length-1] == undefined) console.log(dd);

	var ddk = Object.keys(dd).sort();
	ddk.forEach(function(k) {
		if(dd[k] && k!='$' && lvl < AB-1) sa = sa.concat(codeDictPass1(dd[k],lvl+1));
	});
	return sa;
}

/** 
	Create dictionary for 
	ad - array of entries
	@return compacted dictionary
*/

function createDict(ad, maxlvl) {
	var dd = {}; // Dictionary
	for(var i=0;i<ad.length;i++) {
		var w = ad[i];
		var d = dd;  // Local reference to the dictionary for each step
		for(var j=0;j<w.length;j++) {
			var ch = w[j];
			if(j === maxlvl-1) {
				d[ch] = true;
				break;
			} else {
				if(!d[ch]) d[ch] = {};
				d = d[ch];
				if(j == w.length-1) d['$'] = true;									
			}
		}
	};
	return dd;
}


/*
	Create Huffman tree
	@param arr {array} Array with codes
	@return 
*/
function createHuffman(arr) {
	var freqs = frequency(arr);
	var letters = sortfreq(freqs);  // Array with frequences
	var tree = buildtree(letters);
	var node = trimtree(tree); // Global variable
	var codes = assigncodes({}, node);

	return {node:node, res:encode(arr, codes)};
}

/**
	Calculate frequencey of elements in the array with tails
	@param str {array} source array
	@return {array} Array of frequences
*/
function frequency(arr) {
	var freqs = {};
	for (var i = 0; i<=arr.length;i++){
		if (arr[i] in freqs){
			freqs[arr[i]] ++;
		} else {
			freqs[arr[i]] = 1;
		}
	}
	return freqs;
}

/**
	Sort symbols according their frequences
	@param freqs {object} Hash of frequences
	@return letters {array} Array of letters with frequences
*/
function sortfreq(freqs) {
	var letters = [];
	for (var ch in freqs){
		letters.push([freqs[ch],ch]);
	}
	// By some reasons JS can not sort numbers...
	letters.sort(function(a,b){
		if(a[0]==b[0]) return 0;
		if(a[0]>b[0]) return 1;
		return -1;
	});  
	return letters;
}

/**
	Build Huffman tree
	@param letters {array} Array with chars and 
	@return {array} Sorted tree
*/
function buildtree(letters){
	while(letters.length>1){
		var leasttwo = letters.slice(0,2);
		var therest = letters.slice(2,letters.length);
		var combfreq = letters[0][0] + letters[1][0];
		letters = therest;
		var two = [combfreq,leasttwo];
		letters.push(two);
		letters.sort(function(a,b){
			if(a[0]==b[0]) return 0;
			if(a[0]>b[0]) return 1;
			return -1;
		});  
	}
	return letters[0];
}

/**
	Trim Huffman tree
	@param tree {array} Array with tree
	@return {array} Array with two elements
*/
function trimtree(tree) {
	var p = tree[1];
	if (typeof p === 'string'){
		return p;
	} else {
		return (Array(trimtree(p[0]),trimtree(p[1])));
	}
}

/** 
	Assign binary codes to the Huffman tree
	@param codes {array} Array with codes
	@param node {array} current node of the tree
	@param pat {string} pattern
	@return codes {object} has with codes
*/
function assigncodes(codes, node, pat){
	pat = pat || "";
	if(typeof(node) == typeof("")){
		codes[node] = pat;
	} else{
		assigncodes(codes, node[0],pat+"0");
		assigncodes(codes, node[1],pat+"1");
	}
	return codes;
}


/**
	Encode array with tails into string with Huffman tree
	@param arr {array} source array
	@return {string} string with binary codes
*/
function encode(arr,codes) {
	var output = "";
	for (var i=0;i<arr.length;i++){
		output = output+codes[arr[i]];
	}
	return output;
}


