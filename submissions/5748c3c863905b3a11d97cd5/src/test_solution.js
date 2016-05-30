/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var fs = require('fs');
var zlib = require('zlib');

var data = zlib.gunzipSync(fs.readFileSync("compressed_20.gz"));
var sol = require("./solution.js");
sol.init(data);