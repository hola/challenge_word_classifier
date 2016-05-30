// Copyright (c) 2011, Jason Davies
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//   * Redistributions of source code must retain the above copyright notice, this
//     list of conditions and the following disclaimer.
//
//   * Redistributions in binary form must reproduce the above copyright notice,
//     this list of conditions and the following disclaimer in the documentation
//     and/or other materials provided with the distribution.
//
//   * The name Jason Davies may not be used to endorse or promote products
//     derived from this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL JASON DAVIES BE LIABLE FOR ANY DIRECT, INDIRECT,
// INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
// PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
// LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
// OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

class BloomFilter {
  constructor(m, k) {
    var a;
    if (typeof m !== "number") a = m, m = a.length * 32;

    var n = Math.ceil(m / 32),
    i = -1;
    this.m = m = n * 32;
    this.k = k;

    var kbytes = 1 << Math.ceil(Math.log(Math.ceil(Math.log(m) / Math.LN2 / 8)) / Math.LN2),
    array = kbytes === 1 ? Uint8Array : kbytes === 2 ? Uint16Array : Uint32Array,
    kbuffer = new ArrayBuffer(kbytes * k),
    buckets = this.buckets = new Int32Array(n);
    if (a) while (++i < n) buckets[i] = a[i];
    this._locations = new array(kbuffer);
  }

  // See http://willwhim.wpengine.com/2011/09/03/producing-n-hash-functions-by-hashing-only-once/
  locations(v) {
    var k = this.k,
    m = this.m,
    r = this._locations,
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
    var l = this.locations(v + ""),
    k = this.k,
    buckets = this.buckets;
    for (var i = 0; i < k; ++i) buckets[Math.floor(l[i] / 32)] |= 1 << (l[i] % 32);
  }

  test(v) {
    var l = this.locations(v + ""),
    k = this.k,
    buckets = this.buckets;
    for (var i = 0; i < k; ++i) {
      var b = l[i];
      if ((buckets[Math.floor(b / 32)] & (1 << (b % 32))) === 0) {
        return false;
      }
    }
    return true;
  }

  // Estimated cardinality.
  size() {
    var buckets = this.buckets,
    bits = 0;
    for (var i = 0, n = buckets.length; i < n; ++i) bits += popcnt(buckets[i]);
    return -this.m * Math.log(1 - bits / this.m) / this.k;
  }

  // Turns the bloom filter into a buffer for later storage.
  serialize() {
    // The format is the number of hashes as a uint16, followed by the buckets
    // data as big endian int32's
    var bucketLen = this.buckets.length,
    target = new Buffer((bucketLen << 2) + 2);
    target.writeUInt16BE(this.k, 0);

    for (var i = 0; i < bucketLen; ++i) {
      target.writeInt32BE(this.buckets[i], (i << 2) + 2);
    }

    return target;
  }
}

// Parses a buffer created by a previous call to .serialize into a BloomFilter
function deserialize(data) {
  var hashes = data.readUInt16BE(0),
  count = (data.length - 2) >> 2,
  buckets = new Int32Array(count);

  for (var i = 0; i < count; ++i) {
    buckets[i] = data.readInt32BE((i << 2) + 2);
  }

  return new BloomFilter(buckets, hashes);
}

// http://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetParallel
function popcnt(v) {
  v -= (v >> 1) & 0x55555555;
  v = (v & 0x33333333) + ((v >> 2) & 0x33333333);
  return ((v + (v >> 4) & 0xf0f0f0f) * 0x1010101) >> 24;
}

// Fowler/Noll/Vo hashing.
function fnv_1a(v) {
  var a = 2166136261;
  for (var i = 0, n = v.length; i < n; ++i) {
    var c = v.charCodeAt(i),
    d = c & 0xff00;
    if (d) a = fnv_multiply(a ^ d >> 8);
    a = fnv_multiply(a ^ c & 0xff);
  }
  return fnv_mix(a);
}

// a * 16777619 mod 2**32
function fnv_multiply(a) {
  return a + (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
}

// One additional iteration of FNV, given a hash.
function fnv_1a_b(a) {
  return fnv_mix(fnv_multiply(a));
}

// See https://web.archive.org/web/20131019013225/http://home.comcast.net/~bretm/hash/6.html
function fnv_mix(a) {
  a += a << 13;
  a ^= a >>> 7;
  a += a << 3;
  a ^= a >>> 17;
  a += a << 5;
  return a & 0xffffffff;
}

module.exports = BloomFilter
module.exports.deserialize = deserialize
