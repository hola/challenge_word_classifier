const zlib = require('zlib')
const fs = require('fs')
const path = require('path')
const jsonfile = require('jsonfile')
const http = require('follow-redirects').http
const combinedStream = require('combined-stream')
const walk = require('walkdir')

const srcs = [
  'sample_start_elimination_2d.io',
  'sample_start_elimination_3d.io',
  // 'sample_start_elimination_4d.io',
  'sample_ending_elimination_2d.io',
  'sample_ending_elimination_3d.io',
  // 'sample_ending_elimination_4d.io',
  'sample_elimination_2d.io',
  'sample_elimination_3d.io',
  'sample_elimination_4d.io'
]
const dest = '../resources/sample_elimination_all.io'
const zip = '../resources/sample_elimination_all.io.gz'
const testFile = '../output/test-100k.json'
const reportFile = '../report.json'
const scriptFile = 'classifier.min.js'

let sourcePathsQueue = []
let report
let currentPath

getReport()
initFolders()

function getReport () {
  if (!fs.existsSync(reportFile))
    jsonfile.writeFileSync(reportFile, {})

  report = jsonfile.readFileSync(reportFile)
}

function setReport (average) {
  report[path.dirname(currentPath)] = average
  jsonfile.writeFileSync(reportFile, report, {spaces: 2})
}

function initFolders () {
  let directories = []

  walk('../best')
    .on('path', p => {
      if (p.indexOf('.io') != -1)
        if (directories.indexOf(path.dirname(p)) == -1)
          directories.push(path.dirname(p))

    })
    .on('end', () => {
      initFiles(directories)
    })
}

function initFiles (directories) {
  directories.forEach((dir, i) => {
    let counter = 0
    let tempArr = []

    walk(dir)
      .on('path', p => {

        if(p.indexOf('.io') != -1)
          srcs.forEach(src => {
            if (p && p.indexOf(src) != -1) {
              counter++
              tempArr.push(p)

              if(counter == srcs.length)
                sourcePathsQueue = sourcePathsQueue.concat(tempArr)
            }
          })
      })
      .on('end', () => {
        if(directories.length - 1 == i)
          processQueue()
      })

  })
}

function processQueue () {
  let tempArr = []
  if(sourcePathsQueue.length > (srcs.length - 1)) {
    let unSorted = sourcePathsQueue.splice(0, srcs.length)
    srcs.forEach((src, i) => {
      unSorted.forEach( unSortedSrc => {
        if (unSortedSrc.indexOf(src) != -1)
          tempArr[i] = unSortedSrc
      })
    })
    merge(tempArr)
  } else {
    console.log('DONE')
  }
}

function merge (sourcePaths) {
  currentPath = sourcePaths[0]
  if(!currentPath || report[path.dirname(currentPath)])
    return processQueue()

  // log source path
  console.log('Testing Source Path:', path.dirname(currentPath))

  let cs = combinedStream.create()
  sourcePaths.forEach(src => {
    if (src.indexOf('4d') != -1) {
      let divisionSize = 64
      let chunkSize = Math.floor((fs.statSync(src)['size'] / 4) / divisionSize)
      for (let i = 0; i < divisionSize; i++)
        cs.append(fs.createReadStream(src, {
          start: i * chunkSize * 4,
          end: (i * chunkSize * 4) + (967)
        }))//.on('data', b => console.log(b.length, i * chunkSize * 4, i * chunkSize * 4 + 287)))

    } else {
      cs.append(fs.createReadStream(src))
    }
    cs.append(new Buffer('|'))
  })
  cs.pipe(
    fs.createWriteStream(dest)
      .on('close', gzip)
  )
}

function gzip () {
  fs.createReadStream(dest)
    .pipe(zlib.createGzip())
    .pipe(
      fs.createWriteStream(zip)
        .on('close', () => {
          require('child_process').execSync('uglifyjs classifier.js -o classifier.min.js -mc --wrap')
          let sizeOfScript = fs.statSync(scriptFile)['size']
          let sizeOfData = fs.statSync(zip)['size']
          console.log('Script size:', sizeOfScript)
          console.log('Data size:', sizeOfData)
          console.log('Total size:', sizeOfScript + sizeOfData)
          console.log('Remaining / Exceeds:', 65536 - (sizeOfScript + sizeOfData))
          run()
        })
    )
}

function run () {
  const classifier = require(`./classifier.min`)
  classifier.init(
    zlib.gunzipSync(fs.readFileSync(zip))
  )
  testLocal(classifier)
}

function testLive (classifier) {
  let counter = 0
  let sum = 0

  http.get('http://hola.org/challenges/word_classifier/testcase', (res) => {
    counter++

    let body = ''

    res.on('data', chunk => {
      body += chunk
    })

    res.on('end', () => {
      let words = JSON.parse(body)
      let correctCounter = 0
      for (let word in words) {
        if (words.hasOwnProperty(word)) {
          let isEnglish = classifier.test(word)
          isEnglish == words[word] && correctCounter++
          // console.log(word, words[word], isEnglish)
        }
      }

      sum = sum + ((100 * correctCounter) / Object.keys(words).length)

      process.stdout.write(`Counter: ${counter} | Average: ${(sum/counter).toFixed(2)}%\r`)
      // console.log('Result', (100 * correctCounter) / Object.keys(words).length, '%')
      processQueue()
    })
  })
}

function testLocal (classifier) {
  let counter = 0
  let sum = 0

  let counters = {
    truetrue: 0,
    truefalse: 0,
    falsefalse: 0,
    falsetrue: 0
  }

  jsonfile.readFile(testFile, (err, wordsExisting) => {
    wordsExisting.forEach( words => {
      counter++
      let correctCounter = 0
      for (let word in words) {
        if (words.hasOwnProperty(word)) {
          let isEnglish = classifier.test(word)
          isEnglish == words[word] && correctCounter++

          if(words[word] == true && isEnglish == true)
            counters.truetrue++
          else if(words[word] == true && isEnglish == false)
            counters.truefalse++
          else if(words[word] == false && isEnglish == false)
            counters.falsefalse++
          else if(words[word] == false && isEnglish == true)
            counters.falsetrue++
        }
      }
      sum = sum + ((100 * correctCounter) / Object.keys(words).length)
      process.stdout.write(`Counter: ${counter * 100} | Average: ${(sum/counter).toFixed(2)}%\r`)
    })

    setReport((sum/counter).toFixed(2))
    console.log('\n', counters)
    processQueue()
  })
}