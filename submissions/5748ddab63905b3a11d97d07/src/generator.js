
const fs = require('fs');
const zlib = require('zlib');

const uniq = require('lodash.uniq');

const letters = [];
for (let i = 97; i <= 122; i++) {
  letters.push(String.fromCharCode(i));
}
letters.push(String.fromCharCode(39));
// End of word
letters.push('|');

function readFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  })
  .then(data => {
    let words = data.split('\n');
    words = words.filter(word => word.length > 0);
    words = words.map(word => word.toLowerCase());
    words = uniq(words);
    return words;
  });
}

function freqStat(words) {
  const stat = new Map;

  for (let word of words) {
    word = `${word}|`;

    for (let position in word) {
      const letter = word[position];
      position = parseInt(position);

      if (!stat.has(position)) {
        stat.set(position, new Map());
        for (const l of letters) {
          stat.get(position).set(l, 0);
        }
      }
      stat.get(position).set(letter, stat.get(position).get(letter) + 1);
    }
  }
  return stat;
}

function balance(hash, capacity) {
  const data = hash.sort((a, b) => a.width > b.width);

  const values = [];
  const letters = [];
  for (let i = 0; i < capacity; i++) {
    values.push(0);
    letters.push([]);
  }

  for (const item of data) {
    let minValue = Number.POSITIVE_INFINITY;
    let minIndex = 0;
    for (const index in values) {
      if (item.width + values[index] < minValue) {
        minValue = item.width + values[index];
        minIndex = index;
      }
    }
    values[minIndex] += item.width;
    letters[minIndex].push(item);
  }

  //console.log(letters);
  return letters.map(item => item.map(letter => letter.letter));
}

function makeAlphabet(stat, capacity, threshold) {
  const alphabets = [];

  stat.forEach((value, position) => {
    const hash = [];
    value.forEach((count, letter) => {
      if (count > threshold) {
        hash.push({
          letter,
          width: count,
        });
      }
    });

    const b = balance(hash, capacity);
    const alphabet = {};
    for (const index in b) {
      for (const letter of b[index]) {
        alphabet[letter] = letters[index];
      }
    }
    alphabets[position] = alphabet;
  });

  //console.log('alphabets:', alphabets);
  return alphabets;
}

function makeTree(words) {
  const tree = { child: {} };
  for (const word of words) {
    let _tree = tree;
    for (const letter of word) {
      if (!_tree.child[letter]) {
        _tree.child[letter] = { counter: 1, child: {} };
      } else {
        _tree.child[letter].counter ++;
      }
      _tree = _tree.child[letter];
    }
  }
  return tree;
}

function translate(alphabet, word) {
  word = `${word}|`;
  let newWord = '';
  for (const position in word) {
    const letter = word[position];
    const a = alphabet[position][letter];
    if (!a) {
      return null;
    }
    newWord += a;
  }
  return newWord;
}

function serialize(tree, level = 0) {
  let ret = [];
  let space = '';
  for (let i = 0; i < level; i++) {
    space += ' ';
  }
  for (const key in tree.child) {
    const item = tree.child[key];
    ret.push(space + '*');
    //ret.push(space + key);
    if (item.child['a']) {
      ret = ret.concat(serialize(item, level + 1));
    }
  }
  return ret.join('\n');
}

const minLength = 3;
const maxLength = 19;

function filter(words) {
  return words.filter(word => word.length >= minLength && word.length <= maxLength);
}


readFile('words.txt')
  .then(filter)
  .then(words => {
    const stat = freqStat(words);
    const alphabet = makeAlphabet(stat, 2, 1000);
    const newWords = words.map(word => translate(alphabet, word)).filter(word => !!word);
    const tree = makeTree(newWords);
    const data = serialize(tree) + '\n---\n' + JSON.stringify(alphabet);
    // console.log(data);

    const buf = zlib.gzipSync(data, { level: 9 });
    // console.log(buf.length / 1024);
    fs.writeFileSync('data.gz', buf, 'utf8');
  })
  .catch(console.log);

