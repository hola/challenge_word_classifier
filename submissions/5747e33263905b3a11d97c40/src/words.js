const lineReader = require('readline');

class Words{
  constructor(file){
    this.words = [];
    this.ranges = [[0, 3], [3, 7], [7, 12], [12, null]];
    this.wordGroups = []; 
    this.file = file;
  }

  fileReader(){
    return lineReader.createInterface({
      input: require('fs').createReadStream(this.file)
    });
  }

  readWords(callback){
    var self = this;
    var reader = this.fileReader();

    reader.on('line', (line) => {
      this.words.push(line)
    });

    reader.on('close', () => {
      self.buildWordGroups();

      if(callback){
        callback.call(this, self.wordGroups);
      }
    })
  }

  splitWord(word){
    var group = [],
        lword = word.toLowerCase();
    
    this.ranges.forEach((range, i) => {
      var subWord = lword.slice(range[0], range[1] || lword.length);

      if(subWord.length){
        group.push(subWord);
      }
    });
    
    return group;
  }

  buildWordGroups(){
    var self = this,
        wordGroups;

    wordGroups = this.ranges.map(()=> {
      return [];
    });

    self.words.forEach((word) => {
      var group = self.splitWord(word);

      self.splitWord(word).forEach((sw, i) => {
        wordGroups[i].push(sw) 
      });
    });

    wordGroups.forEach((words, i) =>{
      var wordsMap = {}, 
          uniqWords = []

      words.forEach((word) => {
        if(!wordsMap[word]){ 
          uniqWords.push(word);
        }

        wordsMap[word] = true  
      })

      console.log("word group", i,  uniqWords.length);
      self.wordGroups.push(uniqWords);
    });
  }
}

module.exports = Words;

