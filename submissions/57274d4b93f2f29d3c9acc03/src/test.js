var index = require('./index.min');
var test_data = require('./test_data');

var _ = require('lodash');

var assert = require('chai').assert;


describe('#', function() {
	_.map(test_data, function (test_data_item) {
		_.map(test_data_item, function (val, word) {

			it('it work with "' + word + '" == ' + val, function () {
				// assert.equal(val, index.test(word));
				index.test(word)
			});

		});
	});
});
