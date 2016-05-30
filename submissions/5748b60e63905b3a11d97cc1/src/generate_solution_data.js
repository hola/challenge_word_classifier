"use strict";

var bf = require('./bloom_filter')
var fs = require('fs');
var zlib = require('zlib');

var dict = [];
var words_dict_file = 'words.txt';
var error_rate = 0.39;
var dataGz = "data.gz";
var dataBin = 'words.bin';

function readDictBloom() {
    var size = bf.calculateSize(dict.length, error_rate)
    var hashes = bf.calculateNumberOfHashes(size, dict.length)

    var f = new bf.Bloom(size, hashes);

    console.log("Bloom Filter probability of false positive (p): " + error_rate);
    console.log("Bloom Filter size (m): " + size);
    console.log("Bloom Filter number of hashes (k): " + hashes);

    for (var i = 0; i < dict.length; i++) {
        f.add(dict[i]);
    }

    var buffer = f.bitfield.toBuffer();

    console.log("Bloom Filter buffer length: " + buffer.length);

    var fd = fs.openSync(dataBin, 'w');

    fs.write(fd, buffer, 0, buffer.length, 0, function(err, written) {

        if (err) {
            return console.log(err);
        }

        const gzip = zlib.createGzip({
            level: 9,
            memLevel: 9
        });
        const inp = fs.createReadStream(dataBin);
        const out = fs.createWriteStream(dataGz);

        inp.pipe(gzip).pipe(out);

        out.on('finish', function() {
            var stats = fs.statSync(dataGz);
            var fileSizeInBytes = stats["size"];
            console.log("Finished! data.gz size in bytes: " + fileSizeInBytes + " => " + (fileSizeInBytes / 1024) + " kb");
        });
    });
}

var lineReader = require('readline').createInterface({
    input: fs.createReadStream(words_dict_file)
});

lineReader.on('line', function(line) {
    dict.push(line);
});

lineReader.on('close', readDictBloom);