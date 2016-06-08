'use strict'; /*jslint node:true*/
const assert = require('assert');
const cluster = require('cluster');
const events = require('events');
const fs = require('fs');
const generator = require('./generator.js');
const loader = require('./loader.js');
const getopt = require('node-getopt').create([
    ['w', 'words=WORDLIST', 'alternative wordlist location'],
    ['t', 'text=STRING', 'seed string'],
    ['s', 'start=N', 'starting seed'],
    ['o', 'output=FILE', 'write testing result to FILE (JSON)'],
    ['i', 'intermediate=N', 'write intermediate results every N blocks'],
    ['r', 'restart', 'restart solutions to avoid duplicates'],
    ['b', 'both', 'run each solution in both restart and non-restart mode'],
    ['u', 'unsafe', 'use unsafe solution loader without VM'],
    ['f', 'force', 'override Node.js version check'],
    ['q', 'quiet', 'no console output'],
    ['h', 'help', 'display this help'],
]).setHelp(`Usage: node test2.js [OPTION] N SOLUTION [SOLUTION...]

[[OPTIONS]]

Either --text or --start must be specified. In the former case, the text
is used to generate a repeatable pseudo-random sequence of block seeds.
In the latter case, block seeds start with the specified number and proceed
in increments of 1.

N: Number of 100-word blocks to test on.
SOLUTION: A directory with a solution to run.
All specified solutions will be tested in parallel.`).bindHelp();

function*straight(n){
    while (true)
        yield n++;
}

class Solution extends events.EventEmitter {
    constructor(dir, unsafe, restart){
        super();
        this.dir = dir;
        this.unsafe = !!unsafe;
        this.allow_restart = !!restart;
        this.worker = undefined;
        this.ready = false;
        this.dead = undefined;
        this.block = undefined;
        this.started = undefined;
        this.total_time = 0;
        this.total = this.correct = this.false_neg = this.false_pos = 0;
        this.false_pos_by_model = [];
        for (let i = 0; i<=generator.MAX_DEPTH; i++)
            this.false_pos_by_model[i] = 0;
        this.restart();
    }
    test(block){
        assert(!this.dead && this.ready);
        this.ready = false;
        this.block = block;
        this.started = Date.now();
        this.worker.send(Object.keys(block));
    }
    onmessage(msg){
        switch (msg.type)
        {
        case 'ready':
            assert(!this.block);
            this.ready = true;
            this.emit('ready');
            break;
        case 'result':
            assert(!this.dead && !this.ready && this.block);
            this.total_time += Date.now()-this.started;
            let i = 0;
            for (let word of Object.keys(this.block))
            {
                let info = this.block[word];
                let answer = msg.data[i++];
                this.total++;
                if (!answer && info.real)
                    this.false_neg++;
                else if (answer && !info.real)
                {
                    this.false_pos++;
                    this.false_pos_by_model[info.model]++;
                }
                else
                    this.correct++;
            }
            this.block = undefined;
            this.ready = true;
            this.emit('ready');
            break;
        case 'error':
            assert(!this.ready);
            this.ready = false;
            this.dead = msg.err;
            this.emit('dead');
            break;
        }
    }
    onerror(err){
        this.ready = false;
        this.dead = err.toString();
        this.emit('dead');
    }
    ondisconnect(){
        this.ready = false;
        this.dead = this.dead||'disconnect';
        this.emit('dead');
    }
    onexit(code, signal){
        this.ready = false;
        if (!this.dead || this.dead=='disconnect')
            this.dead = signal||`exit ${code}`;
        this.emit('dead');
    }
    restart(){
        if (this.worker && !this.allow_restart)
            return;
        this.kill();
        this.ready = false;
        this.dead = undefined;
        this.worker = cluster.fork({dir: this.dir, unsafe: +this.unsafe});
        this.worker.on('message', this.onmessage.bind(this));
        this.worker.on('error', this.onerror.bind(this));
        this.worker.on('disconnect', this.ondisconnect.bind(this));
        this.worker.on('exit', this.onexit.bind(this));
    }
    kill(){
        if (!this.worker)
            return;
        this.worker.removeAllListeners();
        this.worker.kill();
        this.worker = undefined;
    }
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
    if (!opt.options.force && process.version!='v6.0.0')
    {
        console.error(
            'Run this script with Node.js v6.0.0 or use --force to override');
        return 1;
    }
    if (opt.argv.length<2)
        return getopt.showHelp();
    let intermediate = opt.options.intermediate|0;
    let wordlist = opt.options.words||
        fs.realpathSync(`${__dirname}/../words.txt`);
    if (!opt.options.quiet)
        console.log(`Initializing with ${wordlist}`);
    let words = fs.readFileSync(wordlist, 'utf8').slice(0, -1).split('\n');
    generator.init(words);
    let block = 0, n = +opt.argv.shift();
    let expect = opt.argv.length;
    let solutions = [];
    for (let dir of opt.argv)
    {
        if (opt.options.both || !opt.options.restart)
            solutions.push(new Solution(dir, opt.options.unsafe, false));
        if (opt.options.both || opt.options.restart)
            solutions.push(new Solution(dir, opt.options.unsafe, true));
    }
    let seen = new Set();
    for (let solution of solutions)
    {
        solution.on('ready', advance);
        solution.on('dead', advance);
    }
    let last_report = 0;
    let delayed_seed = undefined;
    let total = 0, real = 0, fake = 0, fake_by_model = [], restarts = 0;
    let result = solutions.map(solution=>({
        solution: solution.dir,
        restart: solution.allow_restart,
        intermediate: intermediate ? [] : undefined,
        final: undefined,
    }));
    for (let i = 0; i<=generator.MAX_DEPTH; i++)
        fake_by_model[i] = 0;
    function advance(){
        let waiting = 0, alive = 0;
        for (let solution of solutions)
        {
            if (!solution.ready && !solution.dead)
                waiting++;
            if (!solution.dead)
                alive++;
        }
        if (!alive)
            return finish();
        if (waiting)
            return;
        let seed = delayed_seed;
        delayed_seed = undefined;
        if (seed===undefined)
        {
            let now = Date.now();
            if (now-last_report>=1000)
            {
                last_report = now;
                report();
            }
            if (block==n)
                return finish();
            if (block && intermediate && block%intermediate==0)
                save_result(false);
            seed = seeds.next().value;
            block++;
        }
        let tc = generator.generate(seed);
        if (opt.options.restart || opt.options.both)
        {
            let restart = false;
            for (let word in tc)
            {
                if (seen.has(word))
                {
                    restart = true;
                    break;
                }
                seen.add(word);
            }
            if (restart)
            {
                restarts++;
                seen.clear();
                for (let solution of solutions)
                {
                    if (!solution.dead)
                        solution.restart();
                }
                delayed_seed = seed;
                return;
            }
        }
        for (let word in tc)
        {
            let info = tc[word];
            total++;
            if (info.real)
                real++;
            else
            {
                fake++;
                fake_by_model[info.model]++;
            }
        }
        for (let solution of solutions)
        {
            if (!solution.dead)
                solution.test(tc);
        }
    }
    function finish(){
        for (let solution of solutions)
        {
            if (!solution.dead)
                solution.kill();
        }
        save_result(true);
        report();
        process.exit(0);
    }
    function pad(s, len){
        s = s.toString();
        return s.length<len ? ' '.repeat(len-s.length)+s : s;
    }
    function percent(part, whole){
        if (!whole)
            return '        ';
        return pad((100*part/whole).toFixed(2)+'%', 8);
    }
    function integer(n){
        let res = Math.round(n).toString();
        if (res.length>12)
            return pad(Math.round(n/1e9)+'G', 8);
        if (res.length>9)
            return pad(Math.round(n/1e6)+'M', 8);
        if (res.length>6)
            return pad(Math.round(n/1e3)+'k', 8);
        return pad(res, 8);
    }
    function report(){
        if (opt.options.quiet)
            return;
        console.log('\x1b[2J\x1b[0f'); // clear screen
        console.log(`Tested ${block} of ${n} blocks`);
        if (opt.options.restart || opt.options.both)
            console.log(`Restarts: ${restarts}`);
        let line = '\n   Total       W      NW';
        for (let i = 0; i<=generator.MAX_DEPTH; i++)
            line += `   NW[${i}]`;
        console.log(line);
        line = integer(total)+integer(real)+integer(fake);
        for (let i = 0; i<=generator.MAX_DEPTH; i++)
            line += integer(fake_by_model[i]);
        console.log(line);
        line = '\n Correct      F-      F+';
        for (let i = 0; i<=generator.MAX_DEPTH; i++)
            line += `   F+[${i}]`;
        line += ' ms/100w';
        console.log(line);
        for (let solution of solutions)
        {
            console.log(solution.allow_restart ? '\n(R)' : '\n   ',
                solution.dir);
            if (solution.dead)
            {
                console.log(solution.dead);
                continue;
            }
            let line = percent(solution.correct, total);
            line += percent(solution.false_neg, real);
            line += percent(solution.false_pos, fake);
            for (let i = 0; i<=generator.MAX_DEPTH; i++)
            {
                line += percent(solution.false_pos_by_model[i],
                    fake_by_model[i]);
            }
            if (total)
                line += integer(solution.total_time/block);
            console.log(line);
        }
    }
    function save_result(final){
        function subtotal_right(right, total){
            let res = {
                right,
                wrong: total-right,
                total,
            };
            if (total)
            {
                res.right_rate = 100*right/total;
                res.wrong_rate = 100 - 100*right/total;
            }
            return res;
        }
        function subtotal_wrong(wrong, total){
            let res = {
                right: total-wrong,
                wrong,
                total,
            };
            if (total)
            {
                res.right_rate = 100 - 100*wrong/total;
                res.wrong_rate = 100*wrong/total;
            }
            return res;
        }
        for (let i = 0; i<solutions.length; i++)
        {
            let res, solution = solutions[i];
            if (solution.dead)
            {
                if (!final)
                    continue;
                res = {dead: solution.dead};
            }
            else
            {
                res = {
                    total: subtotal_right(solution.correct, total),
                    words: subtotal_wrong(solution.false_neg, real),
                    nonwords: subtotal_wrong(solution.false_pos, fake),
                    nonwords_by_model: [],
                };
                for (let j = 0; j<=generator.MAX_DEPTH; j++)
                {
                    res.nonwords_by_model[j] = subtotal_wrong(
                        solution.false_pos_by_model[j], fake_by_model[j]);
                }
                res.speed = solution.total_time/block;
                if (solution.allow_restart)
                    res.restarts = restarts;
            }
            if (final)
                result[i].final = res;
            else
                result[i].intermediate.push(res);
        }
        if (opt.options.output)
        {
            fs.writeFileSync(opt.options.output,
                JSON.stringify(result, null, 4)+'\n');
        }
    }
}

function worker(){
    process.title = process.env.dir;
    let load = +process.env.unsafe ? loader.load_unsafe : loader.load;
    let classifier;
    try {
        classifier = load(process.env.dir);
    } catch (err){
        process.send({type: 'error', err: err.toString()});
        process.exit(1);
    }
    process.on('message', msg=>{
        try {
            process.send({type: 'result', data: msg.map(classifier)});
        } catch (err){
            process.send({type: 'error', err: err.toString()});
            process.exit(1);
        }
    });
    process.send({type: 'ready'});
}

if (cluster.isMaster)
    main();
else
    worker();
