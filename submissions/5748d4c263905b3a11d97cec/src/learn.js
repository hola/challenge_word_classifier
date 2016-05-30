fs = require('fs');
BloomFilter = require('bloomfilter').BloomFilter;

function learn()
{
    fs.readFile('./words.txt', 'utf8', function(err, data) {
        if (err)
        {
            return console.log(err);
        }
        var strings = data.toLowerCase().split('\n');
        var ocounter = {};
        var gen = "abcdefghijklmnopqrstuvwxyz'";
        
        for (i = 0; i<strings.length; i++)
        {
            var s = strings[i];
            if (s.length<4)
                ocounter[s] = (ocounter[s]||0)+1;
            else for (j = 0; j<=s.length-4; j++)
            {
                var stag = s.substr(j, 4);
                ocounter[stag] = (ocounter[stag]||0)+1;
                break;//just the beginninggram
            }

        }
        var k = Object.keys(ocounter);
        var out = [];
        for (i = 0; i<k.length; i++)
        {
            out.push({key: k[i], data: ocounter[k[i]]});
        }
        out.sort(function(a, b){return a.key.localeCompare(b.key); });
        var sout = out.reduce(function(acc, wrd){
            if (wrd.data>3)
                return acc+wrd.key+'....'.slice(0,4-wrd.key.length);
            if(wrd.key.length<4 && wrd.key.length>=1)
                return acc+wrd.key+'....'.slice(0,4-wrd.key.length);
            return acc;
        }, '');
        // store for future reference for decompression
        console.log('strlen:'+sout.length);
        fs.writeFile('./out_ngrams.txt', sout);
    });
}

function learn_bloomz()
{
    fs.readFile('./words.txt', 'utf8', function(err, data) {
        var strings = data.toLowerCase().split('\n');
        var bloom = new BloomFilter(
          8 * 120000, // number of bits to allocate.
          5          // number of hash functions.
        );
        for (i = 0; i<strings.length; i++)
        {
            bloom.add(strings[i]);
        }
        var buf = new ArrayBuffer(bloom.buckets.length*4);
        var dview = new DataView(buf);
        for (var i=0, j=bloom.buckets.length; i<j; i++)
        {
            dview.setInt32(i*4, bloom.buckets[i]);
        }
        fs.writeFile('./out_bloom.bin', new Buffer(buf), 'binary');
    });   
}

learn();
learn_bloomz();