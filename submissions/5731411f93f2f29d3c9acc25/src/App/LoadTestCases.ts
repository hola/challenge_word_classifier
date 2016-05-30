var pgp = require('pg-promise')();
var cn = {
    host: 'localhost',
    port: 5432,
    database: 'Test',
    user: 'postgres',
    password: 'postgres'
};
var db = pgp(cn);

var request = require("request");
var urlTemplate = "https://hola.org/challenges/word_classifier/testcase/";

var startTestCaseId = 500010;
var endTestCaseId = 1000000;
var currentTestCaseId = startTestCaseId;

var rq = function() {
    request({
        url: urlTemplate + currentTestCaseId,
        json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var tempSetId = currentTestCaseId;
            for(var key in body) {
                db.none("INSERT INTO \"Cases\"(\"Word\", \"InDictionary\", \"CaseSetId\") VALUES(${Word}, ${InDictionary}, ${CaseSetId})", {
                    Word: key,
                    InDictionary: body[key],
                    CaseSetId: tempSetId,
                }).then(() => {

                }).catch((data) => {
                    console.error(data);
                });
            }

            console.log("-- REQUEST COMPLETE: " + currentTestCaseId);
            currentTestCaseId++;

            if(currentTestCaseId <= endTestCaseId) {
                setTimeout(rq, 30);
            } else {
                console.info("-- FINISH");
            }
        } else {
            console.error(error);
        }
    })
};

rq();
rq();
rq();
rq();
rq();
rq();
rq();
rq();
rq();
rq();
rq();
rq();
rq();
rq();
rq();
rq();
rq();
rq();
rq();
rq();