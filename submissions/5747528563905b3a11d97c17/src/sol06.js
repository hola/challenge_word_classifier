/*
	Hola Dictionary Competition
	Solution
	(c) Andrey Gershun, 2016
*/


// Constants - to be remove
var 	M = 8, // Maximum level of analysis
		T = 7, // Lowest level of analysis
		B = 3, // Number of tail characters
		D = 8,  // Divider for tail packing
		A = "'abcdefghijklmnopqrstuvwxyz$", // Alphabet
//		Z = "0123456701234567012345670123", // Depack alphabet
		Z = "0012416001234565342750526030",
/*
		// Pairs
		pairs = "jqzxxjqj'zvqqzjxqxjz'j'x'''qgxvjwxhxqhqgwq'yqpqyzjkxvwqcpxvbvxxzqv'wqffqfxkz'kcxjvqkxk'g'uqbqn'bgqkq'fcjjbqd'psxfzpqqwqmjfjgjwqlfvbxvfmxdxqqqtvztx'h'mqowjpzzqjtbqyqjmqr'r'vjjzfmqqejhvh'oxqjljpxgvpfjbzxr'njkxx'i'ctqvgjyvmjcdqqs'llx'eq'xnjdxvzgwvyjxdhq";
// Можно этого
		var dpairs = {};
		for(var i=0;i<pairs.length/2;i+=2) {
			dpairs[pairs[i]+pairs[i+1]];
		}
*/

// Variables
	bstr = '', 	// Binary string            // z
	fpairs, 	// Bad Pairs   				// y
	bad,		// Array with Dictionary 	// x
	node,		// Haffamn codes Tree 		// o
	ddo = [], 	//  						// p
	ddd = {},	// Basic Dictionary 		// d
	tt = {}	// Array of endings 		// w
; 

/**
	
*/
module.exports = { 

	/**
		Initiate dictionaries
		@param  data - buffer with data
		@return nothing
	*/
	init: function(data) {
		// Step 1: Convert binary to string
		for(let i=0;i<data.length;i++) {
			bstr += ('00000000'+data[i].toString(2)).substr(-8);
		}

		// Step 2: Unpack bad pairs
		fpairs = unpackDict(2);	// Bad pairs

		// Step 3: Unpack Main dictionary
		bad = unpackDict(M); 	// Main dictionary

		// Step 4: Unpack Tree
		node = unpackNode(); 	// Haffman Tree

		// Step 5: Unpack Tails
		decodeTails();		// Dictionary with tails
		unpackTails();			// Tails
	},

	/**
		Test word
		@param w - string - word
		@return true/false valid word
	*/
	test: function(w) {
		// Rule 1: Remove lengthy words
		if(w.length > 16) return 0; // reduce to false

		// Loop over different word lengths
		for(var i=0;i<T;i++) {
//			if(ddd[M-i][w.substr(0,M-i)]) {
			if(tt[w.substr(0,M-i)]) {


				// Convert tail to 8-bit
				var bs = w
				.substr(M-i,B)
				.split('')
//				.map(c=>"01234567"[(c=="'"?0:c.charCodeAt(0)-96)%8])
				.map(c=>Z[(c=="'"?0:c.charCodeAt(0)-96)])
				.join('');

				// Rule 2: If tail is OK
				if(tt[w.substr(0,M-i)][bs]) {
					var cw = w.substr(M-i),
						cl=cw.length,
						amp = cw.indexOf("'"),

					// Rule 3: 5 consonants
						gs = cw
						.split('')
						.map(c=>c=="'"?c:"01110111011111011111011101"[c.charCodeAt(0)-97])
						.join('');
	
					for(let e=0;e<gs.length-4;e++) {
						if(gs.substr(e,5) == '11111') {
							return 0;
						}
					}

					// Rule 4: Single quote
					
					if(amp>-1) {
						if(amp<cl-2 || amp == cl-1) {
							return 0;
						}
						if(amp == cl-2 && cw[cl-1] != 's') return 0;
					}

					// Rule 5: Bad pairs
					var cw = w.substr(M-i+B-1);
					for(var e=0;e<cw.length-1;e++) {
						if(fpairs[cw[e]]&&fpairs[cw[e]][cw[e+1]]) {
							return 0;
						}
					}
					return 1; 	// Everything is OK
				} else break;		// return false;
			}
		}
		return 0; // May be return?
	}

};

/**
	Get substring
	@param n - number of bits
	@return string 
*/
function getN(n) {

	// if(n > bstr.length) {
	// 	console.log('error',n);
	// 	process.exit();
	// }
	var s = bstr.substr(0,n);
	bstr = bstr.substr(n);
	return s;
}

/**
	Get n bits and parse into number
*/
function pgn(n) {
	return parseInt(getN(n),2);
}

/**
	Get next 1 bit
	@return bit 
*/
function get1(){
	return +getN(1);
}


/**
	Unpack dictionary from binary string
*/
function unpackDict(maxlvl, lvl) {
	if(!lvl) lvl = 0;

	var z = {};
	var a = {};

	if(get1()) {
		getN(28).split('').forEach(function(v,idx){
			if(+v) {
				a[A[idx]] = 1;
			}
		});
	} else {
		function V(){a[A[parseInt(getN(5),2)]] = 1}
		V();
		if(get1()) {
			V();
			if(get1()) {
				V();
				if(get1()) {
					V();
					if(get1()) {
						V();
					}
				}
			}
		}

/*
		a[A[parseInt(getN(5),2)]] = 1;
		if(get1()) {
			a[A[parseInt(getN(5),2)]] = 1;
			if(get1()) {
				a[A[parseInt(getN(5),2)]] = 1;
				if(get1()) {
					a[A[parseInt(getN(5),2)]] = 1;
					if(get1()) {
						a[A[parseInt(getN(5),2)]] = 1;
					}
				}
			}
		}
*/
	}
	A.split('').forEach(function(k) {
		if(a[k]) {
			z[k] = (k=='$' || lvl>=maxlvl-1)?1:unpackDict(maxlvl,lvl+1);
		}
	});

	return z;
};

/**
	Unpack Haffman code tree
*/
function unpackNode() {
	return [
		get1()?pgn(9):unpackNode(),
		get1()?pgn(9):unpackNode()
	]
}

/**
	Decode tails
*/
function decodeTails(){
  ddo=[];
  var p=node;
  for (var i=0;i<bstr.length;i++) {
      if(bstr[i] == 0){
          p=p[0];
      } else if(bstr[i] == 1) {
          p=p[1];
      // } else {
      // 	throw new Error('wrong symbol');
      }
      if (typeof p != 'object' || typeof p == 'undefined'){
          ddo.push(p);
          p = node;
      }
  }
}




function unpackTails() {
	var ad = [];

	dig('',bad,ad);
	ad.sort();

	ad.forEach(function(a){
		if(a=='') return;
		tt[a] = {};
		let di  = depack(0,a);

		dig2('',di,tt[a]);
	});

	function dig(s,bad,ad) {
		if(!bad || Object.keys(bad).length == 0) {
			ad.push(s);
		} else {
			for(let k in bad) {
				if(k == '$') {
					ad.push(s);
				} else {
					dig(s+k,bad[k],ad);
				}
			}			
		}
	}

/* 
	Unpack tails
*/

	function dig2(s,bad,ad1) {
		if(bad == true || Object.keys(bad).length == 0) {
			ad1[s]=1;
		} else {
			for(var k in bad) {
				if(k == '$') {
					ad1[s]=1;
				} else {
					dig2(s+k,bad[k],ad1);
				}
			}			
		}
	}



	function depack(lvl) {
		if(!lvl) lvl=0;
		var d = {},
			h = ddo.shift(),
			f = h & 256;

		if(h & 256) {
			h ^= 256;
			d['$'] = 1;
//		} else {
		}
		var h1 = ('00000000'+h.toString(2)).substr(-D);

		h1.split('').forEach(function(hc,idx) {

			if(+hc) {
				if(lvl < B-1) {
					d[idx] = depack(lvl+1)
				} else {
					d[idx] = 1;
				}
			}				
		});

		return d;
	}


};


