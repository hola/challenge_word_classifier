var g = {};
var bits = 64500*8;
exports.init = function(data){
  var n = 0;
  for (var i = 0; i < data.length; i++){
    var b = data[i];
    var x = toBinary(b);
    for (var k = 0; k < 8; k++){
      if (x[k]==1)
        g[n] = 1;
      n++;
    }
  }
};

var toBinary = function(b){
  var result = [];
  while (b > 0){
    var x = b%2;
    b = b>>1;
    result.push(x);
  }
  while (result.length < 8)
    result.push(0);
  return result.reverse();
};
var h1 = function (s) {
  var hc = bh(s)%bits;
  if (hc < 0)
    hc += bits;
  return hc;
};
var h2 = function (s) {
  var hc = bh(s + "str1")%bits;
  if (hc < 0)
    hc += bits;
  return hc;
};
var bh = function(s){
  var hash = 0, i, chr, len;
  if (s.length === 0) return hash;
  for (i = 0, len = s.length; i < len; i++) {
    chr = s.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash;
};
exports.test = function(w){
  var b = splitf(w);
  if (b.length == 1)
    return b[0].length <= 3;

  for (var i = 0; i < b.length - 1; i++)
  {
    var s1 = b[i];
    var s2 = b[i+1];
    var bw = s1+"_"+s2;
    if (!g[h1(bw)]||!g[h2(bw)])
      return false;
  }
  return true;
}
var splitf = function(w){
  var ws = w.split('\'');
  var r = [];
  for (var k =0; k< ws.length; k++){
    var lastVowelIndex = -1;
    var startIndex = 0;
    var str = ws[k];
    for (var i = 0; i < str.length; i++)
    {
      var t = { 'e':1, 'y':1, 'u':1, 'i':1, 'o':1, 'a':1 };
      if (t[str[i]])
      {
        if (lastVowelIndex >= 0)
        {
          if (lastVowelIndex == i - 1)
          {
            r.push(str.substring(startIndex, i));
            startIndex = i;
          }
          else
          {
            r.push(str.substring(startIndex, i - 1));
            startIndex = i - 1;
          }
        }
        lastVowelIndex = i;
      }
    }
    r.push(str.substring(startIndex));
  }
  return r;
}