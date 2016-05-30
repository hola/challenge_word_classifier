var fs = require('fs');

var DIR = 'test_data';

var arr = fs.readdirSync(DIR);

for (var i = 0; i < arr.length; i++) {
    var t = JSON.parse(fs.readFileSync(DIR + '/' + arr[i], 'utf8'));
    for (var item in t) {
        console.log(item + "\t" + ((t[item]) ? 1 : 0));
    }
}