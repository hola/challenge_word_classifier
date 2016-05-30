instance=function(){function t(){function n(t){return o=t.length,t.sort(function(t,n){return t=t.toLowerCase(),n=n.toLowerCase(),n.length-t.length}),t.reverse(),r=t[o/2].length,t}function e(t){i=t.split("\r\n"),n(i)}var r,o,i=[];t.prototype={init:function(t){var n=!0;return t&&"string"==typeof t?e(t):n=!1,this},test:function(t){var n,e=t.length;return n=e>r?i.lastIndexOf(t):i.indexOf(t),n>-1}}}return new t}(),instance.__proto__=instance.__proto__.constructor.prototype,module.exports=instance;
/*
    =========USAGE========
    var comp = require("./comp");
    var fs = require("fs");
    var file = fs.readFile('dictionary.txt', 'utf8', function (err,data) {

     if (err) {
        return console.log(err);
     }

     comp.init(data); 
     console.log(comp.test("word")); //logs true
     console.log(comp.test("kakimaki")); // logs false
 });

 */