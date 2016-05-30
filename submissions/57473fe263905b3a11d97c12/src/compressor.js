const zlib = require('zlib');
const fs = require('fs');
const input = fs.createReadStream('data.txt');
const out = fs.createWriteStream('data.gz');
var gzip = zlib.createGzip();
input.pipe(gzip).pipe(out)
