const fs = require('fs');

var file = fs.readFileSync('newFile.txt');
file = file.toString();

// Разбивка файла по строкам
var words = file.split('\n');

function Bits()
{
    var bits = [];

    function get() 
    {
    	return bits;
    }
   
    function test(index)
    {
        return (bits[Math.floor(index / 32)] >>> (index % 32)) & 1;
    }
    
    function set(index)
    {
        bits[Math.floor(index / 32)] |= 1 << (index % 32);
    }
    
    return {test: test, set: set, get: get};
}

function Hash()
{
    var seed = Math.floor(0.5712270436863003 * 32) + 32;
    
    return function (string)
    {
        var result = 1;
        for (var i = 0; i < string.length; ++i)
            result = (seed * result + string.charCodeAt(i)) & 0x7FFFFFFF;
        
        return result;
    };
}

function Bloom(size, functions)
{
    var bits = Bits();
    
    function add(string)
    {
        for (var i = 0; i < functions.length; ++i)
            bits.set(functions[i](string) % size);
    }
    
    function test(string)
    {
        for (var i = 0; i < functions.length; ++i)
            if (!bits.test(functions[i](string) % size)) return false;
        return true;
    }

    function get() 
    {
    	return bits.get();
    }
        
    return {add: add, test: test, get: get};
    
}



var wordsBits = Bloom(430000, [Hash(), Hash()]);


for (var i = 0; i < words.length; i++) {
	wordsBits.add(words[i]);
}

fs.writeFileSync('wordsBits.txt', wordsBits.get());

  var zopfli = require('node-zopfli');
	fs.createReadStream('wordsBits.txt')
	  .pipe(zopfli.createGzip({
	  verbose: false,
	  verbose_more: false,
	  numiterations: 70,
	  blocksplitting: true,
	  blocksplittinglast: false,
	  blocksplittingmax: 5
	}))
  .pipe(fs.createWriteStream('data.gz'));