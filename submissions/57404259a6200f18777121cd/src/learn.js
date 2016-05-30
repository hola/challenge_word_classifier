(function () {
    "use strict";

    var fs = require('fs');
    var zlib = require('zlib');
    var pg = require('pg');
    var async = require('./async');

    var DB = buildDB({
        connectionString: 'postgres://postgres:postgres@127.0.0.1:5432/hola_class'
    });

    var BF = buildBF({
        bytesCount: 70000,//70000, 755000
        hashesCount: 1
    });

    const alphabet = "0abcdefghijklmnopqrstuvwxyz'";

    var debug1 = new Int32Array(69100 * 8);
    var debug2 = new Int32Array(69100 * 8);

    async(main())
        .then(function () {
            process.exit(0);
        })
        .catch(function (err) {
            console.log(err);
            process.exit(1);
        });

    function* main() {
        var minChars = [2];
        var maxChars = [14];

        for (let minChar in minChars) {
            minChar = minChars[minChar];
            for (let maxChar in maxChars) {
                maxChar = maxChars[maxChar];
                //for (let byteCount = 69300; byteCount < 80000; byteCount += 10) {
                let byteCount = 69100;
                BF = buildBF({
                    bytesCount: byteCount, //70000, 755000
                    hashesCount: 1
                });

                yield learn(minChar, maxChar);
                let score = yield checkSystem(minChar, maxChar);
                //let score = 50;
                yield saveSystem();
                //console.log(minChar + ' - ' + maxChar + ' : ' + (+score).toFixed(1));

                let fileSizeInBytes = fs.statSync("buffer.bin.gz")["size"];
                console.log(byteCount + ' (' + fileSizeInBytes + ')' + ': ' + (+score).toFixed(1));
                //}
            }
        }

        //var debug = new Int32Array(69100 * 8);
        //var sortable = [];
        //for (let i = 0; i < 69100 * 8; i++) {
        //    if (debug2[i] - debug1[i] > 0) {
        //        sortable.push([i, debug2[i] - debug1[i]]);
        //    }
        //    if (debug2[i] - debug1[i] > 0) {
        //        BF.clearBit(i);
        //    }
        //}
        //sortable.sort(function (a, b) {
        //    return -(a[1] - b[1]);
        //});
        //console.log(sortable);

        yield saveSystem();

        console.log('Done');
    }

    function* learn(minChars, maxChars) {
        let lastWord = '';
        let wordsProcessed = 0;
        let wordsPerCycle = 1000;
        while (true) {
            let words = yield getNextWords(lastWord, wordsPerCycle, minChars, maxChars);
            if (words.length == 0) break;
            for (let i = 0; i < words.length; i++) {
                lastWord = words[i];
                BF.add(lastWord);
            }
            wordsProcessed += wordsPerCycle;
            //console.log('Updating data: ' + wordsProcessed);
        }
        //console.log('Updating data: ' + wordsProcessed);
    }

    function* checkSystem(minChars, maxChars) {
        let scores = [];

        for (let i = 0; i < 500; i++) {
            let test = yield getRandomTest(1, 200000);
            check(test);
            if ((i % 1000) == 0) {
                console.log("Test " + i);
            }
            //yield sleep(1000);
        }

        var sum = 0;
        for (let i = 0; i < scores.length; i++) {
            sum += scores[i];
        }
        sum /= scores.length;
        return sum;

        function check(words) {
            var score = 0;
            for (var word in words) {
                var test = testString(word);
                var hash = BF.doubleHash(word, 0, 69100);
                if (test == words[word]) {
                    score++;
                    debug1[hash]++;
                } else {
                    debug2[hash]++;
                }
                //console.log(word + ' (' + (words[word] ? '+' : '-') + ',' + (test ? '+' : '-') + ')');
            }
            scores.push(score);
            if (scores.length > 1000) scores.shift();
            var sum = 0;
            for (var i = 0; i < scores.length; i++) {
                sum += scores[i];
            }
            sum /= scores.length;
            //console.log(score + ' (' + (+sum).toFixed(1) + ') (' + scores.length + ')');
        }

        function testString(word) {
            word = word.toLowerCase();
            const l = word.length;
            if (l < minChars) return word.indexOf("'") == -1;
            if (l > maxChars) return false;
            return BF.check(word);
        }

    }

    function saveSystem() {
        return new Promise(function (resolve, reject) {
            fs.writeFileSync('buffer.bin', BF.buffer);

            const gzip = zlib.createGzip();
            const inp = fs.createReadStream('buffer.bin');
            const out = fs.createWriteStream('buffer.bin.gz');

            var stream = inp.pipe(gzip).pipe(out);
            stream.on('finish', resolve);
        });
    }

    function* loadSystem() {
        BF.buffer = fs.readFileSync('buffer.bin');
    }

    function* getRandomTest(min, max) {
        return yield DB.inConnection(function* (client) {
            var id = getRandomInt(min, max);
            var result = yield client.query("SELECT data FROM examples WHERE id = $1", [id]);
            if (result.rowCount) {
                //console.log(result.rows[0]);
                return JSON.parse(result.rows[0]['data']);
            } else {
                throw new Error("Nothing found.");
            }
        });

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
    }

    function* getNextWords(word, count, minChars, maxChars) {
        var nextWords = [];
        yield DB.inConnection(function* (client) {
            var result = yield client.query("SELECT word FROM dict WHERE word > $1 and char_length(word) >= $3 and char_length(word) <= $4 ORDER BY word LIMIT $2", [word, count, minChars, maxChars]);
            //var result = yield client.query("SELECT * FROM dict ORDER BY word LIMIT $1", [100]);
            if (result.rowCount) {
                for (var i = 0; i < result.rowCount; i++) {
                    nextWords[i] = result.rows[i]['word'];
                }
            }
        });
        //console.log(nextWords);
        return nextWords;
    }

    function buildDB(config) {
        return {
            connectionString: config.connectionString,
            escapeString: function (text) {
                return "'" + ("" + text).replace(new RegExp("'", 'g'), "''") + "'";
            },
            inConnection: function* (callback) {
                var connectionDone;
                var connectionString = this.connectionString;
                var client = yield new Promise(function (resolve, reject) {
                    pg.connect(connectionString, function (err, client, done) {
                        if (err) {
                            done();
                            reject(err);
                        } else {
                            connectionDone = done;
                            resolve(client);
                        }
                    });
                });
                var result = yield callback({
                    client: client,
                    query: query
                });
                if (connectionDone) connectionDone();
                return result;

                function query(text, values) {
                    var client = this.client;
                    return new Promise(function (resolve, reject) {
                        if (values) {
                            client.query(text, values, callback);
                        } else {
                            client.query(text, callback);
                        }
                        function callback(err, result) {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(result);
                            }
                        }
                    });
                }
            }
        };
    }

    function buildBF(config) {
        return {
            config: config,
            buffer: Buffer.alloc(config.bytesCount),
            add: function (text) {
                for (var i = 0; i < this.config.hashesCount; i++) {
                    var bit = this.doubleHash(text, i, this.config.bytesCount * 8);
                    this.setBit(bit);
                }
            },
            check: function (text) {
                //var isIn = true;
                for (var i = 0; i < this.config.hashesCount; i++) {
                    var bit = this.doubleHash(text, i, this.config.bytesCount * 8);
                    if (!this.getBit(bit)) {
                        return false;
                        //isIn = false;
                    }
                }
                return true;
                //return isIn;
            },
            charToIndex: function (char) {
                const index = alphabet.indexOf(char);
                return index != -1 ? (index + 1) : 1;
            },
            getBit: function (bit) {
                var byte = (bit / 8) | 0;
                var localBit = bit % 8;
                var value = this.buffer.readUInt8(byte);
                value &= 1 << localBit;
                return !!value;
            },
            setBit: function (bit) {
                //debug[bit]++;
                var byte = (bit / 8) | 0;
                var localBit = bit % 8;
                var value = this.buffer.readUInt8(byte);
                value |= 1 << localBit;
                this.buffer.writeUInt8(value, byte);
            },
            clearBit: function (bit) {
                var byte = (bit / 8) | 0;
                var localBit = bit % 8;
                var value = this.buffer.readUInt8(byte);
                if (value & (1 << localBit)) {
                    value -= (1 << localBit);
                }
                this.buffer.writeUInt8(value, byte);
            },
            doubleHash: function (text, i, m) {
                i++;
                //var hash = Math.abs(this.djb2(text) + i * this.sdbm(text)) % m;
                //var hash = Math.abs(i * this.sdbm(text)) % m;
                var hash = Math.abs(i * this.djb2(text)) % m;
                //var hash = Math.abs(i * this.fnv32a(text)) % m;
                //var hash = Math.abs(i ? this.sdbm(text) : this.djb2(text)) % m;
                return hash;
            },
            sdbm: function (text) {
                var hash = 0;
                for (var i = 0; i < text.length; i++) {
                    hash = this.charToIndex(text[i])/*text.charCodeAt(i)*/ + (hash << 6) + (hash << 16) - hash;
                }
                return hash;
            },
            djb2: function (text) {
                var hash = 5381;
                for (var i = 0; i < text.length; i++) {
                    hash = ((hash << 5) + hash) ^ this.charToIndex(text[i])/*text.charCodeAt(i)*/;
                }
                return hash;
            },
            fnv32a: function (str) {
                var FNV1_32A_INIT = 0x811c9dc5;
                var hval = FNV1_32A_INIT;
                for (var i = 0; i < str.length; ++i) {
                    //hval ^= str.charCodeAt(i);
                    hval ^= this.charToIndex(str[i]);
                    hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
                }
                return hval >>> 0;
            }
        };
    }

})();
