'use strict';

const timer = require('exectimer');
const fs = require('fs');

const testCases = fs.readdirSync('./test-cases').map(path => ({
  id: path,
  data: require(`../test-cases/${path}`),
}));

const testSolution = (name, path) => {
  const globalTimerName = `${name}-total`;
  const testTimerName = `${name}-test`;
  var globalTimer = new timer.Tick(globalTimerName);
  globalTimer.start();
  try {
    const solution = require(`../${path}`);
    let solutionSize = fs.statSync(`${path}/index.js`).size;
    if (solution.init) {
      let data = null;
      if (fs.existsSync(`${path}/data.bin`)) {
        data = fs.readFileSync(`${path}/data.bin`);
        solutionSize += data.buffer.byteSize;
      }
      solution.init(data);
    }
    if (!solution.test) {
      return {
        status: 'failed',
        message: 'no test function supplied',
        duration: 0,
      };
    }
    let scores = {};
    let totalScore = 0;
    var testTimer = new timer.Tick(testTimerName);
    for (const testCase of testCases) {
      let testCaseData = testCase.data;
      let correctAnswerCount = 0;
      let words = Object.keys(testCaseData);
      testTimer.start();
      for (const word of words) {
        const desiredResult = testCaseData[word];
        const actualResult = solution.test(word);
        if (desiredResult === actualResult) {
          correctAnswerCount++;
        }
      }
      testTimer.stop();
      const score = correctAnswerCount / words.length;
      scores[testCase.id] = score;
      totalScore += score;
    }
    globalTimer.stop();
    return {
      status: 'done',
      scores,
      solutionSize,
      totalDuration: timer.timers[globalTimerName].duration(),
      durationPerTest: timer.timers[testTimerName].mean(),
      totalScore: totalScore / testCases.length,
      testCount: testCases.length,
    }
  } catch (error) {
    globalTimer.stop();
    return {
      error,
      status: 'failed',
      message: 'execution failed',
      duration: timer.timers[globalTimerName].duration(),
    };
  }
};

const taskName = process.argv[2];
const result = testSolution(taskName, `./solutions/${taskName}`);
console.log('r', result);
