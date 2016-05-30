const readline = require('readline');
const fs = require('fs');
const zlib = require('zlib');
const util = require('util');
const testcase = require('./testcase');

function normalize(word) {
    return word.toLocaleLowerCase().replace(/\'[\w]{0,2}$/, '').replace(/[^a-z]/, '');
}

function DictionaryTree() {
    this.reset();
};

DictionaryTree.prototype.reset = function() {
    this.indents = [];
    this.data = [];
};

DictionaryTree.prototype.has = function(word) {
    var length = word.length, nodes = this.data;
    for(var i = 0, len = word.length; i < len; i++) {
        var char = word.charAt(i);
        for(var n = 0, nlen = nodes.length; n < nlen; n++) {
            var node = nodes[n];
            if(node[0] == char) {
                if(node[2] == length - 1) return true;
                nodes = node[1];
                break;
            }
        }
    }
    return false;
};

DictionaryTree.prototype.parse = function(str) {
    this.reset();
    var word = '', indent = '';
    for(var i = 0, len = str.length; i < len; i++) {
        var char = str.charAt(i);
        if(char.match(/[0-9]+/)) {
            if(indent === '') this.pushWord(word);
            indent += char;
        } else {
            if(indent.length) {
                indent = parseInt(indent);
                word = word.substr(0, indent);
                indent = '';
            }
            word += char;
        }
    }
    this.pushWord(word);
};

DictionaryTree.prototype._pushLetter = function(letter, prefix, indent) {
    var currentData = this.data;
    if(prefix.length > 0) {
        var prefixLetters = prefix.split('');
        for(var i = 0, len = prefixLetters.length; i < len; i++) {
            var prefixLetter = prefixLetters[i];
            for(var d = 0, dLen = currentData.length; d < dLen; d++) {
                if(currentData[d][0] == prefixLetter) {
                    currentData = currentData[d][1];
                    break;
                }
            }
        }
    }
    for(var d = 0, dLen = currentData.length; d < dLen; d++) {
        if(currentData[d][0] == letter) return;
    }
    if(currentData[0] == letter) return;
    currentData.push([letter, [], indent]);
};

DictionaryTree.prototype.pushWord = function(word) {
    for(var i = 0, len = word.length; i < len; i++) {
        this._pushLetter(word.charAt(i), word.substr(0, i), i);
    }
};

DictionaryTree.prototype._format = function(nodes) {
    var result = '';
    indents = this.indents.length ? this.indents : [];

    if(nodes.length === 0) {
        result += this.indents.length ? indents.pop() : '0';
    }

    for(var i = 0, len = nodes.length; i < len; i++) {
        var node = nodes[i];
        result += node[0];

        if(node[1].length > 0) {
            if(node[1].length > 1) {
                for(var c = 0, len2 = node[1].length - 1; c < len2; c++) {
                    this.indents.push(node[2] + 1);
                }
            }
            result += this._format(node[1]);
        } else {
            result += this.indents.length ? this.indents.pop() : '0';
        }

    }

    return result;
};

DictionaryTree.prototype.format = function() {
    this.indents = [];
    return this._format(this.data);
};

function DictionaryStats(options) {
    if(!options.hasOwnProperty('statsFile')) {
        options.statsFile = 'stats.csv';
    }
    this.options = options;
    this.data = {};
    this.stats = {};
    this.sorted;
}

DictionaryStats.prototype.create = function() {
    var data = Object.create(this.data);

    var counter = 0;
    for(var prefix in data) {
        var keys = Object.keys(data[prefix]);

        for(var i = 0, len = keys.length; i < len; i++) {
            var key1 = keys[i];
            for(var k = 0, len2 = keys.length; k < len2; k++) {
                var key2 = keys[k];
                if(key1 == key2) continue;
                if(key1.substr(0, key2.length) == key2) {
                    delete data[prefix][key2];
                } else if(key2.substr(0, key1.length) == key1) {
                    data[prefix][key2] += 1;
                }
            }
            if(++counter % 10000 == 0) console.log(counter + ' words');
        }
    }

    if(counter % 10000 != 0) console.log(counter + ' words');

    this.stats = data;
};

DictionaryStats.prototype.sort = function() {
    if(!this.sorted) {
        var tmp = [];

        for(var prefix in this.stats) {
            for(var key in this.stats[prefix]) {
                var value = parseInt(this.stats[prefix][key]);
                if(isNaN(value)) value = 0;
                tmp.push([key, value, value / key.length]);
            }
        }

        this.sorted = tmp.sort((item1, item2) => {
            if(item2[2] === item1[2]) {
                if(item2[1] === item1[1]) {
                    return item1[0].length - item2[0].length;
                }
                return item2[1] - item1[1];
            } else {
                return item2[2] - item1[2];
            }
        });
    }
    
    return this.sorted;
};

DictionaryStats.prototype.words = function() {
    return this.sort().map((item) => item[0]);
};

DictionaryStats.prototype.load = function() {
    return new Promise((resolve, reject) => {
        fs.readFile(this.options.statsFile, (err, data) => {
            if(err) return reject();
            this.sorted = data.toString().split("\n").map((line) => line.split(','));
            resolve(this.sorted);
        });
    });
};

DictionaryStats.prototype.cache = function() {
    fs.writeFileSync(this.options.statsFile, this.sort().map(
        (item) => util.format("%s,%s,%s", item[0], item[1], item[2])
    ).join("\n"));
};

DictionaryStats.prototype.add = function(word) {
    var prefix = word.charAt(0);

    if(!this.data.hasOwnProperty(prefix)) {
        this.data[prefix] = {};
    }

    this.data[prefix][word] = 0;
};

function getWordsCoverage(dictionary, callback) {
    var matches = 0;
    var rl = readline.createInterface({
        input: fs.createReadStream('words.txt')
    });
    rl.on('line', (line) => {
        if(dictionary.has(normalize(line))) {
            matches++;
        }
    }).on('close', () => {
        callback(matches);
    });
}

function test(dictionary, callback) {
    var rules = [
        /[bcdfghjklmnpqrstvwxz]{8,}/,
        /[aeyiou]{7,}/,
        /.{25,}/
    ];
    var all = 0, allCount = 0, pos = 0, posCount = 0, neg = 0, negCount = 0;
    testcase.on('test', (word, rate) => {
        if(rate) posCount++;
        else negCount++;
        allCount++;
        var classifierRate = null;
        for(var j = 0, len = rules.length; j < len; j++) {
            if(rules[j].test(word)) {
                classifierRate = false;
                break;
            }
        }

        if(null === classifierRate) {
            classifierRate = dictionary.has.call(dictionary, word);
        }

        if(classifierRate === rate) {
            if(rate) pos++;
            else neg++;
            all++;
        }
    });
    testcase.on('end', () => {
        callback(all, allCount, pos, posCount, neg, negCount);
    });
    testcase.run();
}

const statsListLimit = 38200;

function process(list) {
    list = list.slice(0, statsListLimit).sort(); console.log('List is being truncated...');
    var dictionary = new DictionaryTree(); console.log('Creating dictionary...');
    for(var i = 0, len = list.length; i < len; i++) {
        dictionary.pushWord.call(dictionary, list[i]);
    }

    var serialized = dictionary.format(); console.log('Formatting dictionary content...');
    zlib.gzip(serialized, (err, compressed) => { console.log('Content is being gziped...');
        fs.writeFile('data', compressed, (err) => { console.log('Writing "data" file...');
            fs.readFile('data', (err, data) => { console.log('Reading from "data" file...');
                zlib.gunzip(data, (err, uncompressed) => { console.log('Data is being gunziped...');
                    dictionary.parse(uncompressed.toString()); console.log('Parsing data with dictionary...');
                    console.log('TESTS:');
                    console.log('size:', Buffer.byteLength(serialized, 'utf8'));
                    console.log('gziped size:', Buffer.byteLength(compressed, 'utf8'));
                    getWordsCoverage(dictionary, (coverage) => {
                        console.log('words coverage:', coverage);
                    });
                    test(dictionary, (all, allCount, pos, posCount, neg, negCount) => {
                        console.log('testcase result:', all + '/' + allCount + ' (+' + pos + '/' + posCount + ',-' + neg + '/' + negCount + ')');
                    });
                    fs.stat('./data', (err, stats1) => {
                        if(!err) {
                            fs.stat('./classifier.js', (err, stats2) => {
                                if(!err) {
                                    var sum = stats1.size + stats2.size;
                                    console.log('file size: ', stats1.size + ' (data) + ' + stats2.size + '(classifier.js) = ' + sum, '/limit ' + 1024 * 64);
                                }
                            });
                        }
                    });
                });
            });
        });
    });

}

var stats = new DictionaryStats({
    normalizeFunction: normalize,
    statsFile: 'stats.csv'
});

stats.load()
.then(() => {
    console.log('Stats list has been read from cache...');
    process(stats.words());
})
.catch((err) => {
    if(err) return console.error(err);
    console.log('Reading words.txt...');
    readline.createInterface({
        input: fs.createReadStream('words.txt')
    }).on('line', (line) => {
        stats.add(normalize(line));
    }).on('close', () => {
        console.log('Creating stats... (it may take few minutes)')
        stats.create();
        console.log('Caching stats...');
        stats.cache();
        process(stats.words());
    });
});