const MAX_HASHES = 8;
const byteTable = createLookups();
const HSTART = 0xAB40;
const HMULT = 7664345;

function createLookups() {
    var byteTable = new Array(256 * MAX_HASHES);
    var h = 2097152;
    for (var i = 0; i < byteTable.length; i++) {
      for (var j =0; j < 32; j++) {
        h = (h << 21) ^ h;
        h = (h >>> 35) ^ h;
        h = (h << 4) ^ h;
      }
      byteTable[i] = h;
    }
    return byteTable;
}

var bloom;

function BloomFilter(data, log2noBits, noHashes) {
	this.data = data;
	this.hashMask = (1 << log2noBits) - 1;
	this.noHashes = noHashes;

	this.get = function(bitIndex) {
	    var bitInWordIndex = bitIndex % 8;
	    var wordIndex = (bitIndex - bitInWordIndex) / 8;
	    var prev = this.data[wordIndex];
	    return (prev >> bitInWordIndex) & 1;
	}

	this.contains = function(s) {
    	for (var i = 0; i < this.noHashes; i++) {
      		var hc = this.hashCode(s, i);
			if (!this.get(hc & this.hashMask)) 
		        return false;
    	}
    	return true;
  	}

	this.hashCode = function(s, hcNo) {
	    var h = HSTART
	    var startIndex = 256 * hcNo
	    for (var i = 0; i < s.length; i++) {
	      var b = s.charCodeAt(i);
	      h = (h * HMULT) ^ byteTable[startIndex + (b & 0xff)];
	    }
	    return h;
	}
}

exports.init = function(data) {
	bloom = new BloomFilter(data, 19, 1);
}

function dropSuffix(word, descr) {
    if (word.endsWith(descr[0]) && word != descr[0]) {
    	return word.slice(0, (descr[1] === undefined)? -descr[0].length: -descr[1]) +
        	((descr[2] === undefined) ? "" : descr[2]);
    }
    return word;
}
function dropPrefix(word, preffix) {
    if (word.startsWith(preffix) && word != preffix) {
    	return word.slice(preffix.length);
    }
    return word;
}
var prefixes = ["non","semi","anti","thorough","arithmo","counter","dinitro","quarter","genito","pseudo","after","chemo","eigen","ethno","femto","ferro","forth","micro","micro","multi","other","photo","pseud","quasi","radio","super","super","supra","ultra","under","yotta","zepto","zetta","deka","demi","down","fore","gibi","half","kilo","nano","naso","over","pico","ribo","mis","out","ovo","un","ur","chemico","hinder","psycho","audio","full","gain","kuli","like","many","post","same","self","inter","hyper","pre","sub"];
var suffixes = [["'s"],["'s"],["as", 1],["bs", 1],["cs", 1],["fs", 1],["gs", 1],["hs", 1],["js", 1],
["ks", 1],["ls", 1],["ms", 1],["ns", 1],["os", 1],["ps", 1],["rs", 1],["qs", 1],["ts", 1],["ws", 1],
["vs", 1],["xs", 1],["ys", 1],["iness", 5, "y"],["ness"],["inesses", 7, "y"],["nesses"],
["virile"],["worthy"],["scape"],["speak"],["wards"],["ds", 1],["zilla"],["dale"],["fold"],
["hood"],["land"],["less"],["less"],["like"],["mire"],["most"],["punk"],["some"],
["ward"],["ware"],["ways"],["wear"],["wide"],["wise"],["iful", 3, "y"],["ful"],["n't"],
["ies", 3, "y"],["ily", 3, "y"],["ily", 3, "y"],["ied", 3, "y"],["iest", 4, "y"],["yed", 2],
["bly", 1, "e"],["ly"],["shes", 2],["ches", 2],["xes", 2],["ied", 3, "y"],["iest", 4, "y"],["yed", 2],
["ed", 2, "ing"],["athon"],["log"],["log"],["isation", 6, "se"],["bility", 5, "le"],["ment"],
["ship"],["aholic"],["script"],["bot"],["dom"],["sys"],[ "men", 2, "an"],["kind"],["kind"],["fish"],["field"],
["ying", 3],["aes", 1],["bes", 1],["ces", 1],["ees", 1],["fes", 1],["ges", 1],["nes", 1],
["oes", 1],["pes", 1],["tes", 1],["ves", 1],["aing", 3],["cing", 3, "e"],["fing", 3],
["ging", 3, "e"],["hing", 3],["king", 3],["oing", 3],["sing", 3, "e"],["uing", 3, "e"],
["ving", 3, "e"],["wing", 3, "e"],["xing", 3],["cer", 2, "e"],["xer", 2],["wood"],["ning", 3],["sman"],["man"],
["maker"],["maker"],["ds", 1],["os", 1],["ys", 1],["aling", 3],["eling", 3],["iling", 3],["oling", 3],
["bling", 3, "e"],["cling", 3, "e"],["dling", 3, "e"],["fling", 3, "e"],["kling", 3, "e"],
["pling", 3, "e"],["hling", 4],["lling", 4],["rling", 4],["wling", 4],["bing", 4],
["bing", 3, "e"],["pping", 4],["ping", 3],["ring", 3],["tting", 4]];

exports.test = function(line) {
    line = suffixes.reduce(dropSuffix, prefixes.reduce(dropPrefix, line));
	return bloom.contains(line);
};