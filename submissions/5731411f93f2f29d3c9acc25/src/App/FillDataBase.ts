var crc32 = require("crc-32");
var pgp = require('pg-promise')();

var cn = {
    host: 'localhost',
    port: 5432,
    database: 'Test',
    user: 'postgres',
    password: 'postgres'
};
var db = pgp(cn);
var currLineNumber = 0;

var fs = require('fs'), util = require('util'), stream = require('stream'), es = require('event-stream');
var s = fs.createReadStream('./Data/words.txt')
    .pipe(es.split())
    .pipe(es.mapSync(function(line){
            s.pause();
            var hash = crc32.str(line);
            db.none("INSERT INTO \"Words\"(\"Word\", \"Hash\", \"HashSigned\", \"HashInteger\") VALUES(${word}, ${hash}, ${hashSigned}, ${hashInteger})", {
                word: line,
                hash: numberToHex(hash, 2),
                hashSigned: numberToHexSigned(hash, 2),
                hashInteger: hash,
            }).then(() => {
                if(++currLineNumber % 1000 === 0) {
                    console.info("INSERT ROWS: " + Math.round(currLineNumber / 1000) + "k, latest line: " + line);
                }

                s.resume();
            }).catch((data) => {
                console.error(data);
            });
        })
        .on('error', function(){
            console.log('Error while reading file.');
        })
        .on('end', function(){
            console.log('Read entire file.')
        })
    );

function numberToHex(d, padding) {
    var hex = Number(Math.abs(d)).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}

function numberToHexSigned(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex;
}