var bits = 530565;
var bloom = new BF({bits: bits, salts: ['poiuytre', 'asdfghjkl', 'mnbvcxz']});

var fs = require('fs'),
    prefixes = fs.readFileSync('./tmp/prefixes6', 'utf8').split("\n");

for (var i in prefixes) {
    bloom.add(prefixes[i].split("\t")[0]);
}

var s = '';
for (var i = 0; i < bloom.BV.bits; i++ ) {
    s += bloom.BV.bitset(i) ? '1' : '0';
}

var b = [];
for (var i = 0; i <= s.length; i = i + 8) {
    b.push(parseInt(s.substr(i, 8), 2));
}

var buff = new Buffer(b);
fs.writeFileSync('bloom.filter', buff, 'binary');