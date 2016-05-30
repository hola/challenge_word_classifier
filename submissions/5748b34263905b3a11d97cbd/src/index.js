var Iseng = function() {};
Iseng.prototype.patterns = null;
Iseng.prototype.init = function(data) {
  this.patterns = data.toString("utf-8");
};
Iseng.prototype.toPattern = function(word) {
  var possesive = false;
  if (word.endsWith("'s")) {
    word = word.replace(/'s$/, '');
    possesive = true;
  }

  var pattern = word.trim()
    .replace(/[aiueo]/ig, "0")
    .replace(/[qwrtpsdfghjklzxcvbnm]/ig, "1");

  return possesive ? pattern + "'s" : pattern;
};
Iseng.prototype.test = function(word) {
  var pattern = this.toPattern(word);
  return this.patterns.indexOf(" " + pattern + " ") >= 0;
};
module.exports = new Iseng();
