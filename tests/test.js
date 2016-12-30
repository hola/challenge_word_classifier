'use strict'; /*jslint node:true*/
const fs = require('fs');
const loader = require('./loader.js');

function main(target, testcases){
    if (!target || !testcases)
    {
        console.log('Usage: node SOLUTION_DIR TESTCASE_DIR');
        console.log('SOLUTION_DIR: path to the directory containing:');
        console.log('    solution.js: main solultion program');
        console.log('    data or data.gz (optional): extra data file');
        console.log('        (if named data.gz, gunzip before use)');
        console.log('TESTCASE_DIR: path to the directory full of JSON files,');
        console.log('each containing one test block (100 words) obtained');
        console.log('from the testcase generator.');
        return 1;
    }
    if (process.version!='v6.0.0')
    {
        console.error('This script must be run in Node.js v6.0.0');
        return 1;
    }
    let classifier = loader.load(target);
    let global_score = 0, total = 0;
    for (let file of fs.readdirSync(testcases).sort())
    {
        let tc = JSON.parse(fs.readFileSync(`${testcases}/${file}`, 'utf8'));
        let score = 0;
        for (let word in tc)
        {
            if (classifier(word)==tc[word])
            {
                score++;
                global_score++;
            }
            total++;
        }
    }
    console.log(`${100 * global_score/total}%`);
}

process.exit(main(process.argv[2], process.argv[3])||0);
