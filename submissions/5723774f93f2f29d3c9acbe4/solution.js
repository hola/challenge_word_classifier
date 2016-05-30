"use strict";

let checkMk = function(markov, w, amt){
  if (!amt){
    amt = 2
  }
  let count = 0;
  if(w.length <= amt) {
    return 0
  }
  for(let i = amt; i < w.length; i++){
    let index = w.substring(i-amt, i).toLowerCase();
    let letter = w[i].toLowerCase()
    //console.log(index, letter, markov[index])
    if (markov[index] && markov[index][letter]) {
      count += markov[index][letter]
    }
  }
  return count / (w.length - amt)
}

let sigmoid = function(markov){
  let markovExp = {}
  Object.keys(markov).forEach(function(p){
    markovExp[p] = new Object()
    // softmax
    let sum = 0
    let len = Object.keys(markov[p]).length
    Object.keys(markov[p]).forEach(function(l){
      sum += markov[p][l]
    })

    // sigmoid with coeff
    Object.keys(markov[p]).forEach(function(l){
      markovExp[p][l] = (1 / (1 + Math.exp(-(markov[p][l]/(sum/len)))))
    })
  })
  return markovExp
}

let markov = new Object()

module.exports = {
  init: function(data){
    markov = sigmoid(JSON.parse(data.toString('utf-8')))
  },
  test: function(w){
    // let y = score > 0 // plain markov scores
    // let y = score > 0.80 // sigmoid
    let score = checkMk(markov, w, 2)
    //console.log(score)
    return score > 0.80
  }
}
