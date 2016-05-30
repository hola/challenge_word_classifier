'use strict';

const fs = require('fs');
const request = require('sync-request');
const random = require('./../application/helpers/random');

let application = require('./../application');

/**
 * With this script we can load $count number of case files via hola.com api.
 * @param count {number}
 */
function main(count) {
  count || (count = 1);

  let root = `${__dirname}/..`;

  console.log(`Begin loading of ${count} cases...`);
  for (let i = 0; i < count; i++) {
    let number = random(1, 9999999999);
    var response = request('GET', `http://hola.org/challenges/word_classifier/testcase/${number}`);
    fs.writeFileSync(`${root}/data/cases/train/${number}.json`, response.getBody());
    console.log(`Case with number ${number} was saved (${i + 1} of ${count})`);
  }
}

process.exit(main(process.argv[2]) || 0);
