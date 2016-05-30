var fs = require('fs')
var dirname = './training_sample'
var files = fs.readdirSync(dirname)
var nw = {}
files.forEach(f=>{
    var testcase = JSON.parse(fs.readFileSync(dirname + "/" + f, "utf-8"))
    Object.keys(testcase).forEach(w=>{
        if (!testcase[w])
            if (nw[w] == null) {
                nw[w] = 1
            } else {
                nw[w]++
            }
    })
})
fs.writeFileSync('./nonwords.json', JSON.stringify(nw))