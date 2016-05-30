(function(exports) {

  var bl = null;

  var dt = {}

  exports.calcf = function(a) { return cf(a)}

  exports.init = function(b) {
    var d = JSON.parse(b.toString())
    bt(dt, d.tree)
    d.vData = new Buffer(d.vDataBuf, 'base64')
    bl = new Filter(d)
  }

  exports.test = function(w) { 
      var p = pt(dt, cf(w))
      if(p === "0") return false;
      return bl.contains(new Buffer(w.substring(0,6)))
  }

  var bt = function(tree, lines) {
    var t = lines.split("x").join("If (feature ").split("y").join("Else (feature ").split("z").join("Predict: ").split("v").join("in").split("w").join("not in").split("\n")
    at(tree, t)
  }

  var at = function(tree, lines) {
    if(!lines || lines.length == 0) return
    var line = lines.shift().trim()
    if(line.indexOf("If ") === 0 || line.indexOf("Else") === 0)
    {
      if(line.indexOf("If ") === 0) tree.Tp = "If"; 
      else tree.Tp = "Else";
      var s = line.split(" ");
      tree.Ft = s[2];
      tree.Op = s[3];
      var values = s[4];
      if(s[3] === "not") {
        tree.Op = tree.Op + " " + s[4]
        values = s[5]
      }
      if (s[3] == "in" || s[4] == "in") tree.Values = JSON.parse("[" + values.trim().replace("{","").replace("}","").replace(")","") + "]");
      else tree.Values = [parseFloat(values.trim().replace(")", ""))]
      tree.LeftChild = {}
      at(tree.LeftChild, lines);

      if (line.indexOf("If ") === 0)
      {
          tree.RightChild = {}
          at(tree.RightChild, lines);
      }
    }
    if (line.indexOf("Predict:") === 0)
    {
        tree.Tp = "Prediction";
        tree.Pr = line.split(" ")[1];
     }    
  }

  var pt = function(tree, features) {
      if (tree.Tp === "Prediction") return tree.Pr;
      if (tree.Tp === "If" || tree.Tp === "Else")
      {
          var val = features[tree.Ft];
          var treeVal = tree.Values[0];
          if (tree.Op === "<" && val <= treeVal) return pt(tree.LeftChild, features);
          if (tree.Op === ">" && val > treeVal) return pt(tree.LeftChild, features);
          if (tree.Op === "in" || tree.Op == "not in")
          {
              var has = tree.Values.indexOf(val) != -1;
              if(has && tree.Op == "in" || !has && tree.Op == "not in") return pt(tree.LeftChild, features);
          }
          if(tree.RightChild != null) return pt(tree.RightChild, features);
      }
      return "";
  }

  var vw = "aeiouy".split("");
  var nvw = "bcdfghjklmnpqrstvwxz".split("");

  var fq = [0.084, 0.018, 0.0397, 0.03, 0.1027, 0.01, 0.022, 0.026, 0.08, 0.0018, 0.009, 0.052, 0.029, 0.068, 0.0674, 0.029, 0.0016, 0.067, 0.097, 0.061, 0.033, 0.0091, 0.007, 0.0027, 0.018, 0.0031, 0.0233, 0.0]
  //var q = Array(2.4499999999999997,1.0,1.6500000000000001,1.45,2.3,1.0,1.05,1.0,1.95,1.05,1.45,1.2999999999999998,1.5,1.3499999999999999,1.95,1.3499999999999999,1.05,1.5,1.3499999999999999,1.4,2.1499999999999995,1.1,1.1,1.0,1.55,1.1,0.9,-0.10000000000000002)
  var q = Array(2.4499999999999997,1.0,1.6500000000000001,1.45,2.3499999999999996,1.0,1.05,1.0,2.0,1.05,1.45,1.2999999999999998,1.5,1.3499999999999999,1.95,1.3499999999999999,1.05,1.5,1.3499999999999999,1.4,2.1499999999999995,1.05,1.05,1.0,1.55,1.1,0.9,-0.10000000000000002)

  var maxl = function(s, arr)  { 
      var maxI = 0;
      var currI = 0;
      for(i = 0; i < s.length; ++i) {
          if(arr.indexOf(s[i]) != -1) currI = currI + 1 
          else currI = 0
          if(currI > maxI) maxI = currI
      }
      return maxI
}

  var cf = function(s) {
   
    var chArray = s.split("");
    var vCnt = 0;
    for(i = 0; i < chArray.length; ++i)
      { if(vw.indexOf(chArray[i]) != -1) vCnt=vCnt+1; }
    var sCnt = 0;
    for(i = 0; i < chArray.length; ++i)
      { if(vw.indexOf(chArray[i]) === -1) sCnt=sCnt+1; }
    var cntRatio = (sCnt > 0) ? vCnt*1.0/sCnt : 1;
    var arr = [chArray.length, vCnt, sCnt, cntRatio];
    var tags = [-1,27,0.0,-1,-1,-1]
    var cfq = 0.0;
    var w = [];
    var r = [];
    var cnt = s.length;
    if(cnt < 10) cnt = 10
    for(i = 0; i < cnt; ++i) {
        var a = i >= s.length ? 27 : s.charCodeAt(i) - 97;
        if(i < s.length && a === -58) {
            a = 26;
            if(i == 0) tags[0] = 27 
            else if(tags[0] === -1) tags[0] = w[i-1] 
            tags[2]++
            if(tags[3] === -1) tags[3] = i
            if(tags[3] >= 0) tags[4] = s.length-tags[3]-1
            if(tags[3] != -1) tags[5] = (tags[3]+1.0)/s.length
        }
        w.push(a)
        if(i < 12)
        cfq = cfq + fq[a]
        var nW = i < s.length - 1 ? s.charCodeAt(i+1) - 97 : 27
        if(nW === -58) nW = 26
        r[i] = (q[i > 0 ? w[i-1] : 27] + q[w[i]] + q[nW]) / 3.0
    }
    if(tags[0] == -1) tags[0] = 27
    if(tags[3] != -1 && tags[3] < s.length-1) tags[1] = w[tags[3]+1]
    for(i = 0; i < 10; ++i) arr.push(w[i])
    for(i = 0; i < 6; ++i) arr.push(tags[i])
    arr.push(maxl(s, vw));
    arr.push(maxl(s, nvw));
    arr.push(cfq/s.length)
    for(i = 0; i < 10; ++i) arr.push(r[i])

    return arr;
  }

function Filter(arg) {
    this.vData = arg.vData;
    this.nHashFuncs = arg.nHashFuncs;
    this.nTweak = arg.nTweak || 0;
    this.nFlags = arg.nFlags;
}

Filter.prototype.hash = function hash(nHashNum, vDataToHash) {
  var h = MurmurHash3(((nHashNum * 0xFBA4C795) + this.nTweak) & 0xFFFFFFFF, vDataToHash);
  return h % (this.vData.length * 8);
};

Filter.prototype.insert = function insert(data) {
  for (var i = 0; i < this.nHashFuncs; i++) {
    var index = this.hash(i, data);
    var position = (1 << (7 & index));
    this.vData[index >> 3] |= position;
  }
  return this;
};

Filter.prototype.contains = function contains(data) {
  if (!this.vData.length) {
    return false;
  }
  for (var i = 0; i < this.nHashFuncs; i++) {
    var index = this.hash(i, data);
    if (!(this.vData[index >> 3] & (1 << (7 & index)))) {
      return false;
    }
  }
  return true;
};


function MurmurHash3(seed, data) {

  var c1 = 0xcc9e2d51;
  var c2 = 0x1b873593;
  var r1 = 15;
  var r2 = 13;
  var m = 5;
  var n = 0x6b64e654;

  var hash = seed;

  function mul32(a, b) {
    return (a & 0xffff) * b + (((a >>> 16) * b & 0xffff) << 16) & 0xffffffff;
  }

  function sum32(a, b) {
    return (a & 0xffff) + (b >>> 16) + (((a >>> 16) + b & 0xffff) << 16) & 0xffffffff;
  }

  function rotl32(a, b) {
    return (a << b) | (a >>> (32 - b));
  }

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

  switch(data.length & 3) {
    case 3:
      k1 ^= data[i + 2] << 16;
    case 2:
      k1 ^= data[i + 1] << 8;
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
}

})(typeof exports !== "undefined" ? exports : this);