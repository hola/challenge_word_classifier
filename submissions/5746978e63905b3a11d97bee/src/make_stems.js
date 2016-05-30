var fs = require('fs');
var stemmer = require('./porter2.js')

var file = fs.readFileSync("words_lc.txt", "ascii")
var words = file.split("\n")
console.log(words.length)

stems = new Set()
for (let w of words) {
    if (w.length > 15) continue
    if (w.match(/[^aeuioy']{4}/)) continue
    if (w.match(/'$|'[^s]|'s./)) continue
    if (!w.match(/[aeuio]/)) continue
    w = w.replace(/^un/,"")
    stem = stemmer.stem(w)
    //stem = stem.replace(/^un/,"")
    stems.add(stem)
}
console.log(stems.size)

var sstream = fs.createWriteStream('stems.txt')
for (let s of stems) {
    sstream.write(s + "\n")
}
sstream.end()
