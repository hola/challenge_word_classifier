const fs = require('fs');
const bloom = require('./bloom');
const solution = require('./solution/solution');

let buffer = new Buffer(64000);
buffer.fill(0);

fs.readFile('./new-dict.txt', 'utf-8', function(err, data) {
    var words = data.split('\n'),
        aggregator = {},
        hashes = {};
    words.forEach(function(word) {
        let k = bloom.packToBuffer(buffer, solution.ly, word);
        hashes[k] = 1;
    });
    fs.writeFile('./solution/data', buffer, 'binary');

    Object.keys(hashes).forEach(h => {
        if (h < 100000) {
            aggregator['0'] = (aggregator['0'] || 0) + 1;
        } else
        if (h < 200000) {
            aggregator['1'] = (aggregator['1'] || 0) + 1;
        } else
        if (h < 300000) {
            aggregator['2'] = (aggregator['2'] || 0) + 1;
        } else
        if (h < 400000) {
            aggregator['3'] = (aggregator['3'] || 0) + 1;
        } else
        if (h < 500000) {
            aggregator['4'] = (aggregator['4'] || 0) + 1;
        } else
        if (h < 600000) {
            aggregator['5'] = (aggregator['5'] || 0) + 1;
        }
    });

    Object.keys(aggregator).sort().forEach(key => console.log(key + ': ' + aggregator[key]));
});