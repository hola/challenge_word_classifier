// var GENERATE_DB = true;
var GENERATE_DB = process.env.NODE_ENV === "dev";

if (GENERATE_DB) {
    require('./utils/generateBitDb.js')();
} else {
    var fs = require('fs');
    var executeTest = require('./utils/ExecuteTest.js');
    // var main = require('./bloom/main.js');
    var main = require('./main.min.js');
    var appConfig = require('./app.config.js').appConfig;

    fs.readFile(appConfig.DB_FILE_PATH, function (err, buffer) {
        main.init(buffer);
        console.log('Done reading');

        executeTest(function (data) {
            var correct = 0;
            var total = 0;
            for (var word in data) {
                console.log(word, word.length, main.test(word), data[word]);
                correct += (main.test(word) === data[word] ? 1 : 0);
                total++;
            }
            console.log(correct, total);
        });
    });
}
