var I = [],
    P = 0.622,
    PP = P * 0.5 / (0.5 + 0.5 * P),
    ALP = "'abcdefghijklmnopqrstuvwxyz",
    CRLN = [0, 31, 9, 13, 15, 11, 8, 7, 6, 6, 7, 7, 9, 10, 13, 17, 23, 34, 53, 84, 156, 267, 556, 1057, 1693, 3146, 16619, 9530, 13420, 6227, 16476, 5248, 8755, 7514, 3395].map( n =>  n / 10.0 ),
    CRLT = [11, 9, 12, 10, 10, 9, 15, 11, 11, 9, 51, 16, 9, 11, 9, 9, 11, 61, 9, 8, 9, 10, 17, 19, 39, 12, 34 ].map( i =>  i / 10.0 );

exports.init = function(buffer) {
  ids = buffer.swap16();
  for (var i = 0, l = ids.length; i < l; i += 2){
    a = ids[i];
    b = ids[i + 1];
    I.push((b << 8) + a);
  }
}
function sha(str1) {
  for (
    var blockstart = 0,
      i = 0,
      W = [],
      A, B, C, D, F, G,
      H = [A=0x67452301, B=0xEFCDAB89, ~A, ~B, 0xC3D2E1F0],
      word_array = [],
      temp2,
      s = unescape(encodeURI(str1)),
      str_len = s.length;

    i <= str_len;
  ){
    word_array[i >> 2] |= (s.charCodeAt(i)||128) << (8 * (3 - i++ % 4));
  }
  word_array[temp2 = ((str_len + 8) >> 2) | 15] = str_len << 3;

  for (; blockstart <= temp2; blockstart += 16) {
    A = H; i = 0;

    for (; i < 80;
      A = [[
        (G = ((s = A[0]) << 5 | s >>> 27) + A[4] + (W[i] = (i<16) ? ~~word_array[blockstart + i] : G << 1 | G >>> 31) + 1518500249) + ((B = A[1]) & (C = A[2]) | ~B & (D = A[3])),
        F = G + (B ^ C ^ D) + 341275144,
        G + (B & C | B & D | C & D) + 882459459,
        F + 1535694389
      ][0|((i++) / 20)] | 0, s, B << 30 | B >>> 2, C, D]
    ) {
      G = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
    }
    for(i = 5; i; ) H[--i] = H[i] + A[i] | 0;
  }
  for(str1 = ''; i < 4; )str1 += (H[i >> 3] >> (7 - i++ % 8) * 4 & 15).toString(16);
  return str1;
};
function letp(w) {
  var k_sum = w.split('').map( c => CRLT[ALP.indexOf(c)]).reduce((acc,c) => acc + c),
  total = k_sum / ( w.length * 1.07 );
  return total / (total + 1);
}
function ind(word) { return I.every( (l, i) => parseInt(sha(word.concat((i+1).toString())),16) != l - 1) }
exports.test = function(w) {
  if (ind(w)) {
    if (w.length > 24) {
      return false;
    } else {
      var clen = CRLN[w.length];
      plen = clen / (clen + 1.0) ;
      plet = letp(w);
      prob = plen + plet -0.5;
      return (2* prob - 1) >= PP ? false : true;
    }
  } else {
    return false;
  }
}
