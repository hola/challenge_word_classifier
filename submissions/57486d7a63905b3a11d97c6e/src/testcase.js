const https = require('https');
const events = require('events');

var emitter = new events.EventEmitter();

function load(path, callback) {
    if(typeof path == 'undefined') {
        path = '/challenges/word_classifier/testcase';
    }
    
    var req = https.request({
        hostname: 'hola.org',
        path: path,
        method: 'GET'
    }, function(response) {
        if(response.headers.location) {
            load(response.headers.location, callback);
            return;
        }
        
        var str = '';
        
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            var data = JSON.parse(str);
            callback(null, data);
        });
    })
    .on('error', callback)
    .end();
}

function on(event, listener) {
    emitter.on(event, listener);
}

function run() {
    load('/challenges/word_classifier/testcase', (err, data) => {
        if(err) return emitter.emit('error', err);
        for(var word in data) {
            emitter.emit('test', word, data[word]);
        }
        emitter.emit('end');
    });
}

exports.on = on;
exports.run = run;