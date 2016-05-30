(function () {
    'use strict';

    var DEFAULT_MAX_DEPTH = 6;
    var DEFAULT_ARRAY_MAX_LENGTH = 50;
    var seen; // Same variable used for all stringifications

    Date.prototype.toPrunedJSON = Date.prototype.toJSON;
    String.prototype.toPrunedJSON = String.prototype.toJSON;

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        };

    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }

    function str(key, holder, depthDecr, arrayMaxLength) {
        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            partial,
            value = holder[key];
        if (value && typeof value === 'object' && typeof value.toPrunedJSON === 'function') {
            value = value.toPrunedJSON(key);
        }

        switch (typeof value) {
        case 'string':
            return quote(value);
        case 'number':
            return isFinite(value) ? String(value) : 'null';
        case 'boolean':
        case 'null':
            return String(value);
        case 'object':
            if (!value) {
                return 'null';
            }
            if (depthDecr<=0 || seen.indexOf(value)!==-1) {
                return '"-pruned-"';
            }
            seen.push(value);
            partial = [];
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                length = Math.min(value.length, arrayMaxLength);
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value, depthDecr-1, arrayMaxLength) || 'null';
                }
                v = partial.length === 0
                    ? '[]'
                    : '[' + partial.join(',') + ']';
                return v;
            }
            for (k in value) {
                if (Object.prototype.hasOwnProperty.call(value, k)) {
                    try {
                        v = str(k, value, depthDecr-1, arrayMaxLength);
                        if (v) partial.push(quote(k) + ':' + v);
                    } catch (e) {
                        // this try/catch due to some "Accessing selectionEnd on an input element that cannot have a selection." on Chrome
                    }
                }
            }
            v = partial.length === 0
                ? '{}'
                : '{' + partial.join(',') + '}';
            return v;
        }
    }

    JSON.pruned = function (value, depthDecr, arrayMaxLength) {
        seen = [];
        depthDecr = depthDecr || DEFAULT_MAX_DEPTH;
        arrayMaxLength = arrayMaxLength || DEFAULT_ARRAY_MAX_LENGTH;
        return str('', {'': value}, depthDecr, arrayMaxLength);
    };

}());

var trie = {}, analizator = {}, sr = {}, srRes = {};

var addWordToTrie = function(word) {
	var i = 0,
	len = word.length,
	node = trie;

	while (i < len) {
		if (typeof node[word[i]] === "undefined") {
			node[word[i]] = {};
		}

		node = node[word[i]];
		i++;
	}
};

var clone = function(object) {
   return JSON.parse(JSON.pruned(object, 17, 26));
};

var compressTrie = function(node, key) {
	var len = (typeof Object.keys(node[key]) === "string" ? 1 : Object.keys(node[key]).length);

	if (len > 1) {
		for (var subKey in node[key]) {
			compressTrie(node[key], subKey);
		}
	} else {
		if (len === 1) {
			if (typeof node[key][Object.keys(node[key])[0]] !== "undefined") {
				compressTrie(node[key], Object.keys(node[key])[0]);
				node[key + Object.keys(node[key])[0]] = clone(node[key][Object.keys(node[key])[0]]);
				delete node[key];
			}
		}
	}
};

var buildTrie = function() {
	var fs = require("fs"),
	text = fs.readFileSync("C:\\Users\\рр\\Desktop\\Конкурс\\result.txt", "utf8"),
	words = text.toLowerCase().replace(/\r/g, "").split("\n"),
	countWords = words.length,
	i = 0;

	while (i < countWords) {
		addWordToTrie(words[i]);
		i++;
	}

	for(var key in trie) {
		compressTrie(trie, key);
	}

	fs.writeFileSync("C:\\Users\\рр\\Desktop\\Конкурс\\trie.txt", JSON.pruned(trie, 17, 26));
};

var replacer = function() {
	var fs = require("fs"), text = "";
	fs.readFile("C:\\Users\\рр\\Desktop\\Конкурс\\trie.txt", "utf8", function(err, trieT) {
		if (err) {
			return console.log(err);
		}

		text = trieT.replace(/:/g, "")
					.replace(/\"/g, "")
					.replace(/{}/g, "");

		fs.writeFile("C:\\Users\\рр\\Desktop\\Конкурс\\trie.txt", text, function() {
			if (err) {
				return console.log(err);
			}
		});
	});
};

var initAnalizator = function() {
	analizator = {
		//lengths: {"0": 0, "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0, "10": 0, "11": 0, "12": 0, "13": 0, "14": 0, "15": 0, "16": 0, "17": 0, "18": 0, "19": 0, "20": 0},
		//symbols: {"a": 0, "b": 0, "c": 0, "d": 0, "e": 0, "f": 0, "g": 0, "h": 0, "i": 0, "j": 0, "k": 0, "l": 0, "m": 0, "n": 0, "o": 0, "p": 0, "q": 0, "r": 0, "s": 0, "t": 0, "u": 0, "v": 0, "w": 0, "x": 0, "y": 0, "z": 0, "'": 0},
		syllables: {"vw": 0, "wv": 0, "vk": 0, "hv": 0, "yv": 0, "iy": 0, "mz": 0, "qw": 0, "wq": 0, "qv": 0, "vq": 0, "zq": 0, "qz": 0, "qa": 0, "uy": 0, "gk": 0, "qf": 0, "fq": 0},
		prefixes: {"a": 0, "anti": 0, "ante": 0, "circum": 0, "co": 0, "com": 0, "con": 0, "contra": 0, "de": 0, "dis": 0, "em": 0, "en": 0, "epi": 0, "ex": 0, "extra": 0, "fore": 0, "homo": 0, "hyper": 0, "il": 0, "ir": 0, "im": 0, "in": 0, "infra": 0, "inter": 0, "intra": 0, "macro": 0, "magn": 0, "micro": 0, "mid": 0, "mis": 0, "mono": 0, "non": 0, "omni": 0, "para": 0, "post": 0, "pre": 0, "re": 0, "semi": 0, "sub": 0, "super": 0, "therm": 0, "trans": 0, "tri": 0, "un": 0, "uni": 0},
		roots: {"abac": 0, "academ": 0, "acanth": 0, "acar": 0, "acer": 0, "acri": 0, "acet": 0, "acid": 0, "actin": 0, "acut": 0, "aden": 0, "adip": 0, "aesth": 0, "aether": 0, "ether": 0, "agap": 0, "agri": 0, "egri": 0, "agro": 0, "ailur": 0, "alac": 0, "alcyon": 0, "alter": 0, "allel": 0, "alph": 0, "alphit": 0, "amat": 0, "amic": 0, "imic": 0, "amath": 0, "ambi": 0, "ambo": 0, "ambly": 0, "ambul": 0, "amph": 0, "amphi": 0, "ampl": 0, "amygdal": 0, "andr": 0, "anem": 0, "anim": 0, "anti": 0, "ante": 0, "anth": 0, "anthrac": 0, "anthrop": 0, "aper": 0, "aphrod": 0, "arachn": 0, "arbit": 0, "arcan": 0, "arch": 0, "arche": 0, "archi": 0, "archae": 0, "arct": 0, "ardu": 0, "aret": 0, "argent": 0, "arid": 0, "arist": 0, "arithm": 0, "arsen": 0, "arthr": 0, "arti": 0, "asin": 0, "asper": 0, "aspr": 0, "aster": 0, "astr": 0, "asthen": 0, "ather": 0, "athl": 0, "athroid": 0, "audac": 0, "auct": 0, "auri": 0, "auto": 0, "axon": 0, "bapt": 0, "bath": 0, "beat": 0, "bell": 0, "belli": 0, "bibl": 0, "blast": 0, "blenn": 0, "bomb": 0, "bore": 0, "botan": 0, "brachi": 0, "brachio": 0, "brachion": 0, "brachioni": 0, "brachy": 0, "brady": 0, "bradys": 0, "branchi": 0, "brev": 0, "bromat": 0, "bromato": 0, "broma": 0, "bromo": 0, "brom": 0, "bronch": 0, "bront": 0, "brot": 0, "bucc": 0, "bulb": 0, "bull": 0, "burs": 0, "butyr": 0, "byss": 0, "caed": 0, "caes": 0, "call": 0, "calc": 0, "cale": 0, "calv": 0, "calum": 0, "calyp": 0, "camer": 0, "camisi": 0, "camp": 0, "cant": 0, "cent": 0, "cand": 0, "cend": 0, "capt": 0, "cept": 0, "capit": 0, "cipit": 0, "capr": 0, "caps": 0, "carbon": 0, "carcer": 0, "carcin": 0, "cardi": 0, "cardin": 0, "carn": 0, "carp": 0, "cast": 0, "cata": 0, "caten": 0, "cathar": 0, "caud": 0, "caus": 0, "caust": 0, "caut": 0, "cess": 0, "celer": 0, "caen": 0, "coen": 0, "cens": 0, "centen": 0, "centesim": 0, "centr": 0, "centri": 0, "cephal": 0, "ceram": 0, "cerat": 0, "cern": 0, "cervic": 0, "ceter": 0, "chir": 0, "chelon": 0, "chlor": 0, "chondr": 0, "chore": 0, "chord": 0, "chrom": 0, "chron": 0, "chrys": 0, "cili": 0, "ciner": 0, "cing": 0, "cinct": 0, "circ": 0, "circum": 0, "cirr": 0, "clad": 0, "clam": 0, "clar": 0, "clast": 0, "claud": 0, "clud": 0, "claus": 0, "clus": 0, "clav": 0, "cleist": 0, "cleithr": 0, "clement": 0, "clin": 0, "cochl": 0, "coel": 0, "cult": 0, "coll": 0, "color": 0, "condi": 0, "contra": 0, "copi": 0, "copr": 0, "copul": 0, "cord": 0, "corac": 0, "cori": 0, "corn": 0, "coron": 0, "corpor": 0, "cortic": 0, "cosm": 0, "cosmet": 0, "cost": 0, "cotyl": 0, "cracy": 0, "crat": 0, "crani": 0, "crass": 0, "crea": 0, "cred": 0, "crepid": 0, "cresc": 0, "cribr": 0, "cric": 0, "crisp": 0, "crist": 0, "crit": 0, "crisi": 0, "cross": 0, "cruc": 0, "crur": 0, "crypt": 0, "cten": 0, "culin": 0, "culp": 0, "cune": 0, "curr": 0, "curs": 0, "curv": 0, "cuspid": 0, "cyan": 0, "cycl": 0, "cylind": 0, "cyst": 0, "dacry": 0, "dactyl": 0, "damn": 0, "demn": 0, "decim": 0, "decor": 0, "delt": 0, "dendr": 0, "dens": 0, "dent": 0, "despot": 0, "deuter": 0, "dexi": 0, "dexter": 0, "diacosi": 0, "dict": 0, "dida": 0, "digit": 0, "dipl": 0, "doct": 0, "dodec": 0, "domin": 0, "domit": 0, "dorm": 0, "dors": 0, "drach": 0, "dram": 0, "drom": 0, "dros": 0, "duct": 0, "dulc": 0, "dyna": 0, "ecclesi": 0, "ecto": 0, "eiren": 0, "electr": 0, "elem": 0, "empt": 0, "emul": 0, "enanti": 0, "encephal": 0, "endo": 0, "engy": 0, "ennea": 0, "erot": 0, "erythr": 0, "ethm": 0, "ethn": 0, "etym": 0, "extra": 0, "extrem": 0, "fact": 0, "fect": 0, "falc": 0, "fall": 0, "fallac": 0, "fals": 0, "famili": 0, "fasc": 0, "fatu": 0, "feder": 0, "felic": 0, "fell": 0, "femin": 0, "femor": 0, "fend": 0, "fens": 0, "fenestr": 0, "ferv": 0, "feroc": 0, "ferr": 0, "fing": 0, "fict": 0, "fili": 0, "find": 0, "fiss": 0, "firm": 0, "fistul": 0, "flacc": 0, "flav": 0, "flect": 0, "flex": 0, "flig": 0, "flict": 0, "flor": 0, "fluv": 0, "flux": 0, "foss": 0, "foen": 0, "foli": 0, "font": 0, "form": 0, "formic": 0, "fornic": 0, "fort": 0, "fove": 0, "frag": 0, "frang": 0, "fring": 0, "fract": 0, "frater": 0, "fratr": 0, "fric": 0, "frict": 0, "frig": 0, "front": 0, "fruct": 0, "frug": 0, "fugit": 0, "fund": 0, "fulmin": 0, "fung": 0, "funct": 0, "furt": 0, "furc": 0, "fusc": 0, "galact": 0, "gamb": 0, "gamm": 0, "gargal": 0, "gargar": 0, "gastr": 0, "geiton": 0, "gephyr": 0, "gest": 0, "geran": 0, "germ": 0, "glabr": 0, "glaci": 0, "gladi": 0, "glauc": 0, "glia": 0, "glob": 0, "glori": 0, "gloss": 0, "glot": 0, "glut": 0, "glutin": 0, "glyc": 0, "glyph": 0, "gnath": 0, "gnosc": 0, "gnit": 0, "grad": 0, "gred": 0, "gress": 0, "gramm": 0, "gran": 0, "grand": 0, "graph": 0, "grat": 0, "grav": 0, "greg": 0, "gryp": 0, "gubern": 0, "gust": 0, "gutt": 0, "guttur": 0, "gymn": 0, "gynaec": 0, "gyrin": 0, "habit": 0, "hibit": 0, "hadr": 0, "haem": 0, "hapl": 0, "haur": 0, "haust": 0, "hedo": 0, "heli": 0, "hemer": 0, "hemi": 0, "hemo": 0, "hendec": 0, "hept": 0, "heir": 0, "here": 0, "herald": 0, "herb": 0, "heres": 0, "heret": 0, "herp": 0, "heter": 0, "heur": 0, "hibern": 0, "hiem": 0, "hier": 0, "hipp": 0, "hirsut": 0, "hispid": 0, "histri": 0, "homal": 0, "home": 0, "homin": 0, "honor": 0, "horm": 0, "hort": 0, "hospit": 0, "host": 0, "hyal": 0, "hybr": 0, "hydn": 0, "hydr": 0, "hygr": 0, "hymen": 0, "hyper": 0, "hyph": 0, "hypn": 0, "hyps": 0, "hyster": 0, "iatr": 0, "ichthy": 0, "icos": 0, "imagin": 0, "inan": 0, "infra": 0, "insul": 0, "inter": 0, "intra": 0, "irasc": 0, "irat": 0, "irid": 0, "ischi": 0, "iter": 0, "itiner": 0, "ject": 0, "janu": 0, "judic": 0, "jung": 0, "junct": 0, "junior": 0, "juven": 0, "juxta": 0, "kilo": 0, "kine": 0, "cine": 0, "klept": 0, "kudo": 0, "laps": 0, "labi": 0, "labor": 0, "lacer": 0, "lacrim": 0, "lact": 0, "lamin": 0, "lamp": 0, "lapid": 0, "larg": 0, "larv": 0, "later": 0, "laud": 0, "laus": 0, "lecith": 0, "lect": 0, "lekan": 0, "leni": 0, "leon": 0, "lepsi": 0, "leuc": 0, "leuk": 0, "liber": 0, "libr": 0, "limac": 0, "limpa": 0, "line": 0, "lingu": 0, "linqu": 0, "lict": 0, "liqu": 0, "liter": 0, "lith": 0, "logy": 0, "long": 0, "loqu": 0, "locut": 0, "lumin": 0, "lysi": 0, "macer": 0, "macr": 0, "magn": 0, "magnet": 0, "mamm": 0, "mant": 0, "manu": 0, "mand": 0, "mend": 0, "mania": 0, "mascul": 0, "mater": 0, "matr": 0, "maxim": 0, "mechan": 0, "medi": 0, "midi": 0, "megal": 0, "melan": 0, "melior": 0, "meliss": 0, "mell": 0, "memor": 0, "mening": 0, "menstru": 0, "mensur": 0, "ment": 0, "merc": 0, "merg": 0, "mers": 0, "meta": 0, "meter": 0, "metr": 0, "micr": 0, "migr": 0, "milit": 0, "mill": 0, "millen": 0, "mina": 0, "minth": 0, "misc": 0, "mixt": 0, "miser": 0, "miss": 0, "moll": 0, "monil": 0, "monstra": 0, "mont": 0, "mora": 0, "mord": 0, "morph": 0, "mort": 0, "mulg": 0, "muls": 0, "multi": 0, "mund": 0, "musc": 0, "mycet": 0, "mydr": 0, "myri": 0, "myrmec": 0, "myth": 0, "narc": 0, "narr": 0, "nasc": 0, "naut": 0, "necr": 0, "nect": 0, "nemat": 0, "nemor": 0, "nephr": 0, "nerv": 0, "neur": 0, "nict": 0, "nigr": 0, "nihil": 0, "noct": 0, "nomad": 0, "nomen": 0, "nomin": 0, "nonagen": 0, "nonagesim": 0, "noth": 0, "noven": 0, "novendec": 0, "nupt": 0, "nuch": 0, "null": 0, "numer": 0, "nunci": 0, "nutri": 0, "nyct": 0, "obel": 0, "obol": 0, "ocean": 0, "ochl": 0, "octav": 0, "octogen": 0, "octogesim": 0, "octon": 0, "ocul": 0, "odont": 0, "odor": 0, "odyn": 0, "oesophag": 0, "oestr": 0, "ogdo": 0, "olecran": 0, "olig": 0, "oliv": 0, "omas": 0, "ombr": 0, "oment": 0, "omin": 0, "ommat": 0, "omni": 0, "omphal": 0, "oneir": 0, "oner": 0, "onomat": 0, "onych": 0, "onym": 0, "opac": 0, "oper": 0, "ophi": 0, "ophthalm": 0, "opisth": 0, "opsi": 0, "opson": 0, "optim": 0, "orch": 0, "orches": 0, "ordin": 0, "oreg": 0, "organ": 0, "ornith": 0, "orphan": 0, "orth": 0, "oryz": 0, "oscill": 0, "oste": 0, "osti": 0, "ostrac": 0, "ostre": 0, "over": 0, "pach": 0, "pact": 0, "paed": 0, "pagin": 0, "palae": 0, "pale": 0, "palin": 0, "palim": 0, "pall": 0, "palli": 0, "palm": 0, "palp": 0, "palustr": 0, "pand": 0, "pans": 0, "para": 0, "parc": 0, "pars": 0, "pariet": 0, "part": 0, "parthen": 0, "parv": 0, "pasc": 0, "past": 0, "pass": 0, "passer": 0, "path": 0, "pater": 0, "patr": 0, "pati": 0, "pauc": 0, "pecc": 0, "pect": 0, "pector": 0, "pecu": 0, "pejor": 0, "pelag": 0, "pelarg": 0, "pell": 0, "puls": 0, "pemp": 0, "pomp": 0, "poen": 0, "puni": 0, "pend": 0, "pens": 0, "penia": 0, "penn": 0, "pinn": 0, "pent": 0, "pentacosi": 0, "pentecont": 0, "pentecost": 0, "peper": 0, "pepon": 0, "pept": 0, "peran": 0, "perdic": 0, "peri": 0, "persic": 0, "pessim": 0, "petr": 0, "phae": 0, "phag": 0, "phalang": 0, "phalar": 0, "pharmac": 0, "phan": 0, "phen": 0, "pheb": 0, "phob": 0, "pher": 0, "phor": 0, "pheug": 0, "phyg": 0, "phil": 0, "phile": 0, "phim": 0, "phleb": 0, "phleg": 0, "phlog": 0, "phloe": 0, "phon": 0, "phos": 0, "phot": 0, "phrag": 0, "phren": 0, "phron": 0, "phryn": 0, "phtheg": 0, "phyc": 0, "phyl": 0, "phyll": 0, "phys": 0, "physi": 0, "physalid": 0, "phyt": 0, "piez": 0, "ping": 0, "pict": 0, "pingu": 0, "pisc": 0, "pithec": 0, "plac": 0, "plea": 0, "plag": 0, "plan": 0, "plang": 0, "planct": 0, "plas": 0, "plat": 0, "plaud": 0, "plod": 0, "plaus": 0, "plos": 0, "plet": 0, "pleb": 0, "plec": 0, "ploc": 0, "plect": 0, "plex": 0, "pleg": 0, "plen": 0, "plesi": 0, "pleth": 0, "pleur": 0, "plic": 0, "plinth": 0, "plor": 0, "plum": 0, "plumb": 0, "plur": 0, "plus": 0, "plurim": 0, "plut": 0, "pnig": 0, "pnict": 0, "pogon": 0, "poie": 0, "pole": 0, "polem": 0, "poli": 0, "poll": 0, "pollic": 0, "pollin": 0, "poly": 0, "pomph": 0, "posit": 0, "ponder": 0, "pont": 0, "popul": 0, "porc": 0, "porn": 0, "porphyr": 0, "port": 0, "portion": 0, "post": 0, "potam": 0, "prag": 0, "pras": 0, "prat": 0, "prav": 0, "prec": 0, "pred": 0, "prehend": 0, "prend": 0, "prehens": 0, "prem": 0, "press": 0, "presby": 0, "preter": 0, "preti": 0, "priap": 0, "prim": 0, "prior": 0, "prism": 0, "priv": 0, "prob": 0, "proct": 0, "prodig": 0, "propri": 0, "pros": 0, "prosop": 0, "prot": 0, "proter": 0, "proxim": 0, "prun": 0, "psall": 0, "psamath": 0, "psamm": 0, "pseph": 0, "pseud": 0, "psil": 0, "psithyr": 0, "psittac": 0, "psoph": 0, "psor": 0, "psych": 0, "psychr": 0, "pter": 0, "pterid": 0, "ptoch": 0, "ptych": 0, "public": 0, "pude": 0, "pugn": 0, "pulchr": 0, "pulmon": 0, "pulver": 0, "pung": 0, "punct": 0, "purg": 0, "purpur": 0, "pyel": 0, "pyramid": 0, "pyrrh": 0, "quadr": 0, "quadragen": 0, "quadragesim": 0, "quart": 0, "quasi": 0, "quatern": 0, "quati": 0, "cuti": 0, "quass": 0, "cuss": 0, "quer": 0, "quir": 0, "quesit": 0, "quisit": 0, "quin": 0, "quindecim": 0, "quinden": 0, "quinque": 0, "quint": 0, "quot": 0, "radi": 0, "radic": 0, "ranc": 0, "raph": 0, "rauc": 0, "rect": 0, "regul": 0, "rept": 0, "resid": 0, "retro": 0, "rhabd": 0, "rhach": 0, "rach": 0, "rhag": 0, "rheg": 0, "rhetin": 0, "rhig": 0, "rhin": 0, "rhiz": 0, "rhod": 0, "rhomb": 0, "rhynch": 0, "robor": 0, "rostr": 0, "ruber": 0, "rubr": 0, "rudi": 0, "rumin": 0, "rump": 0, "rupt": 0, "sacc": 0, "sacchar": 0, "sacr": 0, "secr": 0, "sagac": 0, "sagitt": 0, "sali": 0, "sili": 0, "salt": 0, "salic": 0, "salping": 0, "salu": 0, "salv": 0, "sanc": 0, "sanguin": 0, "sapi": 0, "sipi": 0, "sapon": 0, "sapphir": 0, "sapr": 0, "sarc": 0, "sati": 0, "saur": 0, "scab": 0, "scal": 0, "scalen": 0, "scand": 0, "scend": 0, "scans": 0, "scens": 0, "scandal": 0, "scap": 0, "scaph": 0, "scat": 0, "sced": 0, "scel": 0, "scen": 0, "scept": 0, "scop": 0, "schem": 0, "schid": 0, "scind": 0, "sciss": 0, "scler": 0, "scolec": 0, "scoli": 0, "scombr": 0, "scot": 0, "scrib": 0, "script": 0, "scrupl": 0, "sculp": 0, "scut": 0, "scyph": 0, "sect": 0, "sess": 0, "sedec": 0, "seget": 0, "selen": 0, "sell": 0, "sema": 0, "semi": 0, "semin": 0, "senti": 0, "sens": 0, "sept": 0, "septen": 0, "septim": 0, "septuagen": 0, "septuagesim": 0, "septuagint": 0, "sequ": 0, "secut": 0, "serp": 0, "serr": 0, "serv": 0, "sesqui": 0, "sever": 0, "sexagen": 0, "sexagesim": 0, "sext": 0, "sibil": 0, "sicc": 0, "sicy": 0, "sider": 0, "sigm": 0, "sign": 0, "silv": 0, "simi": 0, "simil": 0, "simul": 0, "sinap": 0, "singul": 0, "sinistr": 0, "sinu": 0, "sinus": 0, "siop": 0, "siph": 0, "sist": 0, "smaragd": 0, "smil": 0, "soci": 0, "sole": 0, "solen": 0, "solv": 0, "solut": 0, "soma": 0, "somn": 0, "somni": 0, "soph": 0, "sopor": 0, "sorb": 0, "sorpt": 0, "sord": 0, "soror": 0, "spad": 0, "spars": 0, "spers": 0, "spath": 0, "spati": 0, "spec": 0, "spic": 0, "spect": 0, "speir": 0, "spor": 0, "spele": 0, "spelyng": 0, "spend": 0, "spond": 0, "sper": 0, "sperm": 0, "sphal": 0, "sphen": 0, "spher": 0, "sphing": 0, "sphinct": 0, "sphondyl": 0, "sphrag": 0, "sphyg": 0, "spin": 0, "spir": 0, "splen": 0, "spons": 0, "spondyl": 0, "sput": 0, "squal": 0, "squam": 0, "squarros": 0, "stagn": 0, "stala": 0, "stann": 0, "staphyl": 0, "stasi": 0, "statu": 0, "stitu": 0, "steat": 0, "steg": 0, "stell": 0, "stol": 0, "sten": 0, "stere": 0, "stern": 0, "strat": 0, "steth": 0, "sthen": 0, "stich": 0, "stig": 0, "still": 0, "stimul": 0, "stin": 0, "stingu": 0, "stinct": 0, "stoch": 0, "stom": 0, "stor": 0, "streper": 0, "streph": 0, "stroph": 0, "strob": 0, "stromb": 0, "strept": 0, "strig": 0, "strigos": 0, "string": 0, "strict": 0, "stru": 0, "struct": 0, "stud": 0, "stup": 0, "styg": 0, "styl": 0, "suad": 0, "suas": 0, "suav": 0, "subter": 0, "sucr": 0, "sulc": 0, "sumpt": 0, "super": 0, "supin": 0, "supra": 0, "surd": 0, "surg": 0, "sybar": 0, "syring": 0, "tach": 0, "taeni": 0, "tang": 0, "ting": 0, "tact": 0, "tapet": 0, "tarac": 0, "tard": 0, "tars": 0, "taur": 0, "techn": 0, "tecn": 0, "tect": 0, "tele": 0, "temn": 0, "tempor": 0, "tent": 0, "tend": 0, "tens": 0, "tenu": 0, "trit": 0, "tere": 0, "teret": 0, "terg": 0, "ters": 0, "termin": 0, "tern": 0, "terr": 0, "terti": 0, "test": 0, "tetart": 0, "tetr": 0, "teuch": 0, "text": 0, "thalam": 0, "thalass": 0, "than": 0, "thus": 0, "thea": 0, "thel": 0, "theori": 0, "ther": 0, "therap": 0, "therm": 0, "thig": 0, "thorac": 0, "thym": 0, "thyr": 0, "thyre": 0, "tinct": 0, "torn": 0, "torpe": 0, "torqu": 0, "tort": 0, "trab": 0, "trach": 0, "trag": 0, "trah": 0, "tract": 0, "trans": 0, "tran": 0, "trapez": 0, "traum": 0, "trecent": 0, "tredec": 0, "treiskaidek": 0, "trem": 0, "trema": 0, "trepid": 0, "trib": 0, "tribu": 0, "tricen": 0, "tricesim": 0, "trigesim": 0, "trich": 0, "trin": 0, "tritic": 0, "troch": 0, "trop": 0, "troph": 0, "truc": 0, "trud": 0, "trus": 0, "trunc": 0, "tryp": 0, "turb": 0, "tuss": 0, "tympan": 0, "typh": 0, "tyrann": 0, "uber": 0, "uligin": 0, "ultim": 0, "ultra": 0, "umbilic": 0, "umbr": 0, "unci": 0, "undecim": 0, "unden": 0, "ungu": 0, "uran": 0, "uxor": 0, "vacc": 0, "vacil": 0, "vari": 0, "varic": 0, "vect": 0, "vell": 0, "vuls": 0, "veloc": 0, "vent": 0, "vend": 0, "vener": 0, "ventr": 0, "verb": 0, "verber": 0, "verm": 0, "vern": 0, "vers": 0, "vert": 0, "vesic": 0, "vesper": 0, "vest": 0, "vestig": 0, "veter": 0, "vicen": 0, "vigen": 0, "vicesim": 0, "vigesim": 0, "vigil": 0, "vill": 0, "vinc": 0, "vict": 0, "visc": 0, "viscer": 0, "vitell": 0, "viti": 0, "vitr": 0, "volv": 0, "volut": 0, "vorac": 0, "vulg": 0, "vulner": 0, "vulp": 0, "xanth": 0, "xiph": 0, "zephyr": 0, "zete": 0, "zizyph": 0, "zym": 0},
		suffixes: {"able": 0, "ac": 0, "acity": 0, "ocity": 0, "ade": 0, "age": 0, "aholic": 0, "oholic": 0, "al": 0, "algia": 0, "an": 0, "ian": 0, "ance": 0, "ant": 0, "ar": 0, "ard": 0, "arian": 0, "arium": 0, "orium": 0, "ary": 0, "ate": 0, "ation": 0, "ative": 0, "cracy": 0, "crat": 0, "cule": 0, "cy": 0, "cycle": 0, "dom": 0, "dox": 0, "ed": 0, "ee": 0, "eer": 0, "emia": 0, "en": 0, "ence": 0, "ency": 0, "ent": 0, "er": 0, "ern": 0, "ese": 0, "esque": 0, "ess": 0, "est": 0, "etic": 0, "ette": 0, "ful": 0, "fy": 0, "gam": 0, "gamy": 0, "gon": 0, "gonic": 0, "hood": 0, "ian": 0, "iasis": 0, "iatric": 0, "ible": 0, "ic": 0, "ical": 0, "ile": 0, "ily": 0, "ine": 0, "ing": 0, "ion": 0, "ious": 0, "ish": 0, "ism": 0, "ist": 0, "ite": 0, "itis": 0, "ity": 0, "ive": 0, "ization": 0, "ize": 0, "less": 0, "let": 0, "ling": 0, "loger": 0, "logist": 0, "log": 0, "ly": 0, "ment": 0, "ness": 0, "oid": 0, "oma": 0, "onym": 0, "opia": 0, "opsy": 0, "or": 0, "ory": 0, "osis": 0, "ostomy": 0, "otomy": 0, "ous": 0, "pathy": 0, "phile": 0, "phobia": 0, "phone": 0, "phyte": 0, "plegia": 0, "plegic": 0, "pnea": 0, "scopy": 0, "scope": 0, "scribe": 0, "script": 0, "sect": 0, "ship": 0, "sion": 0, "some": 0, "sophy": 0, "sophic": 0, "tion": 0, "tome": 0, "tomy": 0, "trophy": 0, "tude": 0, "ty": 0, "ular": 0, "uous": 0, "ure": 0, "ward": 0, "ware": 0, "wise": 0, "y": 0},
		//endings: {"s": 0, "es": 0, "ed": 0, "ing": 0},
		//apostrof_s: 0,
		short_prefix: 0,
		short_roots: 0,
		short_suffix: 0,
		long_prefix: 0,
		long_roots: 0,
		long_suffix: 0,
		duoble_letter: 0,
		garbage: 0
	};
};

var wordAnalize = function(word) {
	if (word.replace(/^.*[^euioya]{4,}.*$/, "") == "" ||
		word.replace(/^.*[euioya]{4,}.*$/, "") == "" ||
		word.replace(/^(.)\1.*$/, "") == "" ||
		word.replace(/^.*(.)\1\1.*$/, "") == "" ||
		word.replace(/^.*'[a-rt-z']{1,}$/, "") == "" ||
		word.length > 16) {
		analizator.garbage++;
	} else {
		// for (var key in analizator.symbols) {
		// 	if (word.indexOf(key) !== -1) {
		// 		analizator.symbols[key]++;
		// 	}
		// }

		if (word.replace(/^.*(.)\1.*/, "") === "") {
			analizator.duoble_letter++;
		}

		for (var key in analizator.syllables) {
			if (word.indexOf(key) !== -1) {
				analizator.syllables[key]++;
			}
		}

		// if (word.length <= 20) {
		// 	analizator.lengths[word.length + ""]++;
		// } else {
		// 	analizator.lengths["0"]++;
		// }

		for (var prefix in analizator.prefixes) {
			if (word.replace(new RegExp("^" + prefix + ".{1,}$", ""), "") === "") {
				analizator.prefixes[prefix]++;

				if (prefix.length > 2) {
					analizator.long_prefix++;
				} else {
					analizator.short_prefix++;
				}
			}
		}

		for (var wordRoot in analizator.roots) {
			if (word.replace(new RegExp("^.*" + wordRoot + ".*$", ""), "") === "") {
				analizator.roots[wordRoot]++;

				if (wordRoot.length > 4) {
					analizator.long_roots++;
				} else {
					analizator.short_roots++;
				}
			}
		}

		for (var suffix in analizator.suffixes) {
			if (word.replace(new RegExp("^.{1,}" + suffix + "$", ""), "") === "") {
				analizator.suffixes[suffix]++;

				if (suffix.length > 2) {
					analizator.long_suffix++;
				} else {
					analizator.short_suffix++;
				}
			}
		}

		// if (word.replace(/^.{1,}s$/, "") === "" && word[word.length - 2] !== "e" && word[word.length - 2] !== "'") {
		// 	analizator.endings["s"]++;
		// }
		// if (word.replace(/^.{1,}es$/, "") === "") {
		// 	analizator.endings["es"]++;
		// }
		// if (word.replace(/^.{1,}ed$/, "") === "") {
		// 	analizator.endings["ed"]++;
		// }
		// if (word.replace(/^.{1,}ing$/, "") === "") {
		// 	analizator.endings["ing"]++;
		// }

		// if (word.replace(/^.{1,}'s$/, "") === "") {
		// 	analizator.apostrof_s++;
		// }
	}
};

var analizate = function(file) {
	var fs = require("fs"),
	resultText = "";
	text = fs.readFileSync("C:\\Users\\рр\\Desktop\\Конкурс\\" + file + ".txt", "utf8"),
	words = text.toLowerCase().replace(/\r/g, "").split("\n"),
	countWords = words.length,
	i = 0;

	sr[file] = {};

	initAnalizator();

	while (i < countWords) {
		wordAnalize(words[i]);
		i++;

		if (i % 10000 === 0) {
			console.log(i, words[i]);
		}
	}

	sr[file] = clone(analizator);

	for (var key in analizator) {
		resultText += key + ":\n";
		if (key !== "garbage") {
			if (Object.keys(analizator[key]).length > 1) {
				for (var subKey in analizator[key]) {
					resultText += "\t" + subKey + "\t\t = \t" + (analizator[key][subKey] * 100 / (countWords - analizator.garbage)).toFixed(3) + "% / " +
					(analizator[key][subKey] * 100 / countWords).toFixed(3) + "%\n"
				}
			} else {
				resultText += "\t" + (analizator[key] * 100 / (countWords - analizator.garbage)).toFixed(3) + "% / " +
				(analizator[key] * 100 / countWords).toFixed(3) + "%\n";
			}
		} else {
			resultText += "\t" + (analizator.garbage * 100 / countWords).toFixed(3) + "%\n";
		}
	}

	fs.writeFileSync("C:\\Users\\рр\\Desktop\\Конкурс\\" + file + "Result.txt", resultText);
};

//analizate("words");
//analizate("falseWords");

//getSr();

buildTrie();
replacer();