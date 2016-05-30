const toTest = require('./index.min.js')
const https = require('https')
const fs = require('fs')
const zlib = require('zlib');

function fetchCase(cb) {
  const getReq = https.get('https://hola.org/challenges/word_classifier/testcase', res => {
    console.log(`response`, res.headers.location)
    const getReq2 = https.get('https://hola.org' + res.headers.location, res2 => {
      let buffer = ''
      res2.on('data', (chunk) => {
        buffer += chunk
      })

      res2.on('end', () => cb(null, JSON.parse(buffer)))
      res2.resume()
    })
    getReq2.on('error', (e) => cb(e))

    res.resume()
  })

  getReq.on('error', (e) => cb(e))
}

let count = 10
let allResults = 0
let allCounts = 0

function test(c) {
  const compressed = fs.readFileSync('data.txt.gz')
  const fileData = zlib.gunzipSync(compressed)
  toTest.init(fileData)
  fetchCase((e, data) => {
    if (e) {
      return console.log('Error while processing', e)
    }
    // console.log('Working on ', data)
    let countGood = 0
    Object.keys(data).forEach(w => {
      if (toTest.test(w) === data[w]) {
        countGood += 1
      } else {
        console.log(`Failure, for word ${w} got false ${!!data[w] ? 'negative' : 'positive'} (${!data[w]})`)
      }
    })

    console.log('Results are:', countGood, 'out of', Object.keys(data).length)
    allResults += countGood
    allCounts += Object.keys(data).length
    if (--count > 0) {
      test(c)
    } else {
      c()
    }
  })
}


test(() => console.log(`All results ${allResults} out of ${allCounts}, which gives ${allResults*100/allCounts}%`))
