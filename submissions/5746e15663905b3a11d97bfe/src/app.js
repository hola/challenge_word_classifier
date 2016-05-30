
var bitarray = require('./bitarray')
var buf = Buffer.from([0x0,0x0,0x0,0x0])
bitarray.set(buf,8)
var num = buf.readUInt8(1)

console.assert(num == 1, "bad set first bit second byte")
console.assert(bitarray.test(buf, 8), "bad test first bit second byte")
console.assert(!bitarray.test(buf, 7), "bad test last bit first byte")
console.assert(bitarray.countTrue(buf) == 1, "count true failed on 1")
buf = Buffer.alloc(64*1024);
bitarray.set(buf,(1024*64*8)-1);
console.assert(bitarray.countTrue(buf) == 1, "count true failed on 1")
console.assert(bitarray.test(buf,(1024*64*8)-1), "failed last bit large")

buf = Buffer.from([0x0,0x0,0x0,0x0]);
for (var i = 0; i < 8*4; i++) {
    bitarray.set(buf,i);
}

console.assert(buf.readUInt8(0) == 255 &&
               buf.readUInt8(1) == 255 && 
               buf.readUInt8(2) == 255 &&
               buf.readUInt8(3) == 255,"set all bits failed")
console.assert(bitarray.countTrue(buf) == 8*4, "count true failed on full")
var words = ['hi','no','bigword','shit']
var Bloom = require('./bloom');
var mybloom = Bloom.from(words, 8, 1)

console.assert(mybloom.test('hi'), 'bloom set failed false negative');
// console.assert(!mybloom.test('1hi'),'bloom set failed false positive');

const readline = require('readline')
const fs = require('fs')

const rl = readline.createInterface({
  input: fs.createReadStream('words.txt')
});

var test = JSON.parse(require('fs').readFileSync('./tests/test1.out','utf8'));
console.log(test);
  var wordsbloom = Bloom.from([],64*1024+695,1);
  rl.on('line', (line) => {
    line=line.toLowerCase().replace(/'s$/,'')
    wordsbloom.add(line)
    
    console.assert(wordsbloom.test(line))
  }).on('close', ()=> {
    // console.log('done')
     console.log(bitarray.countTrue(wordsbloom.buf) + " " + wordsbloom.buf.length)
    fs.writeFileSync("out.bloom", require('zlib').gzipSync(wordsbloom.buf))
    sol = require('./solution/solution');
    sol.init(wordsbloom.buf)
    var good = 0;
    var bad =0;
    var falsepositive = 0;
    var falsenegative = 0;
    var caught = 0;
    for (var key in test) {
      if (test.hasOwnProperty(key)) {
        //console.log('testing: ' + key + " E: " + test[key] + "A: " + wordsbloom.test(key))
        // if (key.length > 60 || key.match("xj|qj|qx|qz|vq|jq|zx|jx|jz|''|'j|'q|'x|'z")){
        //   filterRes = false;
        //   caught++;
        // }
        // else
          filterRes =  sol.test(key) 
        if (filterRes == test[key])
          good++
        else {
          bad++
          
          if (test[key] == true)
            falsenegative++
          else
            falsepositive++
        }
        
      }
      
    }
    console.log("good: " + good +" bad: "+ bad+ " falsepositive: "+falsepositive+ " falsenegative:" +falsenegative+ " caught:"+caught)
process.exit();

})

function golumb_enc(v,p) {
  
}

