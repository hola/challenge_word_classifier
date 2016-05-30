var fetch = require('isomorphic-fetch');
// var TEST_DATA_URL = 'https://hola.org/challenges/word_classifier/testcase';
var TEST_DATA_URL = 'https://hola.org/challenges/word_classifier/testcase/986096039';

module.exports = function(cb){
    return fetch(TEST_DATA_URL)
        .then(function (resp) {
            return resp.json();
        })
        .then(cb);
}
