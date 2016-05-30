"use strict";
var fs = require('fs');
var zlib = require('zlib');
var mod = require('./solution.js');
var data = fs.readFileSync('./data.gz'); 
data = zlib.gunzipSync(data); 
if (mod.init)
    mod.init(data);
var Tests= ["xi", "zc", "'s", "x'", "a", "zzzz", "'", "abcdefghijklopqrst", "senator"];
for(let w of Tests){console.log(w,mod.test(w))};
