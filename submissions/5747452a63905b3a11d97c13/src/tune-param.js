'use strict';

const min = 0;
const max = 50;
const step = 1;

const spawn = require('child_process').spawnSync;

for (let val = min; val <= max; val += step) {
    console.log('TEST: %d', val);
    spawn(process.argv[0], ['build', '--val=' + val], { stdio: 'inherit' });
    spawn(process.argv[0], ['test', '--dist', '--folder=l1'], { stdio: 'inherit' });
}
