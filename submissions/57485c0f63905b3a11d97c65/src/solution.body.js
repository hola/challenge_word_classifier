var A = "abcdefghijklmnopqrstuvwxyz$", P = {}, C = {};

/* Building conditional probabilities */
for (var i = 0; i < 26; i++) {
  for (var j = 0; j < 26; j++) {
    var s = [B[O++],B[O++],B[O++]], k = A[i]+A[j];
    P['^' + k[0]] = (P['^' + k[0]] || 0) + s[0];
    P['^'] = (P['^'] || 0) + s[0];
    P['^' + k] = (P['^' + k] || 0) + s[0];
    P[k[0]] = (P[k[0]] || 0) + s[1];
    P[k] = (P[k] || 0) + s[1];
    P[A[j] + '$'] = (P[A[j] + '$'] || 0) + s[2];
  }
}

/* Calculating cumulative probabilites */
for (var k in P) {
  if (k == '^') continue;
  var p = k.substr(0, k.length - 1);
  for (var i = 0; i < 27; i++) {
    C[p + A[i]] = (C[p + A[i]] || 0) + (i > A.indexOf(k[k.length - 1]) ? P[k] : 0);
  }
}

exports.test = function(W,x,l,v,e,p,f,h) {
  /* Too long words discarded, 's stripped, other words with apostrophes discarded */
  if ((W = W.replace(/'s$/,'')).indexOf("'") > -1 || W.length > 15) {
    return false
  }
  /* Arithmetic coding */
  x = 0.0, l = 1.0, v = [];
  for (var i = 0; i <= W.length; i++) {
    e = W.substring(i - 2, i + 1) + (i == W.length ? '$' : '');
    f = e.substr(0, e.length - 1);
    /* Get probability of the next symbol based on the previous one */
    if (e.length < 3) {
      p = [C['^'+e], P['^'+e], P['^'+f]]
    } else {
      e = e.substr(1), f = f.substr(1), p = [C[e], P[e], P[f] + P[f+'$']]
    }
    /* Impossible bigram encountered */
    if (!p[2]) {
      return false
    }
    /* Update interval */
    x += p[0] * l / p[2], l *= p[1] / p[2];
    /* Collect all probabilites */
    v.push(p[1] / p[2]);
  }
  v.sort();
  /* Magically hashing the encoding result */
  h = (((x + l * 0.5) * 12064428) | 0) % 639001;
  /* Checking Bloom filter and weighted average of two least probable characters in the word */
  return !!(B[O + (h >> 3)] & (1 << (h & 7))) && (v[0]*3 + v[1] > 0.01);
}
