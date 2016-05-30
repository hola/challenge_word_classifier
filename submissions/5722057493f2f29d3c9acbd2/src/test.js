var http = require('follow-redirects').https
var m = require('./main')

var url = 'https://hola.org/challenges/word_classifier/testcase'
var body = ''
http.get(url, function(res) {
	res.on('data', function(chunk) {
		body += chunk
	})
	res.on('end', function() {
		var testData = JSON.parse(body)
		var count = 0
		var pass = 0
		var fail = 0
		for (var w in testData) {
			count++
			var testResult = m.test(w)
			if (testResult == testData[w]) {
				pass++
			} else {
				fail++
				console.log('fail for: ' + w + ', expected: ' + testData[w] + ', value: ' + testResult)
			}
		}
		console.log('count: ' + count + ', passed: ' + pass + ', failed: ' + fail)
	})
})
