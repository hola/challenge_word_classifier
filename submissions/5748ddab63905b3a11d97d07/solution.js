
const letters = [];
for (let i = 97; i <= 122; i++) {
  letters.push(String.fromCharCode(i));
}
letters.push(String.fromCharCode(39));
// End of word
letters.push('|');

function _restoreTree(rows) {
  const tree = {};

  let position = 0;

  for (let index = 0; index < rows.length;) {
    if (rows[index] === '*') {
      index++;
      const child = [];
      while (rows[index] && rows[index] !== '*') {
        child.push(rows[index].replace(' ', ''));
        index++;
      }
      tree[letters[position]] = _restoreTree(child);
      position++;
    }
  }
  return tree;
}

function restoreTree(data) {
  return _restoreTree(data.split('\n'));
}

const minLength = 3;
const maxLength = 19;
let _tree;
let _alphabet;

function translate(word) {
  word = `${word}|`;
  let newWord = '';
  for (const position in word) {
    const letter = word[position];
    const a = _alphabet[position][letter];
    if (!a) {
      return null;
    }
    newWord += a;
  }
  return newWord;
}

exports.init = function init(data) {
  const [tree, alphabet] = data.toString().split('\n---\n');
  _alphabet = JSON.parse(alphabet);
  _tree = restoreTree(tree);
};

exports.test = function test(word) {
  const length = word.length;
  if (length < minLength) {
    return true;
  } else if (length > maxLength) {
    return false;
  }
  word = translate(word);
  if (!word) {
    return false;
  }
  let current = _tree;
  for (const letter of word) {
    if (current[letter]) {
      current = current[letter];
    } else {
      return false;
    }
  }
  return true;
};
