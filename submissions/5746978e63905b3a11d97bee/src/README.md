Basic approach:

* Using the porter2 stemming algorithm, stem all words.
* Create a bloom filter of the stems. 

In addition to this, I assume certain words are bad based on their attributes.  

To save space, most of my JS code is compressed into the data.gz file
(alongside the bloom filter).

The stemming code uses Matt Powell's code from
https://github.com/fauxparse/porter2js.

The bloom filter uses murmurhash v3. I used a port by Derek Perez's of code
originally written by Gary Court, found at
https://www.npmjs.com/package/murmurhash.

All JS code was minimized using Google's Closure Compilter, found at
https://developers.google.com/closure/compiler/.
