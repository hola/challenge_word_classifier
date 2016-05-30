var D={},
    M={},
    T="bcefghijklmnopqrstuvwxyz,jq,x,jk,hjkq,fjxz,x,h,bfhkmnqwxz,fhkqxz,kq,qz,knx,q,jz,gjkowxz,kz,z,fjqz,efjoqyz,hkqyz,jnqxz,fghjkmyz,cghjklqwxz,cefhjmpqvwxy".split(",");

exports.init = function(data){
	var d = data.toString().split("\n"),
      m=d[0].split(","),
      j=3;
	for(var i=1;i<data.length;i++){
		if(i>=1 && i<=30){
			D[j] = d[i].split(",");
			M[j] = parseInt(m[i-1]);
			j++;
		}else if(i==31){
			D["34"] = d[i].split(",");
			M["34"] = parseInt(m[i-1]);
		}else if(i==32){
			D["45"] = d[i].split(",");
			M["45"] = parseInt(m[i-1]);
		}else if(i==33){
			D["58"] = d[i].split(",");
			M["58"] = parseInt(m[i-1]);
		}
	}
}

exports.test = function(word){
	var w = word.replace(/'s$/,""),l=w.length;
  if(l==1)
    return true;
  else if(l==2)
    return T[0].indexOf(w[0])==-1?true:T[T[0].indexOf(w[0])+1].indexOf(w[1])==-1?true:false;
  else if(M[l]){
    var b = loc(w),
    buckets = D[w.length];
    if ((parseInt(buckets[Math.floor(b / 32)], 36) & (1 << (b % 32))) === 0) {
      return false;
    }
      return true;
  }else
    return false;
}

function loc(v){
	var m = M[v.length],
      a = hash(v),
      x = a % m,
      r = x < 0 ? (x + m) : x;
    return r;
}

function hash(v) {
  var a = 2166136261;
  for (var i = 0, n = v.length; i < n; ++i) {
    var c = v.charCodeAt(i),
        d = c & 0xff00;
    if (d) a = multi(a ^ d >> 8);
    a = multi(a ^ c & 0xff);
  }
  return mix(a);
}

function multi(a) {
  return a + (a << 1) + (a << 4) + (a << 7) + (a << 8) + (a << 24);
}

function mix(a) {
  a += a << 13;
  a ^= a >>> 7;
  a += a << 3;
  a ^= a >>> 17;
  a += a << 5;
  return a & 0xffffffff;
}