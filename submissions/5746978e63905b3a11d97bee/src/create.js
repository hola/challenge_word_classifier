var fs = require('fs');
var stemmer = require('./porter2.js')

var file = fs.readFileSync("stems.txt", "ascii")
var stems = file.split("\n")
//console.log(stems.length)

murmurhash = require('murmurhash')
b = Buffer.alloc(64581)
for (s of stems) {
    h = murmurhash.v3(s) % (b.length * 8);
    b[Math.floor(h/8)] |= 1 << (h % 8);
}

//console.log(b)

var wstream = fs.createWriteStream('data_orig')
wstream.write(b)
wstream.end()
