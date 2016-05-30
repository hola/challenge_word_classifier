var Encode = require('./encode')
var tree = {}

const GZIPPED = require('./config').GZIPPED

var zlib = require('zlib')
var fs = require('fs')

function withWords(onLine, onEnd) {
    var lineReader = require('readline').createInterface({
        input: fs.createReadStream('words.txt')
    })

    lineReader.on('line', function (line) {
        onLine(line.toLowerCase())
    })

    lineReader.on('close', () => {
        onEnd()
    })
}

withWords(line => Encode.insert(tree, line), () => {
    const tables = Encode.tables(tree)
    const tablesModule = 'module.exports = ' + JSON.stringify(tables)
    fs.writeFileSync('tables.js', tablesModule)
    const buffer = Buffer.from(Encode.serialize(tree, tables))
    if (GZIPPED) {
        fs.writeFileSync('dict', zlib.gzipSync(buffer))
    }
    else {
        fs.writeFileSync('dict', buffer)
    }
})
