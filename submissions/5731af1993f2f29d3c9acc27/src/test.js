"use strict"
var mod = require('./hola.js');
var fs = require('fs');
var zlib = require('zlib');
var data = fs.readFileSync('newWords.txt.gz'); 
var test = fs.readFileSync('test.json');
data = zlib.gunzipSync(data); 
if (mod.init)
    mod.init(data);
var json = JSON.parse(test);
var f=0;
var t=0;
for (let key in json) {
    (mod.test(key) === json[key])?t++:f++;
}
console.log(t/(t+f)*100+'%');
