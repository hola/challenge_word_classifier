var fs = require('fs');
var myModule = require('./testModule2');

var data = fs.readFileSync("alldata.txt");
myModule.init(data);

var sourceFileName = "words24m.txt";
var arWords = fs.readFileSync(sourceFileName).toString().split("\n");

var total = 0, numOk = 0;

for (var i = 0; i<100000; i++) {
    var word = arWords[i].substr(2);
    var realRes = arWords[i][0]=="1";

    total++;

    var myRes = myModule.test(word);

    if (realRes == myRes) {
        numOk++;
    }
}
console.log(numOk/total*100);

// arWords.forEach(function (el) {
//     var word = el.substr(2);
//     var realRes = el[0];
//
//     var answ = {};
//
//     total++;
//     var myRes = myModule.test(word);
//     if (realRes == myRes) {
//         numOk++;
//     }
// });

//var totAnsw = 0;
//for (var len in answOk) {
//    if (len<25){
//        totAnsw += answ[len];
//        console.log("len", len, answOk[len], answ[len], answOk[len]/answ[len]*100);
//    }
//}
//console.log("tot answ", totAnsw);