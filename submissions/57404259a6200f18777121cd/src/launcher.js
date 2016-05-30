(function () {
    "use strict";

    const fs = require('fs');
    const pg = require('pg');
    const async = require('./async');

    const classificator = require('./classificator');

    const db = buildDB({
        connectionString: 'postgres://postgres:postgres@127.0.0.1:5432/hola_class'
    });

    async(main())
        .then(function () {
            process.exit(0);
        })
        .catch(function (err) {
            console.log(err);
            process.exit(1);
        });

    function* main() {
        let buffer = fs.readFileSync('buffer.bin');
        classificator.init(buffer);

        let scores = [];

        while (true) {
            let test = yield getRandomTest(1, 200000);
            check(test);
        }

        function check(words) {
            var score = 0;
            for (var word in words) {
                var test = classificator.test(word);
                if (test == words[word]) score++;
                //console.log(word + ' (' + (words[word] ? '+' : '-') + ',' + (test ? '+' : '-') + ')');
            }
            scores.push(score);
            if (scores.length > 1000) scores.shift();
            var sum = 0;
            for (var i = 0; i < scores.length; i++) {
                sum += scores[i];
            }
            sum /= scores.length;
            console.log(score + ' (' + (+sum).toFixed(1) + ') (' + scores.length + ')');
        }

    }

    function* getRandomTest(min, max) {
        return yield db.inConnection(function* (client) {
            var id = getRandomInt(min, max);
            var result = yield client.query("SELECT data FROM examples WHERE id = $1", [id]);
            if (result.rowCount) {
                return JSON.parse(result.rows[0]['data']);
            } else {
                throw new Error("Nothing found.");
            }
        });

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
    }

    function sleep(milliseconds) {
        return new Promise(function (resolve, reject) {
            setTimeout(resolve, milliseconds);
        });
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

})();