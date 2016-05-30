const fs = require('fs');

let data1 = JSON.parse(fs.readFileSync('data1').toString());
let data2 = JSON.parse(fs.readFileSync('data3').toString());

let buf = Buffer.from(JSON.stringify({
    a: data1,
    b: data2
}));

fs.writeFileSync('data', buf);
