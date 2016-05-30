const exec = require('child_process').exec;
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require('fs'));
exports.fs = fs;

const gzip = (filePath, gzPath) => 
    new Promise((resolve, reject) =>
        exec(`rm -f ${gzPath}; 7z a -mx=9 ${gzPath} ${filePath}`, (err, so, se) =>
            err ? reject(se) : resolve(so)));

exports.gzip = gzip;
            
exports.deleteFile = filePath => 
    new Promise((resolve, reject) =>
        exec(`rm -f ${filePath}`, (err, so, se) =>
            err ? reject(se) : resolve(so)));

const tempPath = `temp/e`;
exports.writeGzipped = (path, data) => fs.writeFileAsync(tempPath, data, 'ascii').then(() =>
    new Promise((resolve, reject) =>
        exec(`rm -f ${path} && 7z a -mx=9 ${path} ${tempPath} && rm -f ${tempPath}`, (err, so, se) =>
            err ? reject(se) : resolve(so))));
    

function commonSize(a, b) {
    for (var i = 0; a[i] === b[i]; ++i);
    return i;    
}
    
exports.fileSize = path => Math.round(fs.statSync(path).size / 10.24) / 100 + 'KiB';

exports.commonSize = commonSize;

const chainer = (prev, cur) => prev + cur;

exports.compress = (arr, wordLength) => {
    //arr = arr.map(el => el.split('').reverse().join('')).sort();
    const len = arr.length;
    const data = new Array(len);
    data[0] = arr[0];
    for (let i = 1; i < len; ++i) {
        const word = arr[i];
        const cs = commonSize(arr[i - 1], word);
        data[i] = `${cs < wordLength - 1 || word.startsWith(arr[i-1]) ? cs : ''}${word.slice(cs)}`;
    }
    return data.reduce(chainer);
};