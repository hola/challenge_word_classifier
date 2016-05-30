(function(){
    var bloomfilter = require('bloomfilter');
    var fs = require('fs');
    var assert = require('assert');

    var FALSE_POSITIVE_RATE = 0.11452;
    var WORD_FILENAME = 'bloom_words.txt';
    var CV_GRAM_FILENAME = 'cv_grams.txt';
    var N_GRAM_FILENAME = 'trigramcompressed.txt';
    var BUFFER_FILENAME = 'data';
 
    var args = process.argv.slice(2);
    var rate_arg = parseFloat(args[0]);
    if (rate_arg && typeof rate_arg === 'number'){
        FALSE_POSITIVE_RATE = rate_arg;
    }

    var buff_bloom = buildBloomBuffer();
    var buff_cv_gram = buildCVGramBuffer();
    var buff_n_gram = buildNGramBuffer(); 
    
    fs.writeFile(BUFFER_FILENAME, Buffer.concat([buff_bloom, buff_cv_gram, buff_n_gram]));
    
    function buildNGramBuffer(){
       return Buffer.from(fs.readFileSync(N_GRAM_FILENAME).toString().trim());

       //var text = fs.readFileSync(N_GRAM_FILENAME).toString().trim(); 
       //var lines = text.split('\n');
       //var size = 4; //initial 4 octets to store size
       ////add size of numbers 32 bits (for floats) => 4 octets per number?
       ////size = size + lines.length * 4;
       //
       //lines.forEach(function(line) {
       //  var lineparts = line.split(/\s+(.+)/); 
       //  var value = lineparts[0];
       //  var str_part = lineparts[1];
       //  console.log(value, str_part);
       //  //size += Buffer.byteLength(line);
       //  size += Buffer.byteLength(str_part);
       //  size += 1; //store the size of this string with one octet
       //});
       //
       //console.log("buffersize for ngram");
       //console.log(size);

       //retbuff = Buffer.alloc(size);
       //var offset = 0;
       //retbuff.writeInt32BE(size, offset);
       //offset += 4; //int 32 has length 4
    } 

    function buildCVGramBuffer(){
       //read cv_gram file
       var text = fs.readFileSync(CV_GRAM_FILENAME).toString().trim(); 
       var lines = text.split('\n');

       var size = 4; //initial 4 octets to store size
       //add size of numbers 32 bits (for floats) => 4 octets per number?
       size = size + lines.length * 4;
       lines.forEach(function(line) {
         var lineparts = line.split(/\s+/); 
         var key = lineparts[0];
         size += Buffer.byteLength(key);
         size += 1; //store the size of this string with one octet
       });
       console.log("buffersize for cvgram");
       console.log(size);

       retbuff = Buffer.alloc(size);
       var offset = 0;
       retbuff.writeInt32BE(size, offset);
       offset += 4; //int 32 has length 4

       lines.forEach(function(line) {
         var lineparts = line.split(/\s+/); 
         var key = lineparts[0];
         value = +(lineparts[1]);
         //console.log("value", value, lineparts[1], lineparts, line);
         assert(!isNaN(value));

         var keylen = Buffer.byteLength(key);
         retbuff.writeInt8(keylen, offset); 
         offset += 1; //int8 is just 1 byte

         retbuff.write(key, offset); 
         offset += keylen;

         retbuff.writeFloatBE(value, offset);
         offset += 4; //float is 4 bytes 
       });
       return retbuff;
    }

    function buildBloomBuffer(){
       //read words file
       var text = fs.readFileSync(WORD_FILENAME).toString().trim();
       var lines = text.split('\n');
       var data_size = lines.length; 
       var bf_size = bloomfilter_size(data_size);
       var n_hash_funcs = hash_funcs_no(bf_size, data_size);

       console.log("Building bloom filter");
       console.log("Data Size,BF Size,No of hash fns");
       console.log(data_size, bf_size, n_hash_funcs);

       var bloom = new bloomfilter.BloomFilter(bf_size, n_hash_funcs);
       lines.forEach(function(line) {
                bloom.add(line);
                });

       //serialize bloomfilter
       var array = [].slice.call(bloom.buckets);
       var arr_len = array.length;
       //append with reconstruction data
       array[arr_len] = n_hash_funcs;

       console.log(array.length);
       var data_buffer = int_array_to_buffer(array);
       return data_buffer;
    } 

    function bloomfilter_size(data_size){
        return Math.ceil(-data_size * Math.log(FALSE_POSITIVE_RATE)/Math.pow(Math.LN2, 2));
    }
    
    function hash_funcs_no(bloomfilter_size, data_size){
        return Math.ceil(bloomfilter_size/data_size * Math.LN2);
    }

    function int_array_to_buffer(array){
        //TODO: assert array is Array
        var size = (array.length + 1)* 4; //each 32 bit int has 4 octets, +1 to store length of buffer
        console.log(size);
        var bb = Buffer.alloc(size);
        bb.writeInt32BE(size, 0);
        array.forEach(function(num, index){
          bb.writeInt32BE(num, (index+1)*4);
        });
        return bb;
    }
})();
