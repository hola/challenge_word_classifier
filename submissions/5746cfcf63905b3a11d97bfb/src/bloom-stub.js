  let fnv_1a = v => {
    var a = 2166136261;
    for (var i = 0, n = v.length; i < n; ++i) {
      var c = v.charCodeAt(i),
          d = c & 0xff00;
      if (d) a = mu(a ^ d >> 8);
      a = mu(a ^ c & 0xff);
    }
    return mi(a);
  };
  let mu = a => a + (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
  let fnv_1a_b = a => mi(mu(a));
  let mi = a => {
    a += a << 13;
    a ^= a >>> 7;
    a += a << 3;
    a ^= a >>> 17;
    a += a << 5;
    return a & 0xffffffff;
  };

  class BloomFilter {
    constructor(m, k) {
      var a;
      if (typeof m !== "number") a = m, m = a.length * 32;

      var n = Math.ceil(m / 32),
          i = -1;
      this.m = m = n * 32;
      this.k = k;

      var bu = this.bu = [];
      if (a) while (++i < n) bu[i] = a[i];
      else while (++i < n) bu[i] = 0;
      this._lo = [];
    }

    lo(v){
      var k = this.k,
          m = this.m,
          r = this._lo,
          a = fnv_1a(v),
          b = fnv_1a_b(a),
          x = a % m;
      for (var i = 0; i < k; ++i) {
        r[i] = x < 0 ? (x + m) : x;
        x = (x + b) % m;
      }
      return r;
    }

    add(v) {
      var l = this.lo(v + ""),
          k = this.k,
          bu = this.bu;
      for (var i = 0; i < k; ++i) bu[Math.floor(l[i] / 32)] |= 1 << (l[i] % 32);
    }

    test(v) {
      var l = this.lo(v + ""),
          k = this.k,
          bu = this.bu;
      for (var i = 0; i < k; ++i) {
        var b = l[i];
        if ((bu[Math.floor(b / 32)] & (1 << (b % 32))) === 0) {
          return false;
        }
      }
      return true;
    }
  }

exports.BloomFilter = BloomFilter;
