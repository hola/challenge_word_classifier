const http = require('http')

var test = {
    "ensnarer's": true,
    "agallochum": true,
    "unbeings": true,
    "akirbc": false,
    "aglyphemiaticity": false,
    "predeliberation": true,
    "paragus": false,
    "noncollectors": true,
    "hegapznt": false,
    "mazourka": true,
    "intokenzy's": false,
    "xkjgjkszys'jivjmjbb": false,
    "agarose": true,
    "octup": false,
    "polydactyly's": true,
    "kamehelysis": false,
    "antespring": true,
    "cglp": false,
    "ythundered": true,
    "unville's": false,
    "maggie": true,
    "laceleaf": true,
    "gareth": true,
    "householder": true,
    "soloenaristrisanawet's": false,
    "saddlebrookstackerings": false,
    "skittered": true,
    "opetrationisonatelwomunadrastobsotednepreclax": false,
    "articling's": true,
    "edinburgian's": false,
    "carolan": true,
    "pickens's": true,
    "kcrdjwiqkarli": false,
    "dgrrmegtdydjf": false,
    "zizania's": true,
    "sphalic": false,
    "paperknives": true,
    "tetrasporangium's": true,
    "spinturning": false,
    "cannelured": true,
    "georgiana's": true,
    "monoecious": true,
    "epexegesis's": true,
    "besant": true,
    "unreeling": true,
    "merid": false,
    "lxjaxrbqgpvvnjtyc": false,
    "verderor's": true,
    "teclaly's": false,
    "tarheeler's": true,
    "havildars": true,
    "'odvjygzccssbpssfeowasvn": false,
    "tantalic's": true,
    "phylluminornity's": false,
    "saving's": true,
    "armonica": true,
    "hcefcttv'ttatduyn": false,
    "deaconesses": true,
    "steven's": true,
    "unfrisakhtination": false,
    "appardia's": false,
    "egony": false,
    "incohering": true,
    "burtrumpet's": false,
    "fourfoldness": true,
    "'r": false,
    "wili": true,
    "valdosta": true,
    "saurophagous": true,
    "murkily": true,
    "udaepftruij": false,
    "wardrop": true,
    "dleamas": false,
    "lietman's": true,
    "superintendential": true,
    "uncinematized": false,
    "unfeliness": false,
    "odonata": true,
    "rustice's": true,
    "enouncement": true,
    "guenato": false,
    "sheepsheading": false,
    "aran's": true,
    "broadsos": false,
    "governor": true,
    "caywngjijfxcb": false,
    "maldocchio": true,
    "comraderies": true,
    "ek": false,
    "metaconingly": false,
    "pulmonate's": true,
    "budoly": false,
    "incrassation's": true,
    "surrenal": true,
    "carlie": true,
    "lapitalisms": false,
    "upmnyc": false,
    "nnngmtk": false,
    "uq'cvdnetcblyinmf": false,
    "unattach": true
}

const GZIPPED = require('./config').GZIPPED
var zlib = require('zlib')
var fs = require('fs')
var buf = GZIPPED ? zlib.gunzipSync(fs.readFileSync('dict')) : fs.readFileSync('dict')
var solver = require('./module')
solver.init(buf)

function fetchTest() {
    return new Promise((resolve, reject) => {
        const idx = Math.round(Math.random() * Math.pow(2, 31))
        http.get('http://hola.org/challenges/word_classifier/testcase/' + idx, res => {
            var body = ''
            res.setEncoding('utf8');
            res.on('data', chunk => {
                body += chunk
            });
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body))
                }
                catch (e) {
                    reject(e)
                }
            })
            res.on('error', reject)
        })
    })
}

if (process.env.FETCH_TESTS) {
    function check(testSet) {
        var words = Object.keys(testSet)
        var correct = 0
        var wrongFalse = 0
        var wrongTrue = 0
        words.forEach(word => {
            const isWord = solver.test(word)
            if (isWord === testSet[word]) {
                correct++
            }
            else if (isWord) {
                wrongTrue++
            }
            else {
                wrongFalse++
            }
        })
        return [correct, wrongTrue, wrongFalse]
    }
    const count = parseInt(process.env.FETCH_TESTS, 10)
    var i = count
    const wait = []
    while (i--) {
        wait.push(fetchTest())
    }
    Promise.all(wait).then(tests => {
        const results = tests.map(check)
        const sum = (sum, res) => sum + res
        const avgTotal = results.map(r => r[0]).reduce(sum, 0) / count
        const avgTrue = results.map(r => r[1]).reduce(sum, 0) / count
        const avgFalse = results.map(r => r[2]).reduce(sum, 0) / count
        console.log(
            'average result', avgTotal.toFixed(2),
            'average wrong true', avgTrue.toFixed(2),
            'average wrong false', avgFalse.toFixed(2)
        )
    }).catch(err => console.log(err))
}
else {
    var words = Object.keys(test)
    var correct = 0
    words.forEach(word => {
        const isWord = solver.test(word)
        if (isWord === test[word]) {
            correct++
        }
        else {
            console.log('fail', word, test[word], isWord)
        }
    })
    console.log('correctness', correct + '%')
}
