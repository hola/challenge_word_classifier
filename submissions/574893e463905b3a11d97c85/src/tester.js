var fs = require('fs'),
    _ = require('lodash');

var testSet = '../tests2'
var files = fs.readdirSync('./'+testSet);
var detailed = 'fn-';
function exec(name) {
  var executor = require('./'+name);
  executor.init(fs.readFileSync('../dist/data'));
  var total = 0;
  var success = 0;
  var fn = 0;
  var fp = 0;
  var rss = [];
  for(var i=0;i<files.length;i++){
    var data = JSON.parse(fs.readFileSync(testSet+'/'+files[i]));
    var words = _.keys(data);
    var results = words.map(w => {
      var matches = executor.test(w) === data[w];
      if(!matches){
        if(data[w]){
          fn++;
        }else{
          fp++;
        }
      }
      return matches;
    });
    total += words.length;
    var res = _.filter(results, x=>x).length;
    rss.push(res);
    success += res;
  }
  console.log('Worst file: %d, best file: %d, files count: %d', _.min(rss), _.max(rss), files.length);
  console.log('success: %d%\nfp: %d%\nfn: %d%\n', success*100/total, fp*100/total, fn*100/total);
  return success*100/total;
}
module.exports = exec;
