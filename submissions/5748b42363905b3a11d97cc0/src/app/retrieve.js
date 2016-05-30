const jsonfile = require('jsonfile')
const http = require('follow-redirects').http

const testFile = '../output/test-large.json'

retrieveTestData()

// test classifier
function retrieveTestData () {

  http.get('http://hola.org/challenges/word_classifier/testcase', (res) => {

    let body = ''

    res.on('data', chunk => {
      body += chunk
    })

    res.on('end', () => {
      let words = JSON.parse(body)

      jsonfile.readFile(testFile, (err, wordsExisting) => {
        console.log('Size:', wordsExisting.length)
        wordsExisting.push(words)
        jsonfile.writeFile(testFile, wordsExisting, function (err) {
            retrieveTestData()
        })
      })
    })
  })
}