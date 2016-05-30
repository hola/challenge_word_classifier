class BloomFilter {
  constructor(buckets) {
    this.buckets = buckets;
    this.m = buckets.byteLength * 8;
  }

  add(v) {
    let i = murmur2(v, 3511) % this.m;
    let j = murmur2(v, 1213) % this.m;
    this.buckets[i / 32 | 0] |= 1 << (i % 32);
    this.buckets[j / 32 | 0] |= 1 << (j % 32);
  }

  test(v) {
    let i = murmur2(v, 3511) % this.m;
    let j = murmur2(v, 1213) % this.m;
    return (this.buckets[i / 32 | 0] & (1 << (i % 32))) !== 0 &&
           (this.buckets[j / 32 | 0] & (1 << (j % 32))) !== 0;
  }
}

function murmur2(v, seed) {
  let l = v.length, h = seed ^ l, i = 0, k, x = 0x5bd1e995;
  let c = i => v.charCodeAt(i);
  let tr = a => (((a & 0xffff) * x) + ((((a >>> 16) * x) & 0xffff) << 16));

  for (; l >= 4; l -= 4) {
    k = ((c(i) & 0xff)) | ((c(++i) & 0xff) << 8) | ((c(++i) & 0xff) << 16) | ((c(++i) & 0xff) << 24);
    k = tr(k);
    k ^= k >>> 24;
    k = tr(k);
    h = tr(h) ^ k;
    ++i;
  }

  switch (l) {
    case 3: h ^= (c(i + 2) & 0xff) << 16;
    case 2: h ^= (c(i + 1) & 0xff) << 8;
    case 1: h ^= (c(i) & 0xff); h = tr(h);
  }

  h ^= h >>> 13;
  h = tr(h);
  h ^= h >>> 15;

  return h >>> 0;
}
