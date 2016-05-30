var fs = require('fs');
var zlib = require('zlib');

var mod = require('./solution.js');
var data = fs.readFileSync('data.gz'); // optional
data = zlib.gunzipSync(data); // optional
if (mod.init) {
    mod.init(data);
}

console.log('a:', mod.test('a'));
console.log('zzz:', mod.test('zzzz'));
console.log('imeritian:', mod.test('imeritian'));
console.log("fetta's:", mod.test("fetta's"));
console.log("fractivity's:", mod.test("fractivity's"));
console.log("gownmen:", mod.test("gownmen"));

console.log("aba:", mod.test("aba"));
console.log("abats:", mod.test("abats"));
console.log("oqr:", mod.test("oqr"));
console.log("aaj:", mod.test("aaj"));
console.log("abaddon:", mod.test("abaddon"));

