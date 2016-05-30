
const getBit = (buffer, index) => (buffer[index >>> 3] & (1 << (index % 8))) > 0;

const h = (() => {
  let mix = a => {
    a += a << 13;
    a ^= a >>> 7;
    a += a << 3;
    a ^= a >>> 17;
    a += a << 5;
    return a & 0xffffffff;
  };
  return v => {
    var a = 152136261;
    for (let i = 0; i < v.length; ++i) {
      a = a ^ v.charCodeAt(i) & 255;
      a = a + (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
    }
    return mix(mix(a));
  }
})();


global.buf = new Buffer(0);
let hashers = [];
let inBloom = w => hashers.filter(hasher => getBit(global.buf, hasher(w))).length == k;
const k = 3;

module.exports = {
  h,
  k,
  init: b => {
    global.buf = b;
    for (let i = 0; i < k; i++) hashers.push(v => Math.abs(h(i.toString(32) + v) % _SIZE_));
  },
  test: w => {
    let s = 0;
    const purew = w.replace(/'s$/, '');
    const r = (regexpString, flags) => new RegExp(regexpString, flags);

    if (/'/.test(w) && !/'s$/.test(w)) { s++ }

    const vowels = '[aeiou]';
    const consonants = '[bcdfghjklmnpqrstvxzwy]';
    if (r(`${vowels}{3}`).test(purew)) { s++ }
    if (r(`${consonants}{4}`).test(purew)) { s++ }

    if (r(`${consonants}(${consonants})\\1`).test(purew)) { s++ }
    if (r(`${vowels}(${vowels})\\1`).test(purew)) { s++ }
    if (r(`(${vowels})\\1${vowels}`).test(purew)) { s++ }

    let ccc = purew.match(r(consonants, 'g'));
    ccc = ccc && ccc.length || 0;
    let aaa = purew.match(r(vowels, 'g'));
    aaa = aaa && aaa.length || 0;
    if (ccc / aaa > 4) { s++ }

    if (purew.length >= 13) { s++ }
    else if (purew.length >= 12) { s += 0.5 }
    if (purew.length < 5) { s++ }
    else if (purew.length < 6) { s += 0.5 }

    return s < 1 || inBloom(purew);
  }
}
