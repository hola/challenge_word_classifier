let affixes = [
    ['|a|^'],
    ['|ab|^'],
    ['|ad|^'],
    ['|an|^'],
    ['|be|^'],
    ['|bi|^'],
    ['|co|^'],
    ['|de|^'],
    ['|di|^'],
    ['|en|^'],
    ['|in|^'],
    ['|im|^'],
    ['|re|^'],
    ['|un|^'],
    ['|up|^'],
    ['|con|^'],
    ['|dis|^'],
    ['|mis|^'],
    ['|non|^'],
    ['|out|^'],
    ['|pre|^'],
    ['|pro|^'],
    ['|sub|^'],
    ['|tri|^'],
    ['|anti|^'],
    ['|fore|^'],
    ['|over|^'],
    ['|poly|^'],
    ['|post|^'],
    ['|semi|^'],
    ['|hyper|^'],
    ['|inter|^'],
    ['|micro|^'],
    ['|super|^'],
    ['|ultra|^'],
    ['|under|^'],
    ['|pseudo|^'],
    ['|counter|^'],

    ['e|ive|e', '|ive|[^e]'],
    ['e|or|e', '|or|[^e]'],
    ['|er|'],
    ['e|ion|e', 'y|ication|y', '|en|[^ey]'],
    ['y|ieth|y', '|th|[^y]'],
    ['|ly|[^y]', 'y|ily|y'],
    ['|al|'],
    ['|ally|'],
    ['a|oid|a', 'e|oid|e', '|oid|[^ae]'],
    ['y|ian|y', '|ian|[^y]'],
    ['|age|'],
    ['|an|'],
    ['|ant|'],
    ['|ary|'],
    ['|ate|'],
    ['|ation|'],
    ['|dom|'],
    ['|e|'],
    // TODO ee
    ['|ess|'],
    ['|ful|'],
    ['y|ie|y', '|ie|[^y]'],
    // TODO in
    ['|ism|'],
    ['|ise|'],
    ['e|ish|e', '|ish|[^e]'],
    ['|ist|'],
    // TODO ite
    ['|ity|'],
    ['e|ing|e', '|ing|[^e]'],
    ['|d|e', 'y|ied|[^aeiou]y', '|ed|[^ey]', '|ed|[aeiou]y'],
    ['|st|e', 'y|iest|[^aeiou]y', '|est|[^ey]', '|est|[aeiou]y'],
    ['|r|e', 'y|ier|[^aeiou]y', '|er|[aeiou]y', '|er|[^ey]'],
    ['y|ies|[^aeiou]y', '|s|[aeiou]y', '|es|[sxzh]', '|s|[^sxzhy]'],
    ['|s|[sxzh]'], // Special case
    ['y|iness|[^aeiou]y', '|ness|[aeiou]y', '|ness|[^y]'],
    ['y|iless|[^aeiou]y', '|less|[aeiou]y', '|less|[^y]'],
    ['|able|[^aeiouy]', '|able|ee', 'e|able|[^aeiou]e', 'y|iable|y'],
    ['|ible|[^e]', 'e|ible|e'],
    ['|ify|[^e]', 'e|ify|e'],
    ['e|y|[ai]ble'],
    ['man|men|man'],
    ['|\'s|'],
    ['|ment|'],
    ['|hood|'],
    ['|like|'],
    ['|ship|'],
    ['|y|'],
    ['|ic|'],
    ['y|ious|y', '|ous|[^y]'],
    ['nce|ncy|[ae]nce']
];
let ed = [], er = [], ing = [];
'bdglmnprst'.split('').forEach((b) => {
    ed.push(`|${b}ed|[aeiou]${b}`);
    er.push(`|${b}er|[aeiou]${b}`);
    ing.push(`|${b}ing|[aeiou]${b}`);
});
affixes.push(ed, er, ing);

//STRIP
let prefixesCount = 0;
affixes.forEach((aff) => {
    let v = aff[0].split('|')[2];
    if (v.startsWith('^')) {
        ++prefixesCount;
    }
});
module.exports = {affixes, prefixesCount};
//SEND
