'use strict';

const fs = require('fs');
const zlib = require('zlib');

function main() {
  let root = `${__dirname}/..`;

  // load solution
  let solution = require(`${root}/application/solution.js`);
  let data = fs.readFileSync(`${root}/data/data`);

  // initialize solution
  solution.init(data);

  // test solution
  let global_score = 0, total = 0, total_count = 0, total_correct = 0, total_incorrect = 0;
  for (let file of fs.readdirSync(`${root}/data/cases/test`).sort()) {
    let fixture = JSON.parse(fs.readFileSync(`${root}/data/cases/test/${file}`, 'utf8'));
    let score = 0;
    for (let word in fixture) {
      let correct = fixture[word];
      let result = solution.test(word);
      if (result == correct) {
        score++;
        global_score++;
      } else {
        correct ? total_correct++ : total_incorrect++;
      }
    }

    total++;
  }

  console.log(`Total score: ${global_score / total}%`);
  console.log(`Total words: ${total_count}`);
  console.log(`Total correct answers: ${global_score}`);
  console.log(`Errors for correct words: ${total_correct}`);
  console.log(`Errors for incorrect words: ${total_incorrect}`);
}

process.exit(main() || 0);
