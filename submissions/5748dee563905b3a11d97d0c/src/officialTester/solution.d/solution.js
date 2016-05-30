{
    // consts
    var EMPTY_CHAR = 0;

    // globals
    var netWeigths;
    var stringLength;  // == ann input neurons less bias

    function init(data) {
	var dataStr;

	dataStr = data;
	if      (data instanceof Buffer)                             dataStr = data.toString()
	else if (data instanceof String || typeof data === "string") dataStr = data
	else if (data instanceof Object)                             dataStr = JSON.stringify(data);

	netWeigths = JSON.parse(dataStr);
	stringLength = netWeigths[0].length - 1;
    }

    function test(word) {
	var annInVec,
            annOut,
            result;

	word = word.toLowerCase();

	if (heuristic(word)) result = false
	else {
	    annInVec = word2vec(stem(word));
	    annOut = runAnn(annInVec, netWeigths);
	    if (annOut >= 0) result = true
	    else result = false;
	}

	return result;
    }

    // args: string
    // ret:  bool
    function heuristic(word) {
	var re;

	if (word.length > 30) return true;

	re = /('.*){3,}/;
	if (re.test(word)) return true;

	re = /('.*){2,}/;
	if (re.test(word)) {
	    re = /(o')|('s)/;
	    if (! re.test(word)) return true;
	}

	return false;
    }

    // replace substring in string
    function replaceAt(str, index, sub) {
	return str.substr(0, index) + sub + str.substr(index + sub.length);
    }
    
    // args: char
    // ret:  float
    function normalizeChar(c) {
	var v = EMPTY_CHAR,  // required by vord2vec()
            f0 = -0.9,
            f1 = 1.8 / 29;
	
	switch (c) {
	case 'a': v = f0 + f1 * 0; break;
	case 'e': v = f0 + f1 * 1; break;
	case 'i': v = f0 + f1 * 2; break;
	case 'o': v = f0 + f1 * 3; break;
	case 'u': v = f0 + f1 * 4; break;
	case 'y': v = f0 + f1 * 5; break;
	case 'b': v = f0 + f1 * 6; break;
	case 'c': v = f0 + f1 * 7; break;
	case 'd': v = f0 + f1 * 8; break;
	case 'f': v = f0 + f1 * 9; break;
	case 'g': v = f0 + f1 * 10; break;
	case 'h': v = f0 + f1 * 11; break;
	case 'j': v = f0 + f1 * 12; break;
	case 'k': v = f0 + f1 * 15; break;
	case 'l': v = f0 + f1 * 16; break;
	case 'm': v = f0 + f1 * 17; break;
	case 'n': v = f0 + f1 * 18; break;
	case 'p': v = f0 + f1 * 19; break;
	case 'q': v = f0 + f1 * 20; break;
	case 'r': v = f0 + f1 * 21; break;
	case 's': v = f0 + f1 * 22; break;
	case 't': v = f0 + f1 * 23; break;
	case 'v': v = f0 + f1 * 24; break;
	case 'w': v = f0 + f1 * 25; break;
	case 'x': v = f0 + f1 * 26; break;
	case 'z': v = f0 + f1 * 27; break;
	case '\'':v = f0 + f1 * 29; break;
	}
	
	return v;
    }
    
    // args: string
    // ret:  float[]
    function word2vec(word) {
	var vec = [];
	
	for (var i = 0; i < stringLength; i++)
	    vec[i] = normalizeChar(word.charAt(i));
	
	return vec;
    }

    // compute output for given ann
    // Note: fann writes weigths starting from h1. Here they start from l0
    // args: float[input] value, float[layer][neuron][connection] weigth
    // ret:  float
    function runAnn(inputs, weigths) {
	var numLayers = weigths.length,
            ann;  // [layer][neuron]
	
	// symmetric sigmoid
	// args: float
	// ret:  float
	function sigmoid(x) {
	    return (2.0/(1.0 + Math.exp(-2.0 * x)) - 1.0);
	}
	
	function Neuron() {
	    var n = {
		inputs: [],
		weigths: [],
		output: 0,
		steepness: 0.5,
		isBias: false
	    };

	    n.compute = function() {
		var sum = 0;
	    
		// if input neuron: don't compute output
		if (this.weigths.length > 0) {	
		    for (var i = 0; i < this.inputs.length; i++)
			sum += this.inputs[i] * this.weigths[i];		
		    this.output = sigmoid(sum * this.steepness);
		}
		
		if (this.isBias) this.output = 1;
		return this.output;
	    }
	    
	    return n;
	}
	
	// initialize ann
	ann = [];
	for (var l = 0; l < numLayers; l++) {
	    ann[l] = [];
	    for (var n = 0; n < weigths[l].length; n++) {
		ann[l][n] = new Neuron;
		ann[l][n].weigths = weigths[l][n];
		if (n == weigths[l].length - 1) ann[l][n].isBias = true;
	    }
	}

	// set ann inputs
	for (var n in ann[0]) {
	    if (! ann[0][n].isBias) ann[0][n].output = inputs[n];
	}

	// compute ann
	for (var l = 1; l < numLayers; l++) {
	    for (var nc = 0; nc < ann[l].length; nc++) {
		for (var np = 0; np < ann[l - 1].length; np++) {
		    if (! ann[l][nc].isBias) ann[l][nc].inputs[np] = ann[l - 1][np].compute();
		}
	    }
	}
	
	// compute output neuron
	return ann[numLayers - 1][0].compute();
    }

    /* ann run example:
    var weigths = [
	[ [],  // input
	  [],  // input
	  []   // bias
	],
	[ [0.1, 0.1, 0.1],
	  [0.1, 0.1, 0.1],
	  [0.1, 0.1, 0.1],
	  []   // bias
	],
	[ [0.1, 0.1, 0.1, 0.1],
	  []   // bias
	]
    ];
    console.log(runAnn([1, 0], weigths));
    */

    function stem(word) {
	function Stemmer() {
	    return {b: "",  // buffer for word to be stemmed
		    k: 0,   // offset to the end of the string
		    j: 0};  // a general offset into the string
	}

	// true <=> b[i] is a consonant
	// args: Stemmer, int
	// ret:  bool
	function cons(z, i) {
	    switch(z.b.charAt(i)) {
	    case 'a':case 'e': case 'i': case 'o': case 'u': return false;
	    case 'y': return (i == 0) ? true : !cons(z, i - 1);
            default: return true;
	    }
	}
	
	// measures the number of consonant sequences between 0 and j
	// args: Stemmer
	// ret:  int
	function m(z) {
	    var n = 0,
                i = 0,
                j = z.j;
	
	    while (true) {
		if (i > j) return n;
		if (!cons(z, i)) break;
		i++;
	    }
	    i++;
	    while (true) {
		while (true) {
		    if (i > j) return n;
		    if (cons(z, i)) break;
		    i++;
		}
		i++;
		n++;
		while (true) {
		    if (i > j) return n;
		    if (!cons(z, i)) break;
		    i++;
		}
		i++;
	    }
	}
	
	// true <=> 0,...j contains a vowel
	// args: Stemmer
	// ret:  bool
	function vowelinstem(z) {
	    var j = z.j,
                i;
	    
	    for (i = 0; i <= j; i++) if (!cons(z, i)) return true;
	    return false;
	}
	
	// true <=> j,(j-1) contain a double consonant
	// args: Stemmer, int
	// ret:  bool
	function doublec(z, j) {
	    if (j < 1) return false;
            if (z.b.charAt(j) != z.b.charAt(j - 1)) return false;
            return cons(z, j);
	}
	
	// true <=> i-2,i-1,i is consonant-vowel-consonant and if the second c is not w,x or y
	// args: Stemmer, int
	// ret:  bool
	function cvc(z, i) {
	    var ch = z.b.charAt(i);

	    if (i < 2 || !cons(z, i) || cons(z, i - 1) || !cons(z, i - 2)) return false;
            if (ch == 'w' || ch == 'x' || ch == 'y') return false;
            return true;
	}

	// true <=> 0,...k ends with the string s
	// args: Stemmer, char
	// ret:  bool
	function ends(z, s) {
	    var length = s.length,
                k = z.k;
	    
	    if (! z.b.substring(0, k + 1).endsWith(s)) return false;
	    z.j = k - length;
	    return true;
	}
	
	// set (j+1),...k to the characters in the string s, readjusting k
	// args: Stemmer, char
	// ret:  void
	function setto(z, s) {
	    var length = s.length,
                j = z.j;

	    z.b = z.b.substring(0, j + 1) + s + z.b.substring(j + length + 1);
	    z.k = j + length;
	}
	
	// args: Stemmer, char
	// ret:  void
	function r(z, s) {
	    if (m(z) > 0) setto(z, s);
	}
	
	// remove genitive
	// args: Stemmer
	// ret:  void
	function step0(z) {
	    var gen = "'s";
	    
	    if (z.b.endsWith(gen)) z.b = z.b.slice(0, -2);
	    z.k = z.b.length - 1;
	}
	
	
	// get rid of plurals and -ed or -ing
	// args: Stemmer
	// ret:  void
	function step1ab(z) {
	    if (z.b.charAt(z.k) == 's') {
		if (ends(z, "sses")) z.k -= 2;
		else
		    if (ends(z, "ies")) setto(z, "i");
		else
		    if (z.b.charAt(z.k - 1) != 's') z.k--;
	    }
	    if (ends(z, "eed")) {
		if (m(z) > 0) z.k--;
	    } else
		if ((ends(z, "ed") || ends(z, "ing")) && vowelinstem(z)) {
		    z.k = z.j;
		    if (ends(z, "at")) setto(z, "ate");
		    else
			if (ends(z, "bl")) setto(z, "ble");
		    else
			if (ends(z, "iz")) setto(z, "ize");
		    else
			if (doublec(z, z.k)) {
			    z.k--;
			    var ch = z.b.charAt(z.k);
			    if (ch == 'l' || ch == 's' || ch == 'z') z.k++;
			} else if (m(z) == 1 && cvc(z, z.k)) setto(z, "e");
		}
	}
	
	// turns terminal y to i when there is another vowel in the stem
	// args: Stemmer
	// ret:  void
	function step1c(z) {
	    if (ends(z, "y") && vowelinstem(z)) z.b = replaceAt(z.b, z.k, 'i');
	}
	
	// map double suffices to single ones
	// args: Stemmer
	// ret:  void
	function step2(z) {
	    switch (z.b.charAt(z.k - 1)) {
	    case 'a': if (ends(z, "ational")) {
		r(z, "ate");
		break;
            }
		if (ends(z, "tional")) {
		    r(z, "tion");
		    break;
		}
		break;
	    case 'c': if (ends(z, "enci")) {
		r(z, "ence");
		break;
            }
		if (ends(z, "anci")) {
		    r(z, "ance");
		    break;
		}
		break;
	    case 'e': if (ends(z, "izer")) {
		r(z, "ize");
		break;
            }
		break;
	    case 'l': if (ends(z, "bli")) {
		r(z, "ble");
		break;
            } /*-DEPARTURE-*/
		if (ends(z, "alli")) {
		    r(z, "al");
		    break;
		}
		if (ends(z, "entli")) {
		    r(z, "ent");
		    break;
		}
		if (ends(z, "eli")) {
		    r(z, "e");
		    break;
		}
		if (ends(z, "ousli")) {
		    r(z, "ous");
		    break;
		}
		break;
	    case 'o': if (ends(z, "ization")) {
		r(z, "ize");
		break;
            }
		if (ends(z, "ation")) {
		    r(z, "ate");
		    break;
		}
		if (ends(z, "ator")) {
		    r(z, "ate");
		    break;
		}
		break;
	    case 's': if (ends(z, "alism")) {
		r(z, "al");
		break;
            }
		if (ends(z, "iveness")) {
		    r(z, "ive");
		    break;
		}
		if (ends(z, "fulness")) {
		    r(z, "ful");
		    break;
		}
		if (ends(z, "ousness")) {
		    r(z, "ous");
		    break;
		}
		break;
	    case 't': if (ends(z, "aliti")) {
		r(z, "al");
		break;
            }
		if (ends(z, "iviti")) {
		    r(z, "ive");
		    break;
		}
		if (ends(z, "biliti")) {
		    r(z, "ble");
		    break;
		}
		break;
	    case 'g': if (ends(z, "logi")) {
		r(z, "log");
		break;
            } /*-DEPARTURE-*/
	    }
	}
	
	// deal with -ic-, -full, -ness, etc
	// args: Stemmer
	// ret:  void
	function step3(z) {
	    switch (z.b.charAt(z.k)) {
	    case 'e': if (ends(z, "icate")) {
		r(z, "ic");
		break;
            }
		if (ends(z, "ative")) {
		    r(z, "");
		    break;
		}
		if (ends(z, "alize")) {
		    r(z, "al");
		    break;
		}
		break;
	    case 'i': if (ends(z, "iciti")) {
		r(z, "ic");
		break;
            }
		break;
	    case 'l': if (ends(z, "ical")) {
		r(z, "ic");
		break;
            }
		if (ends(z, "ful")) {
		    r(z, "");
		    break;
		}
		break;
	    case 's': if (ends(z, "ness")) {
		r(z, "");
		break;
            }
		break;
	    }
	}
	
	// take off -ant, -ence, etc., in context <c>vcvc<v>
	// args: Stemmer
	// ret:  void
	function step4(z) {
	    switch (z.b.charAt(z.k - 1)) {
            case 'a': if (ends(z, "al")) break;
		return;
	    case 'c': if (ends(z, "ance")) break;
		if (ends(z, "ence")) break;
		return;
	    case 'e': if (ends(z, "er")) break;
		return;
	    case 'i': if (ends(z, "ic")) break;
		return;
	case 'l': if (ends(z, "able")) break;
		if (ends(z, "ible")) break;
		return;
	    case 'n': if (ends(z, "ant")) break;
		if (ends(z, "ement")) break;
		if (ends(z, "ment")) break;
		if (ends(z, "ent")) break;
		return;
	    case 'o': if (ends(z, "ion") && (z.b.charAt(z.j) == 's' || z.b.charAt(z.j) == 't')) break;
		if (ends(z, "ou")) break;
		return;
		/* takes care of -ous */
	    case 's': if (ends(z, "ism")) break;
		return;
	    case 't': if (ends(z, "ate")) break;
		if (ends(z, "iti")) break;
		return;
	    case 'u': if (ends(z, "ous")) break;
		return;
	    case 'v': if (ends(z, "ive")) break;
		return;
	    case 'z': if (ends(z, "ize")) break;
		return;
	    default: return;
	    }
	    if (m(z) > 1) z.k = z.j;
	}
	
	// remove final -e if m(z) > 1, and changes -ll to -l if m(z) > 1
	// args: Stemmer
	// ret:  void
	function step5(z) {
	    z.j = z.k;
	    if (z.b.charAt(z.k) == 'e') {
		var a = m(z);
		if (a > 1 || a == 1 && !cvc(z, z.k - 1)) z.k--;
	    }
	    if (z.b.charAt(z.k) == 'l' && doublec(z, z.k) && m(z) > 1) z.k--;
	}
	
	// args: string
	// ret:  string
	function _stem(word) {
	    var z = new Stemmer,
                k = word.length - 1;
	    
	    if (k <= 1) return word;
	    
	    word = word.toLowerCase();
	    z.b = word;
	    z.k = k;
	    
	    step0(z);
	    step1ab(z);
	    step1c(z);
	    step2(z);
	    step3(z);
	    step4(z);
	    step5(z);
	    
	    return z.b.substring(0, z.k + 1);
	}
	
	return _stem(word);
    }
    
    /* stem example:
      console.log(stem("qs"));
    */

    module.exports = {
	init: init,
	test: test
    };
}

