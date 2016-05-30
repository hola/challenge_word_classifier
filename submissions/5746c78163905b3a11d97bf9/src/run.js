#!/usr/bin/env node
var a = require('./solution');
var fs = require("fs");

fs.readFile("data", function (err, data)
{
    if (err) throw err;
    substrings = a.init(data);
    var array = fs.readFileSync('words.txt').toString().split("\n");
    for(i in array) {
        ai = array[i]    
        a.test(ai);
    }
});
