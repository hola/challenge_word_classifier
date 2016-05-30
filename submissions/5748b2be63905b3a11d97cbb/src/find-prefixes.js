/*
  Поиск оптимального набора префиксов и суффиксов для удаления из основы.

  Заменяет `__REPLACE__` в `test.js`:
    function strip(word) {
      return word__REPLACE__; // => return word.replace(...);
    }

  далее собирает и запускает тесты.
*/

let prefs = 'a|an|ab|ac|acr|acro|aden|adeno|aer|aero|agr|agro|ana|ano|andr|anem|anglo|ante|anthrop|anthropo|ant|anti|aut|auto|bar|baro|bathy|be|bi|bi|bio|bibli|biblio|blast|blasto|brady|brom|bromo|bronch|broncho|cac|caco|cardi|cardio|cent|centi|cephal|cephalo|chrom|chromo|chromat|chromato|chron|chrono|circum|cion|ciono|co|colpo|com|con|col|cor|contr|contra|contr|contro|cosm|cosmo|counter|crin|crino|cry|cryo|crypt|crypto|cyt|cyto|dactyl|dactylo|de|dec|deca|dek|deka|deci|dem|demo|derm|dermo|derm|derma|dermat|di|didact|didacto|dynam|dynamo|dis|dox|doxo|dys|eco|ecto|ectos|edaph|edapho|electr|electro|embry|embryo|encephal|encephalo|end|endo|ent|ento|enne|ennea|enter|entero|eo|ep|epi|eph|erg|ergo|erythr|erythro|erot|eroto|stom|stomo|stomat|stomato|ethn|ethno|eu|ex|ex|exo|extra|flor|flori|fore|gyn|hemi|hex|hexa|hyper|hyp|hypo|in|in|il|im|ir|inter|intra|kilo|mal|maxi|mega|megal|meta|micro|mid|milli|mini|mis|mon|mono|multi|non|non|oct|octo|oct|octa|oo|out|over|pent|penta|post|pre|pro|quadr|quart|quin|quinque|quint|quinti|re|rect|recti|scler|sclero|semi|sept|septa|sex|sexi|sino|spasm|spasmo|sperm|spermo|spermat|spermato|spher|sphero|sphygm|sphygmo|splen|spleno|splanchn|splanchno|schiz|schizo|schist|schisto|staphyl|staphylo|styl|stylo|sub|super|syn|tach|tachy|tach|tacho|tel|tele|tel|telo|tel|telo|tel|tele|trans|tri|ultra|un|uni|ur|zoo'.split('|');
let suffs = 'ise|ate|fy|en|tion|sion|er|ment|ant|ent|age|ery|ry|er|ism|ship|age|ity|ness|al|ent|ive|ous|ful|less|able'.split('|');

prefs = [...new Set(prefs)];
suffs = [...new Set(suffs)];

const assert = require('assert');
const fs = require('fs');
const exec = require('child_process').execSync;


let source = fs.readFileSync('src/test.js', 'utf8');

function update(pref, suff) {
  let str = '';

  if (pref.length)
    str += `.replace(/^(${pref.join('|')})/, '')`;

  if (suff.length)
    str += `.replace(/(${suff.join('|')})$/, '')`;

  fs.writeFileSync('src/test.js', source.replace('__REPLACE__', str));
}

function run(prefs, suffs) {
  update(prefs, suffs);
  let build = exec('node build', {encoding: 'utf8'});
  let nStems = +build.match(/Stem count: (\d+)/)[1];
  let test = exec('node test', {encoding: 'utf8'});
  let match = test.match(/fpr: [\d.]+% \((\d+)\/(\d+)\)/);
  let fpr = Math.round(match[1]/match[2] * 100 * 100) / 100;
  return [nStems, fpr];
}

let goodPrefs = [];
let goodSuffs = [];
let [nStems, fpr] = run([], []);
console.log(`Initial fpr = ${fpr}%`);

function forEach(from, to) {
  for (let el of from) {
    to.push(el);
    let [newNStems, newFpr] = run(goodPrefs, goodSuffs);
    let delta = newNStems - nStems;
    if (delta > -200 || newFpr > fpr)
      to.pop();
    else {
      nStems = newNStems;
      fpr = Math.min(newFpr, fpr);
      console.log(` ${delta} ${newFpr}%: ${el}`);
    }
  }
}

console.log('\nFind optimal prefixes:');
forEach(prefs, goodPrefs);
console.log('\nFind optimal suffixes:');
forEach(suffs, goodSuffs);

console.log(`\nBest fpr: ${fpr}`);
console.log(`Prefixes: ${goodPrefs.join('|')}`);
console.log(`Suffixes: ${goodSuffs.join('|')}`);

fs.writeFileSync('src/test.js', source);
