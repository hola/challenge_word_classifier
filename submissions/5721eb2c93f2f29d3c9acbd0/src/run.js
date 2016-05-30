const mod = require('./mod.js');
const create = require('./createbits.js');

const zlib = require('zlib');

const fs = require('fs');

//const testwords = ['test','test123','abrakadabra','abc','abcd'];

const words = fs.createReadStream('words.txt');
const falsewords = fs.createReadStream('falsewords.txt');

var count = 0;

var data = "";
words
    .on('data',function(chunk){data += chunk.toString();})
    .on('end', function(){
	out = fs.createWriteStream('bits.txt.gz');
	bits = create.add(data);
	compress = zlib.createGzip(); 
	
	compress.on('end', function(){
	    const inp = fs.createReadStream('bits.txt.gz');
	
	    var inpbits = "";
	    inp.pipe(zlib.createGunzip())
    		.on('error',function(err){ console.log(err);})
        	.on('data',function(chunk){inpbits+=chunk;})
	        .on('end',function(){
	    	    mod.init(inpbits);
	    	    
	    	    fwdata = "";
	    	    falsewords
	    		.on('data',function(chunk){fwdata+=chunk})
	    		.on('end',function(){
	    		    fwdata.split('\n').forEach(function(word){
	    			word = word.trim();
	    			if (word.length>0){
	    			    result = mod.test(word);
	    			    if (result){
	    				console.log(word, result);
	    				count++;
	    			    }
	    			}
	    		    });
	    		    console.log(count);
	    		});
	    	});
	});
	
	compress.pipe(out);
	compress.write(''+bits[0]);
	for (var i=1; i<bits.length; i++){
	    compress.write(','+bits[i]);
	}
	compress.end();
    });







