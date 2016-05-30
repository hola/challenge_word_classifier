function test(bloom, word) {
  let stem = getStem(word.replace(/'s$/, ''));
  return bloom.test(strip(stem)) && like(word, stem);
}

function strip(word) {
  return word.replace(/^(anti|auto|bar|over|post|pre|semi|sub|tri|un)/, '').replace(/(en|less)$/, '');
}

function like(word, stem) {
  if (stem.length > 12 || stem.length < 2)
    return false;

  let aps = word.match(/'/g);
  if (aps)
    if (aps.length > 1 || !/'s$/.test(word))
      return false;

  if (/[aeiouy]{4,}|[^aeiou']{5,}|^(\w)\1/.test(stem))
    return false;

  return true;
}

function tester(data) {
  let payload = new Int32Array(data);
  let bloom = new BloomFilter(payload);
  return word => test(bloom, word);
}
