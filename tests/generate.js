// LICENSE_CODE ZON
'use strict'; /*jslint node:true*/
const fs = require('fs');
const rimraf = require('rimraf');
const mkdir_parents = require('mkdir-parents');
const generator = require('./generator.js');
const getopt = require('node-getopt').create([
    ['w', 'words=WORDLIST', 'alternative wordlist location'],
    ['t', 'text=STRING', 'seed string'],
    ['s', 'start=N', 'starting seed'],
    ['v', 'verbose', 'log names of files written to'],
    ['h', 'help', 'display this help'],
]).setHelp(`Usage: node generate.js [OPTION] N TARGET

[[OPTIONS]]

Either --text or --start must be specified. In the former case, the text
is used to generate a repeatable pseudo-random sequence of block seeds.
In the latter case, block seeds start with the specified number and proceed
in increments of 1.

N: Number of 100-word blocks to generate.
TARGET: The directory where to put the destcases.
The TARGET directory will be deleted and re-created!`).bindHelp();

function*straight(n){
    while (true)
        yield n++;
}

function main(){
    let opt = getopt.parseSystem();
    let seeds;
    if ('text' in opt.options && 'start' in opt.options)
        throw new Error('Conflicting command-line options');
    if ('text' in opt.options)
        seeds = generator.sequence(opt.options.text);
    else if ('start' in opt.options)
    {
        let start = +opt.options.start;
        if (!Number.isFinite(start))
            throw new Error('N must be a number');
        seeds = straight(start);
    }
    else
        return getopt.showHelp();
    if (opt.argv.length!=2)
        return getopt.showHelp();
    let n = +opt.argv[0], target = opt.argv[1];
    rimraf.sync(target, {glob: false});
    mkdir_parents.sync(target);
    let wordlist = opt.options.words||
        fs.realpathSync(`${__dirname}/../words.txt`);
    if (opt.options.verbose)
        console.log(`Initializing with ${wordlist}`);
    let words = fs.readFileSync(wordlist, 'utf8').slice(0, -1).split('\n');
    generator.init(words);
    let i = 1, width = n.toString().length;
    for (let seed of seeds)
    {
        let tc = generator.generate(seed);
        for (let word in tc)
            tc[word] = tc[word].real;
        let name = i.toString();
        while (name.length<width)
            name = '0'+name;
        name = `${target}/${name}-${seed}.json`;
        if (opt.options.verbose)
            console.log(name);
        fs.writeFileSync(name, JSON.stringify(tc, null, 4)+'\n');
        if (++i>n)
            break;
    }
}

main();
