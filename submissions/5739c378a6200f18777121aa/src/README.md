# Words Classifier

## Prepare the dictionary

Reduce and normalize the dictionary:

```sh
$ sort -fu words.txt | tr A-Z a-z > words.txt
```

## The Bloom's filter

We have to find an optimal size of bits array and number of hash functions.

```
k = m / n * Ln2
```

`k` - number of functions, `m` - size of bits array, `n` - size of the dictionary.

11000 / Ln2 = m

As a hash function I'll pick a function which finds threegrams in the given word and mark the corresponding bit in the bits array of all english threegrams.

Size of the bits array is: 26^3 = 17576. I have one hash function, so optimal size of the bits array is 414363.

For the whole dictionary seems the optimal bitmap is enourmous big.

I think I can split the dictionary into several independant.

```sh
$ for letter in {a..z} ; do sed -n "/^${letter}/p" words.txt > words/words_${letter}.txt; done
```

Average size of the dictionary now is 19500, so the optimal size of bits array for one hash function is about 28138 bits. 27^3 = 19683. Seems it's more or less appropriate.

Now I can prepare bitmaps for each filter.

```sh
$ node prepare-bloom.js words
...
```

Now I got `bloom-data.json` which contains an array of bitmaps for each part of the dictionary.

## The main program

First of all, there're some simple observations:

- if the word starts from `'` it's not a word

The program loads `bloom-filter.json` and creates a bunch of filters.

Then it chooses appropriate filter according to the first letter in the word and test the latter using the filter.

That's it.

## Tests

I use the following test:

```js
var http = require('follow-redirects').http;
var fs = require('fs');
var zlib = require('zlib');

var mod = require('./dst/index.js');
var data = fs.readFileSync('./bloom-data.json.gz');

mod.init(zlib.gunzipSync(data));

http.get('http://www.hola.org/challenges/word_classifier/testcase', function(res) {
    var body = '';

    res.on('data', function(chunk) {
        body += chunk;
    });
    res.on('end', function() {
        const tests = JSON.parse(body);
        const words = Object.keys(tests);

        console.log(
            words.map(function(word) {
                return mod.test(word) === tests[word];
            }).filter(Boolean).length / words.length * 100 + '%'
        );
    });
});

```
