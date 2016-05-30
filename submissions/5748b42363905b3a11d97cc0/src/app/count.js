const jsonfile = require('jsonfile')

const reportFile = '../report.json'


getReport()

function getReport () {
  let report = jsonfile.readFileSync(reportFile)
  let maxAverage = 0
  let maxSet = ''

  for(var v in report) {
    if(report[v] > maxAverage) {
      maxAverage = report[v]
      maxSet = v
    }
  }

  console.log(maxSet, maxAverage)
}