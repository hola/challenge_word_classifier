'use strict';

const fs = require('fs');
const zlib = require('zlib');
const gzip = zlib.createGzip({level: 9});

let az      = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',"'"];
let primes  = [3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59,61,67,71,73,79,83,89,97,101,103,107,109,113,127,131,137];

let size = 6;

makeBits();

function getHash(word){
    let ch = word.substr(0, 6),
        ret = 0;

    ch.split('').forEach( (l, i) => {
        let p_code = primes[i],
            l_code = az.indexOf(l) < 25 ? primes[az.indexOf(l)] : primes[az.indexOf(l) - 5] - 1,
            w_code = primes[word.length];

        ret += Math.round( Math.pow(p_code, 3.35) * l_code);
    });

    ret = Math.round( ret / 3.9 );

    return ret;
}

function makeBits(){
    let words   = JSON.parse( fs.readFileSync('./json/words_uq_clean.json') );

    let set = new Set();

    words.forEach( w => {
        if (w.length < 15) {
            set.add( getHash(w) );
        }
    });

    let arr = [...set];

    arr.sort( (a, b) => {
        if ( parseInt(a) > parseInt(b) ) return 1;
        else if ( parseInt(a) < parseInt(b) ) return -1;

        return 0;
    });

    console.log(words.length,  '=>', arr.length);
    console.log('Верных: ', (arr.length / words.length).toFixed(3) );
    console.log('Размер: ', (arr[arr.length - 1] / 1024).toFixed()  );
    // console.log( (arr.length / arr[arr.length - 1]).toFixed(5) );


    if (arr[arr.length - 1] < 30 * 1000 * 1000) {
        let str = '',
            last = arr[arr.length - 1];

        for (let i = 0; i < last; i++) {
            str += set.has(i) ? 1 : 0;
        }

        str = str.substr(0, str.length - 43000);

        let pos = str.lastIndexOf('1');

        str = str.substr(0, pos + 1)

        fs.writeFile('data', str , function(){
            let inp = fs.createReadStream('data');
            let out = fs.createWriteStream('data.gz');

            inp.pipe(gzip).pipe(out);
        });
    }
}