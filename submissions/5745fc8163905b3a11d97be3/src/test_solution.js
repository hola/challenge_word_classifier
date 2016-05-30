var fs = require('fs');
var zlib = require('zlib');
var mod = require('D:/projects/english_words/js/solution.js');
var data = fs.readFileSync('data.gz');
data = zlib.gunzipSync(data);
mod.init(data);

var fpos = 0;
var fneg = 0;
var total = 0;

function debug(s)
{
  console.log(s);
}

var array = fs.readFileSync('../a_test.txt').toString().split("\n");
for(i in array) 
{
  var line = array[i];
  if (line.length < 4)
    continue;
    
  var word = line.slice(3).split('"')[0];
  var test_class = line[line.lastIndexOf('"') + 3] == 't';
  var cl = mod.test(word);

  total++;
  if (cl != test_class)
    if (cl)
      fpos++;
    else
      fneg++;
  
  if (total && total % 1000 == 0)
    debug("on " + total + ": fpos=" + fpos + ", fneg=" + fneg + ", fsum=" + (fpos + fneg) +
          ", rate=" + (1.0 - (fpos + fneg * 1.0) / total));
}
