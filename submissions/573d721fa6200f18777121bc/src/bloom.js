  'use strict';
  var typedArrays = typeof ArrayBuffer !== "undefined";

  // Creates a new bloom filter.  If *m* is an array-like object, with a length
  // property, then the bloom filter is loaded with data from the array, where
  // each element is a 32-bit integer.  Otherwise, *m* should specify the
  // number of bits.  Note that *m* is rounded up to the nearest multiple of
  // 32.  *k* specifies the number of hashing functions.
  function BloomFilter(m, k) {
    var a;
    if (typeof m !== "number") a = m, m = a.length * 32;

    var n = Math.ceil(m / 32),
        i = -1;
    this.m = m = n * 32;
    this.k = k;

    if (typedArrays) {
      var kbytes = 1 << Math.ceil(Math.log(Math.ceil(Math.log(m) / Math.LN2 / 8)) / Math.LN2),
          array = kbytes === 1 ? Uint8Array : kbytes === 2 ? Uint16Array : Uint32Array,
          kbuffer = new ArrayBuffer(kbytes * k),
          buckets = this.buckets = new Int32Array(n);
      if (a) while (++i < n) buckets[i] = a[i];
      this._locations = new array(kbuffer);
    } else {
      var buckets = this.buckets = [];
      if (a) while (++i < n) buckets[i] = a[i];
      else while (++i < n) buckets[i] = 0;
      this._locations = [];
    }
  }

  BloomFilter.prototype.locations = function(v) {
    var k = this.k,
        m = this.m,
        r = this._locations,
        a = fnv_1a(v),
        x = a % m;
     r[0] = x < 0 ? (x + m) : x;
    return r;
  };

  BloomFilter.prototype.add = function(v) {
    var l = this.locations(v + ""),
        k = this.k,
        buckets = this.buckets;
    for (var i = 0; i < k; ++i) buckets[Math.floor(l[i] / 32)] |= 1 << (l[i] % 32);
  };

  BloomFilter.prototype.get = function(){
    var bucket = [];
    var keys = Object.keys(this.buckets);
    for(var i=0;i<keys.length;i++)
      bucket[i]=this.buckets[i].toString(36);
    return bucket;
  };

  BloomFilter.prototype.test = function(v) {
    var l = this.locations(v + ""),
        k = this.k,
        buckets = this.buckets;
    
    for (var i = 0; i < k; ++i) {
      var b = l[i];
      console.log(b,buckets[Math.floor(b / 32)]);
      if ((buckets[Math.floor(b / 32)] & (1 << (b % 32))) === 0) {
        return false;
      }
    }
    return true;
  };

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

  function fnv_mix(a) {
    a += a << 13;
    a ^= a >>> 7;
    a += a << 3;
    a ^= a >>> 17;
    a += a << 5;
    return a & 0xffffffff;
  }

var fs = require('fs');
var p={
  "3": 0.61,
  "4": 0.61,
  "5": 0.66,
  "6": 0.66,
  "7": 0.66,
  "8": 0.66,
  "9": 0.66,
  "10": 0.66,
  "11": 0.66,
  "12": 0.66,
  "13": 0.66,
  "14": 0.66,
  "15": 0.66,
  "16": 0.66,
  "17": 0.66,
  "18": 0.66,
  "19": 0.66,
  "20": 0.66,
  "21": 0.66,
  "22": 0.66,
  "23": 0.60,
  "24": 0.60,
  "25": 0.60,
  "26": 0.001,
  "27": 0.001,
  "28": 0.001,
  "29": 0.001,
  "30": 0.001,
  "31": 0.001,
  "32": 0.001,
  "34": 0.001,
  "45": 0.001,
  "58": 0.001,
};
var dict={};
var str='';
var data=fs.readFileSync('./groups/metadata.json', 'utf8');
data = JSON.parse(data);
for(var key in data){
  if(parseInt(key)>=3){
    var n=data[key];
    var m = Math.ceil((n * Math.log(p[key])) / Math.log(1.0 / (Math.pow(2.0, Math.log(2.0)))));
    dict[key]=m;
    str+=(Math.ceil(m / 32) * 32)+",";
  }
};
str=str.slice(0,str.lastIndexOf(","))+"\n";
for(var key in data){
  if(parseInt(key)>=3){
    var data=fs.readFileSync('./groups/'+key+'.txt','utf8');
    var s = data.split("\n");
    var bloom = new BloomFilter(dict[key],1);
    for(var j=0;j<s.length;j++){
      bloom.add(s[j]);
    }
    str+=(bloom.get()).toString()+'\n';
  }
};

fs.writeFileSync('./filters/filter.txt', str);



  