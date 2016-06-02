'use strict';
const fs = require('fs');
const vm = require('vm');
const zlib = require('zlib');

module.exports = {load, load_unsafe};

function load(dir){
    let data;
    if (fs.existsSync(`${dir}/data.gz`))
        data = zlib.gunzipSync(fs.readFileSync(`${dir}/data.gz`));
    else if (fs.existsSync(`${dir}/data`))
        data = fs.readFileSync(`${dir}/data`);
    let script = `${dir}/solution.js`;
    const id = '__hola_xyzzy__';
    let text = fs.readFileSync(script, 'utf8');
    // strip BOM and/or shebang
    text = text.slice(/^\ufeff?(#![^\r\n]*)?/.exec(text)[0].length);
    let m = {exports: {}};
    let console = Object.create(global.console);
    console.log = console.info = ()=>{}; // silence debug logging
    let context = vm.createContext({
        module: m,
        exports: m.exports,
        console,
        Buffer,
    });
    context.global = context;
    vm.runInContext(
        `(function(exports, module){${text}}).call(exports, exports, module);`,
        context, {filename: script});
    if (m.exports.init)
    {
        Object.defineProperty(context, id, {value: data});
        vm.runInContext(`module.exports.init(${id})`, context);
    }
    else if (data)
        throw new Error('data supplied but no init function');
    return word=>!!vm.runInContext(`module.exports.test("${word}")`, context);
}

function load_unsafe(dir){
    let data;
    if (fs.existsSync(`${dir}/data.gz`))
        data = zlib.gunzipSync(fs.readFileSync(`${dir}/data.gz`));
    else if (fs.existsSync(`${dir}/data`))
        data = fs.readFileSync(`${dir}/data`);
    let m = require(fs.realpathSync(`${dir}/solution.js`));
    if (m.init)
        m.init(data);
    else if (data)
        throw new Error('data supplied but no init function');
    return word=>!!m.test(word);
}
