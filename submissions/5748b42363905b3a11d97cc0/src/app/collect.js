const fs = require('fs')
const http = require('follow-redirects').http
const file = '../resources/wordsV2.txt'

collect()

let existingWords = fs.readFileSync(file).toString().split("\n")

// test classifier
function collect () {
  let counter = 0
  let wordsFile = fs.createWriteStream(file, {'flags': 'a'})
  http.get('http://hola.org/challenges/word_classifier/testcase', (res) => {

    let body = ''

    res.on('data', chunk => {
      body += chunk
    })

    res.on('end', () => {
      let words = JSON.parse(body)
      for (let word in words) {
        if (words.hasOwnProperty(word)) {
          if(words[word] && !existingWords.includes(word)) {
            counter++
            existingWords.push(word)
            wordsFile.write(word + '\n')
          }
        }
      }
      console.log('added', counter, '/', existingWords.length)
      wordsFile.end()
      collect()
    })
  })
}