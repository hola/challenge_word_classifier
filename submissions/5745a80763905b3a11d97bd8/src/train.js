'use strict'; /*jslint node:true*/
const fs = require('fs');
const vm = require('vm');
const zlib = require('zlib');
var readline = require('readline');

function initialize(filename, buckets, hashes){
    const id = '__hola_xyzzy__';
    let text = fs.readFileSync(filename, 'utf8');
    let script = new vm.Script(text, {filename: filename});
    let m = {exports: {}};
    let console = Object.create(global.console);
    // console.log = console.info = ()=>{}; // silence debug logging
    let context = vm.createContext({
        module: m,
        exports: m.exports,
        console,
        Buffer,
    });
    context.global = context;
    script.runInContext(context);
    if (m.exports.initTrain && buckets)
    {
        vm.runInContext(`module.exports.initTrain(${buckets}, ${hashes})`, context);
    } else
        throw new Error('Could not init for training');
    return context;
}

function train(context, word){
    return !!vm.runInContext(`module.exports.train("${word}")`, context);
}

function main(target, words){
    if (!target || !words)
    {
        console.log('Usage: node SOLUTION_DIR WORD_DIR');
        console.log('SOLUTION_DIR: path to the directory containing:');
        console.log('    solution.js: main solultion program');
        console.log('WORD_DIR: path to the directory contraining:');
        console.log('    words.txt: all valid english word');
        return 1;
    }
    if (process.version!='v6.0.0')
    {
        console.error('This script must be run in Node.js v6.0.0');
        return 1;
    }
    // let context = initialize(`${target}/solution.js`,  45013);
    // let context = initialize(`${target}/solution.js`,  43499);
    let context = initialize(`${target}/solution.js`,  43291);
    var rd = readline.createInterface({
        input: fs.createReadStream(`${words}/words.txt`),
        output: process.stdout,
        terminal: false
    });
    rd.on('line', function(word) {
        train(context, word);
    });
    rd.on('close', function(){
        console.log("Done");
        var data = vm.runInContext(`module.exports.data()`, context);
        fs.writeFile(`${target}/data`, data, function(err) {
            if(err) {
                console.log('Could not write to file with error:', err);
            }
        });
    });
}

main(process.argv[2], process.argv[3])