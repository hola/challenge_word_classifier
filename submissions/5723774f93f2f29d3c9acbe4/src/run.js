'use strict';

var trie = new Object()

/**
{"tr":{"i":1},"ri":{"e":1}}
*/
var markov = new Object()

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('words.txt'),
  terminal: false
});


let toNum = function(s){
  let c = s.toLowerCase().charCodeAt(0)
  if (c == 39) {
    return 0
  }
  return c - 96
}

// let check = function(w){
//   let current = trie;
//   for(let i = 0; i < w.length; i++){
//     let index = toNum(w[i])
//     if (!current[index]) {
//       return false
//     }
//     if(i == w.length -1 && current[index][0] == 1){
//       return true
//     }
//     if (!current[index][1]) {
//       return false
//     }
//     current = current[index][1]
//   }
// }
//
// let insert = function(w){
//   let current = trie;
//   for(let i = 0; i < w.length; i++){
//     let index = toNum(w[i])
//     // console.log(index, w[i])
//     if(!current[index]){
//       current[index] = new Array(2)
//       current[index][0] = 0
//       current[index][1] = 0
//     }
//     if(i == w.length -1) {
//       current[index][0] = 1
//       break
//     }
//     if(!current[index][1]) {
//       current[index][1] = new Object()
//     }
//     current = current[index][1]
//   }
// }

let insertMk = function(markov, w, amt){
  let current = markov;
  if(w.length <= amt) {
    return
  }
  for(let i = amt; i < w.length; i++){
    let index = w.substring(i-amt, i).toLowerCase();
    let letter = w[i].toLowerCase()
    if(!current[index]){
      current[index]=new Object()
    }
    if(!current[index][letter]){
      current[index][letter] = 0
    }
    current[index][letter]++
  }
}



let softmax = function(markov){
  let markovExp = {}

  let letters = "'abcdefghijklmnopqrstuvwxyz".split("")
  // Object.keys(markov).forEach(function(p){
  //   markovExp[p] = new Object()
  //   letters.forEach(function(l){
  //     markovExp[p][l] = Math.exp(markov[p][l] || 0)
  //   })
  // })
  // let lettersSum = new Object()
  // letters.forEach(function(l){
  //   lettersSum[l] = 0
  // })
  //
  // Object.keys(markovExp).forEach(function(p){
  //   letters.forEach(function(l){
  //     lettersSum[l] += markovExp[p][l]
  //   })
  // })
  // Object.keys(markovExp).forEach(function(p){
  //   letters.forEach(function(l){
  //     markovExp[p][l] = markovExp[p][l] / lettersSum[l]
  //   })
  // })
  Object.keys(markov).forEach(function(p){
    markovExp[p] = new Object()
    // softmax
    let sum = 0
    let len = Object.keys(markov[p]).length
    Object.keys(markov[p]).forEach(function(l){
      markovExp[p][l] = Math.exp(markov[p][l])
      sum += markovExp[p][l]
    })
    Object.keys(markov[p]).forEach(function(l){
      markovExp[p][l] /= sum
    })

  })
  //console.log(markovExp)
  return markovExp
}


lineReader.on('line', function (w) {
  insertMk(markov, w, 2)
});
lineReader.on('close', (cmd) => {
  console.log(`close`);

  require("fs").writeFileSync("data.binary", require("zlib").gzipSync(new Buffer(JSON.stringify(markov))))
});
