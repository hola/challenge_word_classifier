/**
 * Copyright (c) 2015 BitPay, Inc.
 * https://github.com/bitpay/bloom-filter
 */
module.exports = (cache) => {
  var murmurHash3 = (hash, data) => {
    var c1 = 0xcc9e2d51;
    var c2 = 0x1b873593;
    var r1 = 15;
    var r2 = 13;
    var m = 5;
    var n = 0x6b64e654;

    var mul32 = (a, b) => {
      return (a & 0xffff) * b + (((a >>> 16) * b & 0xffff) << 16) & 0xffffffff;
    };

    var sum32 = (a, b) => {
      return (a & 0xffff) + (b >>> 16) + (((a >>> 16) + b & 0xffff) << 16) & 0xffffffff;
    };

    var rotl32 = (a, b) => {
      return (a << b) | (a >>> (32 - b));
    };

    var k1;

    for (var i = 0; i + 4 <= data.length; i += 4) {
      k1 = data[i] |
        (data[i + 1] << 8) |
        (data[i + 2] << 16) |
        (data[i + 3] << 24);

      k1 = mul32(k1, c1);
      k1 = rotl32(k1, r1);
      k1 = mul32(k1, c2);

      hash ^= k1;
      hash = rotl32(hash, r2);
      hash = mul32(hash, m);
      hash = sum32(hash, n);
    }

    k1 = 0;

    switch (data.length & 3) {
      case 3:
        k1 ^= data[i + 2] << 16;
      /* falls through */
      case 2:
        k1 ^= data[i + 1] << 8;
      /* falls through */
      case 1:
        k1 ^= data[i];
        k1 = mul32(k1, c1);
        k1 = rotl32(k1, r1);
        k1 = mul32(k1, c2);
        hash ^= k1;
    }

    hash ^= data.length;
    hash ^= hash >>> 16;
    hash = mul32(hash, 0x85ebca6b);
    hash ^= hash >>> 13;
    hash = mul32(hash, 0xc2b2ae35);
    hash ^= hash >>> 16;

    return hash >>> 0;
  };

  return (word) => {
    var index = murmurHash3(0, new Buffer(word, 'utf8')) % (cache.length * 8);
    return !!(cache[index >> 3] & (1 << (7 & index)));
  };
};
