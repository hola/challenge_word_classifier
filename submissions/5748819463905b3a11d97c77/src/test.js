
var fs = require('fs');
var vm = require('vm');
var zlib = require('zlib');
var m;

function initialize(filename, data) {

    var text = fs.readFileSync(filename, 'utf8');

    var script = new vm.Script(text, {filename: filename});
    m = {exports: {}};
    var console = Object.create(global.console);
//    console.log = console.info = ()=>{}; // silence debug logging
    console.log(filename);
    var context = vm.createContext({
        module: m,
        exports: m.exports,
        console: console,
        Buffer: Buffer,
    });
    context.global = context;
    script.runInContext(context);
    if (m.exports.init)
    {
        if (data)
        {
            context['data'] = {value: data};
            vm.runInContext(m.exports.init(data), context);
        }
        else
            vm.runInContext(m.exports.init(), context);
    } else if (data)
        throw new Error('data supplied but no init function');

    return context;
}

function test(context, word) {
    return !!vm.runInContext(m.exports.test(word), context);
}

function main(target, testcases) {
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
//    if (process.version != 'v6.0.0')
//    {
//        console.error('This script must be run in Node.js v6.0.0');
//        return 1;
//    }
    var data;
    if (fs.existsSync(target + '/data.gz'))
        data = zlib.gunzipSync(fs.readFileSync(target + '/data.gz'));
    else if (fs.existsSync(target + '/data'))
        data = fs.readFileSync(target + '/data');
    var context = initialize(target + '/solution.js', data);
    var global_score = 0, total = 0;

    var tc = JSON.parse(fs.readFileSync('testcase/testcase.js', 'utf8'));
    var score = 0;
    for (var word in tc)
    {
        var correct = tc[word];
        var res = test(context, word);
        if (res == correct)
        {
            score++;
            global_score++;
        } else {
            console.log('! ' + word + ' ' + correct);
        }
    }
    total++;

    console.log(global_score / total + ' %');
}

process.exit(main(process.argv[2], process.argv[3]) || 0);