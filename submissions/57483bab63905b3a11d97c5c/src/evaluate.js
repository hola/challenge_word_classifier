#!/usr/bin/node

var fs = require('fs');
var readline = require('readline');
var zlib = require('zlib');
var format = require('util').format;

var args = process.argv.slice(2);
var filename = args.length > 0 ? args[0] : 'cv';
var stream = fs.createReadStream(filename);
if (filename.indexOf(".gz") !== -1) {
  stream = stream.pipe(zlib.createUnzip());
}

function getFilesizeInBytes(filename) {
 var stats = fs.statSync(filename)
 var fileSizeInBytes = stats["size"]
 return fileSizeInBytes
}

var dataFile = './extra_data.gz';
var modFile = './solution.js';

var size = getFilesizeInBytes(dataFile) + getFilesizeInBytes(modFile);
var solution = require(modFile);
var data = zlib.gunzipSync(fs.readFileSync(dataFile));

var valid = 0;
var total = 0;
var v = [0,0];
var t = [0,0];

function next(line) {
  var ps = line.split(' ');
  var y = (ps[0] == '1');
  var word = ps[1];
  var pred = solution.test(word);
  t[y?1:0] += 1;
  if (y == pred) {
    valid += 1;
    v[pred?1:0] += 1;
  } else {
    //console.log(line);
  }
  total += 1;
  if (total % 100000 == 0) {
    console.log(format('%d %d', total, (100.0*valid/total).toFixed(2)));
  }
}

function finish () {
  //console.log('');
  console.log('Size:       ' + size);
  console.log('Samples:    ' + total);
  console.log('P(1):       ' + (100.0*t[1]/total).toFixed(2));
  console.log('Accuracy-0: ' + (100.0*v[0]/t[0]).toFixed(2));
  console.log('Accuracy-1: ' + (100.0*v[1]/t[1]).toFixed(2));
  console.log('Accuracy:   ' + (100.0*valid/total).toFixed(2));
}

if (solution.init) {
  solution.init(data);
}
readline.createInterface({input: stream, terminal: false}).on('line', next).on('close', finish);
