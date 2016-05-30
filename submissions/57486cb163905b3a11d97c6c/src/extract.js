const fs = require('fs');
const file = fs.readFileSync('Syllables.txt', 'utf-8');
const lines = file.split('\r\n');
const syllablesStrings = lines.map(line => line.split('=')[1]);

const syllables = new Set(
  syllablesStrings.reduce((sum, syllablesString) => {
    return sum.concat(syllablesString.split('�'));
  }, [])
);

fs.writeFileSync('s.json', JSON.stringify(Array.from(syllables)));
