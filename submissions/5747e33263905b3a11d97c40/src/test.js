var Words = require('./words.js')
var BloomFilter = require('./bloom_filter.js')
var testWords = require('./tmp/test-0.json')
var BloomSerializer  = require('./bloom_serializer.js')
var filters = [];
var words = new Words('../words.txt')

function wordPresent(word){
  var subWords = words.splitWord(word);
  var present = true;

  subWords.forEach( (sw, i) => {
    present = present && filters[i].exists(sw);
  })

  return present;
}

function test(){
  var count = 0

  for(var word in testWords){
    var present = wordPresent(word)

    if(present != testWords[word]){
      count = count + 1;
      console.log(`Word: ${word} : ${present} : ${testWords[word]}`);
    }
  }

  console.log(`Total not matching ${count}`);
}

function filterFileTest(){
  var buffers = BloomSerializer.importFilters('./tmp/all.bloom')

  buffers.forEach((buffer, i) =>{
    filters.push(BloomFilter.loadFromBuffer(buffer, `${i+1}.bloom`));
  })

  test();
}

function filterTestAndExport(){
  words.readWords((groups) => { 
    console.log(`Word Group Count : ${groups.length}`) 

    groups.forEach((words, i) => {
      var filter = new BloomFilter(words);
      filter.name = `${i + 1}.bloom`;
      filters.push(filter);
    })

    test();

    BloomSerializer.exportFilters(filters, './tmp/all.bloom')

  });
}

//filterTestAndExport();
filterFileTest();
