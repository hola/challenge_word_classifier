const zlib = require('zlib');
const gzip = zlib.createGzip();
const fs = require('fs');
const inp = fs.createReadStream('./filters/filter.txt');
const out = fs.createWriteStream('./filters/filter.txt.gz');

inp.pipe(gzip).pipe(out);