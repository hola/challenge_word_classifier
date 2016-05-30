'use strict'
var fs = require('fs')
var rl = require('readline')
var argv = process.argv

if (argv.length != 4) {
	console.error('Invalid arguments count')
	process.exit(1)
}

var mask27 = (1<<27) - 1

function multiply_uint32(a, b) {
    var ah = (a >> 16) & 0xffff, al = a & 0xffff;
    var bh = (b >> 16) & 0xffff, bl = b & 0xffff;
    var high = ((ah * bl) + (al * bh)) & 0xffff;
    return (((high << 16)>>>0) + (al * bl)) & mask27;
}

function hash(w) {
	var h = 2166136261
	for(let c of w){
		h = multiply_uint32(h, 16777619)
		h = h ^ c.charCodeAt()
	}
	h = (h>>27) ^ (h & mask27)
	return h
}

function sortNumber(a,b){return a-b}

var stoplist = new Set(['after','press', 'forest'])

var filename = argv[2]
var output = argv[3]

var prefixes = /^(aero|after|ante|anti|aqua|auto|bio|bi|counter|co|de|dis|electro|em|epi|extra|fore|geo|homo|hydro|hyper|hypo|infra|intra|inter|iso|il|im|in|ir|kilo|macro|magneto|mega|meta|micro|mid|milli|mini|mis|mono|multi|neuro|non|omni|out|over|oxy|para|photo|poly|post|pre|pro|pseudo|psycho|pyro|radio|retro|re|quadr(a|i)?|semi|sept(i|o)?|socio|stereo|sub|super|tele|tetra|thermo|trans|tri|ultra|under|uni|un)/

var suffixes = [
	{m:/(ier|ied|iest|ily|iful|ihood|iless|iness|ial)$/,r:'y'},
	{m:/fiable$/,r:'fy'},
	{m:/(er|ed|est|ing|ist|ism|ity|ise|ize|[^cg]able|ment|esque)$/,r:'e'},
	{m:/bly$/,r:'ble'},
	{m:/(er|ed|est|ing|ist|ism|ity|ise|ize|able|like|ment|ship|ly|ful|hood|less|ness|al|dom|esque)$/,r:''},
	{m:/([bcdgklmnprstz])\1(er|ed|est)$/,r:'$1'},
	{m:/bility$/,r:'ble'},
	{m:/logist$/,r:'logy'},
	{m:/(graphic|grapher|graphist)$/,r:'graphy'},
	{m:/istic$/,r:'ist'},
	{m:/itic$/,r:'ite'},
	{m:/otic$/,r:'ot'},
	{m:/logic$/,r:'logy'},
	{m:/metry$/,r:'meter'},
	{m:/(nce|ncy)$/,r:'nt'},
	{m:/ical$/,r:'ic'},
	{m:/ional$/,r:'ion'},
	{m:/ification$/,r:'ify'},
	{m:/ization$/,r:'ize'},
	{m:/(ction|ctor)$/,r:'ct'},
	{m:/rtion$/,r:'rt'},
	{m:/(ation|ator)$/,r:'ate'},
	{m:/ive$/,r:'ion'},
	{m:/an$/,r:'a'},
	{m:/onian$/,r:'on'}
]

var original = new Set()
var set1 = new Set()
var set2 = new Set()

try {
	fs.accessSync(filename, fs.R_OK)
	var reader = rl.createInterface({
		input: fs.createReadStream(filename)
	})

	reader.on('line', function(line) {
		original.add(line.toLowerCase())
	})
	.on('close', function() {
		console.log('Total read words: ' + original.size)

		for(let w of original) {
			if (w.substr(-2, 2) === "'s") {
				if (original.has(w.slice(0, -2))) {
					original.delete(w)
				}
			}
		}
		console.log('Total words after eliminating \'s: ' + original.size)

		for(let w of original) {
			des(w)
		}
		console.log('Total words after depluralization: ' + set1.size)

		for(let w of set1) {
			set2.add(pref(w))
		}
		console.log('Total words after unprefixing: ' + set2.size)
		set1.clear()

		for(let w of set2) {
			set1.add(suf(w))
		}
		console.log('Total word after unsuffixing: ' + set1.size)
		set2.clear()

		var sorted = [...set1]
		sorted.sort()

		var hashes = new Set()
		var collisions = new Set()
		for(let w of sorted) {
			var h = hash(w)
			if (hashes.has(h)) {
				collisions.add(h + '\t' + w)
			} else {
				hashes.add(h)
			}
		}

		console.log('Total hash sums: ' + hashes.size)
		console.log('Total collisions: ' + collisions.size * 2)
		
		sorted = [...hashes]
		sorted.sort(sortNumber)

		var file = fs.openSync(output, 'w')
		var buffer = Buffer.alloc(1<<16), p = 0
		for(var h = 0, previous = 0; h < sorted.length; h++, p++) {
			var diff = sorted[h] - previous
			previous = sorted[h]
			buffer.writeUInt8((diff & 0xff00)>>8, p*2);
			buffer.writeUInt8(diff & 0xff, p*2+1);
			if(p == buffer.length/2 - 1 || h == sorted.length - 1) {
				fs.writeSync(file, buffer, 0, (p+1)*2)
				buffer.fill(0)
				p = -1
			}
		}

		fs.closeSync(file)

	})
} catch(ex) {
	console.error('File does not exist or access restricted')
	process.exit(1)
}

// DEPLURALIZATION
function des(p) {
	var a = [{m:/hes$/,e:'he',c:'h'},{m:/ses$/,e:'se',c:'s'},{m:/xes$/,e:'xe',c:'x'},{m:/zes$/,e:'ze',c:'z'},{m:/ies$/,e:'y'},{m:/es$/,e:'e'},{m:/([^s])s$/,e:'$1'}]
	function r(re, w, e) {
		if (re.test(w)) {
			var i = w.replace(re, e)
			if (original.has(i) || original.has(pref(i))) {
				set1.add(i)
				return !0
			}
		}
		return !1
	}
	for(var q of a) {
		if (r(q.m,p,q.e))return
		if (r(q.m,p,q.c))return
	}
	set1.add(p)
}

function pref(w) {
	if (stoplist.has(w)) return w
	if (prefixes.test(w)) {
		var i = w.replace(prefixes, '')
		if (set1.has(i)) {
			return pref(i)
		}
	}
	return w
}

function suf(w) {
	if (stoplist.has(w)) return w
	for(var s of suffixes) {
		if (s.m.test(w)) {
			var i = w.replace(s.m, s.r)
			if (set2.has(i)) {
				return suf(i)
			}
		}
	}
	return w
}


