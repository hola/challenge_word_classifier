'use strict';

const fs = require('fs');
const random = require('./../application/helpers/random');

let application = require('./../application');

/**
 * With this script we can build data for tests running.
 */
function main() {
  let root = `${__dirname}/..`;

  // prepare dictionary
  let raw = fs.readFileSync(`${root}/words.txt`, 'utf8');
  let dictionary = raw.split("\n").map(word => {
    return application.format(word);
  });

  // prepare broken words
  let broken = [];
  for (let file of fs.readdirSync(`${root}/data/cases/train`).sort()) {
    let fixture = JSON.parse(fs.readFileSync(`${root}/data/cases/train/${file}`, 'utf8'));
    for (let string in fixture) {
      if (fixture.hasOwnProperty(string) && fixture[string] === false) {
        broken.push(application.format(string));
      }
    }
  }

  // build data and encode
  let result = application.build(dictionary, broken).encode();

  // save new content
  fs.writeFileSync(`${root}/data/data`, result);
}

process.exit(main() || 0);
