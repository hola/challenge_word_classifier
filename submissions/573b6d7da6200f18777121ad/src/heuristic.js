module.exports = function heuristic(word) {
  var _word = Array.prototype.slice.call(word);

  if (word.length > 15)
    return false;
  else if (_word.filter((x) => x === "'").length > 2)
    return false;
  else if (/^'|'$|j$|j[bfgqz]|f[qvz]|q[^u]|x[jkz]|[^aeinouy]x/.test(word))
    return false;

  var count = 0;
  var consonants = 0;

  _word.forEach(letter => {
    count = /[^aeiouy']/.test(letter) ? count + 1 : 0;
    consonants = count > consonants ? count : consonants;
  });

  return (consonants < 5);
}
