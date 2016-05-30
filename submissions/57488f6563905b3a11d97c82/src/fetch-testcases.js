var http = require('http');
var fs = require('fs');

for (var index = 0; index < 1000; index++) {
    
    http.get('http://hola.org/challenges/word_classifier/testcase', function(response) {
        var acaseid = response.headers.location.split('/');
        var file = fs.createWriteStream('testcase/' + acaseid[acaseid.length - 1] + '.txt');
        http.get('http://hola.org' + response.headers.location, function(response) {
            response.pipe(file);
        });
    });
    
}