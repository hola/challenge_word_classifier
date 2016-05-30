// Apparently no one can minify ES6 so do it yourself
const fs = require('fs');
const file = fs.readFileSync(`${__dirname}/../final/index.js`, 'utf8');

const minified = file
    .replace(/\b(const)\b/g, 'let')
    .replace(/\b(wrapper)\b/g, 'w')
    .replace(/\b(data)\b/g, 'd')
    .replace(/\b(size)\b/g, 'e')
    .replace(/\b(deserialize)\b/g, 'z')
    .replace(/\b(deserializeNode)\b/g, '$')
    .replace(/\b(createParser)\b/g, 'cp')
    .replace(/\b(parseTree)\b/g, 'pt')
    .replace(/\b(parser)\b/g, 'p')
    .replace(/\b(alphabet)\b/g, 'a')
    .replace(/\b(word)\b/g, 'w')
    .replace(/\b(mask)\b/g, 'm')
    .replace(/\b(maskBit)\b/g, 'mb')
    .replace(/\b(maskSize)\b/g, 'ms')
    .replace(/\b(negative)\b/g, 'n')
    .replace(/\b(node)\b/g, 'n')
    .replace(/\b(bit)\b/g, 'b')
    .replace(/\b(byte)\b/g, 'y')
    .replace(/\b(bytes)\b/g, 'bs')
    .replace(/\b(bitsLeft)\b/g, 'bl')
    .replace(/\b(originalWord)\b/g, 'o')
    .replace(/\b(treeMatches)\b/g, 'tm')
    .replace(/\b(treeWrapper)\b/g, 't')
    .replace(/\b(tree)\b/g, 't')
    .replace(/\b(trees)\b/g, 'l')
    .replace(/\b(transform)\b/g, 'r')
    .replace(/\b(span)\b/g, 's')
    .replace(/\b(false)\b/g, '!1')
    .replace(/\b(true)\b/g, '!0')
    .replace(/\s*\/\/.*\n/g, '')
    .replace(/(=|!)==/g, '$1=')
    .replace(/;}/g, '}')
    .replace(/\n/g, '')
    .replace(/\s+/g, ' ')
    .replace(/ ?(,|if|for|while|\||&|function|{|}|=|<<|;) ?/g, '$1')
;


console.log(minified);
