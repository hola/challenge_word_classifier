var fs = require("fs");
var TestModule = require("./TestModule");
var zlib = require('zlib');
var pgp = require('pg-promise')();
var cn = {
    host: 'localhost',
    port: 5432,
    database: 'Test',
    user: 'postgres',
    password: 'postgres'
};
var db = pgp(cn);
var qrm = pgp.queryResult;
var dataPath = "./Data/data.txt.gz";
var buffer = fs.readFileSync(dataPath);
TestModule.init(zlib.gunzipSync(buffer));
var startCase = 1;
var endCase = 5000;
var i = startCase;
var totalSuccess = 0;
var totalFail = 0;
var minSuccess = 100;
var maxSuccess = 0;
function testRun() {
    db.query("SELECT * FROM \"Cases\" WHERE \"CaseSetId\" = ${caseSetId}", {
        caseSetId: i
    }, qrm.many).then(function (tests) {
        i++;
        if (i <= endCase) {
            test(tests);
            testRun();
        }
        else {
            console.info("\nTotal success: " + ((totalSuccess / (totalSuccess + totalFail)) * 100).toFixed(2) + "%");
            console.info("Minimal success: " + minSuccess + "%");
        }
    })
        .catch(function (error) {
        console.info(error);
    });
}
function test(testArray) {
    var subSuccess = 0;
    var subFail = 0;
    for (var j = 0; j < testArray.length; j++) {
        var testResult = TestModule.test(testArray[j].Word);
        if (testResult === testArray[j].InDictionary) {
            totalSuccess++;
            subSuccess++;
        }
        else {
            totalFail++;
            subFail++;
        }
    }
    var subTotalSuccess = ((subSuccess / (subSuccess + subFail)) * 100);
    if (minSuccess > subTotalSuccess) {
        minSuccess = subTotalSuccess;
    }
    if (maxSuccess < subTotalSuccess) {
        maxSuccess = subTotalSuccess;
    }
    process.stdout.write("\r" +
        "Subtotal success: " + subSuccess + "%; " +
        "Case number: " + i + "; " +
        "Min success: " + minSuccess.toFixed(2) + "%; " +
        "Max success: " + maxSuccess.toFixed(2) + "%; " +
        "Avg success: " + ((totalSuccess / (totalSuccess + totalFail)) * 100).toFixed(2) + "%");
}
testRun();
