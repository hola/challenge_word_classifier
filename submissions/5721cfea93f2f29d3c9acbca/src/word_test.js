var g = ['a','e', 'i', 'o', 'u'];
var prefixes = ['un', 'in', 'im', 'ir', 'il', 'dis', 'mis', 're', 'pre', 'co', 'sub', 'over', 'under', 'en', 'non', 'anti'];
var endings = ["able","ac","acity", "ade","age","aholic","al","algia","an", "as", "ance","ant","ar","ard","arian","arium","ary","ate","ation","ative","cracy","crat","cule","cy","cycle","dom","dox","ed","ee","eer","emia","en","ence","ency","ent","er","ern","ese","esque","ess","est","etic","ette","ful","fy","gam","gon","hood","ian","iasis","iatric","ible","ic","ile","ily","ine","ing","ion","ious","ish","ism","ist","ite","itis","ity","ive","ization","ize","less","let","ling","loger","log","ly","ment","ness","oid","oma","onym","opia","opsy","or","ory","osis","ostomy","ous","pathy","phile","phobia","phone","phyte","plegia","plegic","pnea","scribe","sect","ship","sion","some","sophy","tia", "ism", "ess", "tion","tome","trophy","tude","ty","ular","uous","ure","ward","ware","wise", "'s", "gle", "ia"];
var roots = ["ab", "touch", "acro", "act", "aer", "idle", "size", "back", "gray", "prail", "agr", "alg", "way", "anal", "plasm", "side", "amb", "amphi", "ambul", "ami", "ana", "andr", "anim", "ann", "ante", "anth", "anthrop", "anti", "ap", "apho", "aqu", "arbor", "arch", "arch", "arthr", "art", "astro", "aster", "aud", "auto", "avi", "bar", "bell", "bene", "bi", "bibli", "bio", "blast", "blist", "burs", "calc", "cand", "capt", "cep", "ceive", "cardi", "carn", "cata", "caust",  "caut",  "cas", "cede", "ceed", "cess", "celer", "cent", "centr", "cephal", "cerebr", "cert", "chrom", "chron", "chrys", "cid", "cise", "circum",  "circle", "claim", "clam", "clar", "clud", "clus", "cline", "co", "col", "com", "cogn", "con", "contra", "corp", "cosm", "counter", "cranio", "cred", "cruc", "crypto", "cumul", "curr", "curs", "cycl", "de", "dec", "deci", "dem", "demi", "dendr", "dent", "dont", "derm", "di", "di", "dia", "dict", "domin", "don", "duc", "du", "dur", "dyn", "dys", "ego", "em", "en", "endo", "enn", "in", "ep", "equ", "erg", "esth", "ethno", "eu", "ex", "extra", "extro", "fac", "fasc", "fer", "fid", "fin", "fit", "flect", "flor", "for", "fore", "form", "fract", "frag", "fug", "funct", "fus", "fly", "gastr", "gen", "geo", "ger", "giga", "gon", "gram", "gran", "graph", "grat", "gyn", "gress", "grad", "hect", "helic", "heli", "hemi", "hem", "head", "hepa", "hept", "herbi", "hetero", "hex", "histo", "homo",  "homeo", "hydr", "hygr", "hyper", "hyp", "iatr", "icon", "idio", "il", "ig", "im", "ir", "imag", "infra", "inter", "intra",  "intro", "ir", "iso", "ject", "jud", "junct", "juven", "kilo", "kine", "lab", "lact", "later", "leuk", "lex", "liber", "lingu", "lip", "lite", "ite",  "lith", "loc", "log", "loqu", "locu", "luc", "lud", "lus", "lumin", "lun", "macro", "magn", "mal", "man", "mand", "mania", "mar", "mater",  "matr", "max", "medi", "mega", "melan", "memor", "merge",  "mers", "meso", "meta", "meter", "metr", "micro", "mid", "migr", "milli", "min", "mis", "miss", "mit", "mob", "mod", "mon", "mot", "mov", "morph", "mort", "mos", "most", "multi", "mut", "my", "narr", "nat", "nav", "necr", "neg", "neo", "nephr", "neur", "nom", "non", "nor", "not", "noun",  "nunc", "nov", "numer", "ob", "op", "oct", "ocu", "od", "odor ", "omni", "op", "opt", "ortho", "osteo", "out", "over", "oxi", "pale", "pan", "para", "para", "pater",  "patr", "path", "ped", "pel", "pent", "pept",  "peps", "per", "peri", "phag", "phil", "phon", "phot", "phyll", "phys", "phyt", "plas", "plaud", "plod", "plaus", "plos", "pneum", "pod", "poli", "poly", "pon", "pop", "port", "pos", "post", "pre", "pro", "prot", "pseud", "psych", " pugn", "pul", "purg", "put", "pyr", "quad", "quart", "quin", "radic",  "radix", "radio", "ram", "re", "reg", "retro", "rhin", "rhod", "rid", "rot", "rrh", "rub", "rupt", "san", "scend", "sci", "scler", "scop", "scrib",  "script", "se", "sheet", "shot", "show", "sect", "sed", "sid", "sess", "self", "semi", "sept", "serv", "sex", "sol", "sol", "somn", "son", "soph", "spec", "spar", "sphere", "spir", "sta", "stell", "stig", "struct", "sub", "sum", "super", "sy", "tact", "tang", "tax", "techno", "tel", "temp", "ten", "tin", "tent", "te", "trit", "term", "terr", "tetra", "the", "therm", "tort", "tox", "tract", "trans", "tri", "ultra", "un", "uni", "urb", "vac", "ven", "ver", "verb", "vers",  "vert", "vice", "vid", "vince",  "vic", "vi", "vid", "viv", "voc", "vol", "vor", " vour", "writ", "xanth", "xen", "xer", "xyl", "zo", "zyg"];

var vocal_instance = 0.362479980589055;
var diff = 0.3,
	inst = {
		min: vocal_instance - vocal_instance*diff,
		max: vocal_instance + vocal_instance*diff
	};
var prefixReg = new RegExp('^(' + prefixes.join('|') + ')');
var endingReg = new RegExp('(' + endings.join('|') + ')$');
var rootReg = new RegExp(roots.join('|'), 'g');
var rootRegRepeat = new RegExp('(' + roots.join('|') + '){2,}', 'g');

function vocal_percent(_word) {
 var cnt = 0;
 for (b in _word) {
   if (g.indexOf(_word[b])!=-1) {
     cnt++;
   }
 }
  return cnt/_word.length
}

function rating(line) {
	var p = vocal_percent(line);
	// vocalic
	var vocalicRight = (p>=inst.min && p<=inst.max);
	
	// prefix
	var hasPrefix = prefixReg.test(line);
	
	// root
	var hasRoot = rootReg.test(line);
	
	// ending
	var hasEnding = endingReg.test(line);
	

	var hasRepeatRoot = rootRegRepeat.test(line);
	

	var vrC = 0.6,
		hpC = 0.5,
		hrC = 0.9,
		heC = 0.9,
		hrrC = -0.1,
		C = 1;

	var _rating = (vocalicRight? vrC: 0 ) +
				 (hasPrefix? hpC : 0) +
				 (hasRoot? hrC : 0) +
				 (hasEnding ? heC : 0) +
				 (hasRepeatRoot? hrrC : 0);

	return _rating >= C; 
}

module.exports = {
	test: rating
}