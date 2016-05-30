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
    //console.log = console.info = ()=>{}; // silence debug logging
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

function main(target){
    if (!target)
    {
        console.log('Usage: gzip.js file');
        return 1;
    }
    if (process.version!='v6.0.0')
    {
        console.error('This script must be run in Node.js v6.0.0');
        return 1;
    }
    let data = zlib.gzipSync(fs.readFileSync(`${target}`));
    fs.writeFileSync(`${target}.gz`,data);
    console.log(`ok`);
}

process.exit(main(process.argv[2])||0);
