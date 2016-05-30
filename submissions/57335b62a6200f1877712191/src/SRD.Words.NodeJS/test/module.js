var should = require('chai').should(),
	scapegoat = require('../module'),
	test = scapegoat.test,
	init = scapegoat.init;

var fs = require('fs');
var zlib = require('zlib');

var zipData = fs.readFileSync('./data.dat.gz');
var data = zlib.gunzipSync(zipData);


var request = require('sync-request');
var res = request('GET', 'https://hola.org/challenges/word_classifier/testcase/1154344044');
var testData = JSON.parse(res.getBody('utf8'));

var testFunction = 'var tfn = function(){';
for(var testWord in testData)
{
	if(typeof(testWord) === "string")
	{
		var testValue = testData[testWord];
		testFunction += 'it("' + testWord + ' - ' + testValue + '", function() { test("' + testWord + '").should.equal(' + testValue + ');});';
	}
}
testFunction += '};';


init(data);

var vm = require('vm');
eval(testFunction);

describe('#test', tfn);
