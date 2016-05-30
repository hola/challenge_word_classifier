'use strict';

const request = require('request');
const pace = require('pace');
const fs = require('fs');

const makeRequest = () => new Promise((resolve, reject) => {
  request('https://hola.org/challenges/word_classifier/testcase', (error, response, body) => {
    if (error) {
      reject(error);
    }
    const { path } = response.request.uri;
    const testCaseId = path.split('/').pop();
    fs.writeFileSync(`./test-cases/hola-${testCaseId}.json`, body);
    resolve();
  });
});

let totalFiles = +process.argv[2];
let fetchedFiles = 0;

let progressTracker = pace(totalFiles);

const fetchNextFile = () => {
  makeRequest().then(result => {
    progressTracker.op();
    fetchedFiles++;
    if (fetchedFiles >= totalFiles) {
      return;
    }
    fetchNextFile();
  }, error => {
    console.error('Everything failed', error);
  });
};

fetchNextFile();
