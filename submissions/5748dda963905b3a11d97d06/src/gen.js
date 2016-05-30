'use strict'; 
const fs = require('fs');
const vm = require('vm');
const zlib = require('zlib');

const filename = 'solution.min.js'
let text = fs.readFileSync(filename, 'utf8');
let script = new vm.Script(text, {filename: filename});
let m = {exports: {}};
let context = vm.createContext({
    module: m,
    exports: m.exports,
    console,
    Buffer,
});
script.runInContext(context);

let data = JSON.parse(fs.readFileSync('words.js'));

var bloom = new Uint8Array(((context.BLOOMLEN+7)/8)|0);

for(var i=0; i<data.prefix.length; i++){
    var prefix = data.prefix[i];
        prefix = context.prebloom(prefix);
        if(prefix===false) continue;
        var pos = context.hashFnv32a(prefix.substring(0,6),context.SEED1);
        bloom[(pos/8)|0] |= (1<<(pos%8));
        pos = context.hashFnv32a(prefix.substring(0,9),context.SEED2);
        bloom[(pos/8)|0] |= (1<<(pos%8));
}

var uglified = text;//UglifyJS.minify(text, {fromString: true});

var gzipped = zlib.gzipSync(Buffer.concat([new Buffer(bloom), new Buffer(uglified,"binary")]) );
fs.writeFileSync('data.gz', gzipped);

fs.writeFileSync('solution.js','exports.init=d=>eval(""+d.slice('+((context.BLOOMLEN+7)/8|0)+'))');
