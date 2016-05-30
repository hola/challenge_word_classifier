var stemmer = require('./porter');

module.exports = function preprocess(word) {
  word = word.replace(/'s$/, '');

  if (word.length > 6) {
    word = word.replace(/^(anti|auto|dis|mis|over|sub|super|un)/, '');
  }

  return stemmer(word);
}
