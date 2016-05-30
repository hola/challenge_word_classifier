'use strict'; /*jslint node:true*/
const fs = require('fs');
const vm = require('vm');
const zlib = require('zlib');

function initialize(filename, data){
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
    if (m.exports.init)
    {
        if (data)
        {
            Object.defineProperty(context, id, {value: data});
            vm.runInContext(`module.exports.init(${id})`, context);
        }
        else
            vm.runInContext(`module.exports.init()`, context);
    } else if (data)
        throw new Error('data supplied but no init function');
    return context;
}

function test(context, word){
    return !!vm.runInContext(`module.exports.test("${word}")`, context);
}

function finalize(context){
    return vm.runInContext(`module.exports.finalize ? module.exports.finalize() : true`, context);
}

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
        console.warn('Note: This script will be run in Node.js v6.0.0 by competition organizers when reviewing submitted solutions');
        // console.error('This script must be run in Node.js v6.0.0');
        // return 1;
    }
    let data;
    if (fs.existsSync(`${target}/data.gz`))
        data = zlib.gunzipSync(fs.readFileSync(`${target}/data.gz`));
    else if (fs.existsSync(`${target}/data`))
        data = fs.readFileSync(`${target}/data`);

    let falsely_accused = 0
    let missed_falsifications = 0

    let true_word_count = 0
    let false_word_count = 0

    let context = initialize(`${target}/solution.js`, data);
    let global_score = 0, total = 0;
    for (let file of fs.readdirSync(testcases).sort())
    {
        // Filter out .DS_Store file (those Macs...)
        if (file === '.DS_Store')
        {
            continue
        }

        let tc = JSON.parse(fs.readFileSync(`${testcases}/${file}`, 'utf8'));
        let score = 0;
        for (let word in tc)
        {
            let correct = tc[word];

            if (correct)
            {
                true_word_count++
            }
            else
            {
                false_word_count++
            }

            let res = test(context, word);
            if (res==correct)
            {
                score++;
                global_score++;
            }
            else
            {
                if (correct)
                {
                    falsely_accused++
                }
                else
                {
                    missed_falsifications++
                }
            }
            total++;
        }
    }
    fs.writeFileSync('./log.txt', finalize(context));
    console.log(`Falsely accused: ${Math.round(100 * 100 * falsely_accused/true_word_count) / 100}%`);
    console.log(`Missed falsifications: ${Math.round(100 * 100 * missed_falsifications/false_word_count) / 100}%`);
    console.log(`${Math.round(100 * 100 * global_score/total) / 100}%`);
}

process.exit(main(process.argv[2], process.argv[3])||0);
