const fs = require('fs');
const exec = require('child_process').execSync;

let solution = fs.readFileSync('sol_data2.min.js').toString();

const prefixes = fs.readFileSync('prefixes_new.txt').toString().trim(),
      bloom_base64 = fs.readFileSync('bloom_base64.txt').toString().trim(),
      mBloom = (1 << 19);

solution = solution
    .replace('{mBloom}', mBloom.toString())
    .replace('{bloom_base64.txt}', bloom_base64)
    .replace('{prefixes_new.txt}', prefixes)
;

fs.writeFileSync('data', solution);

fs.unlinkSync('data.gz');
exec('"C:\\Program Files\\7-Zip\\7z.exe" a -mx=9 -tgzip data.gz data');
