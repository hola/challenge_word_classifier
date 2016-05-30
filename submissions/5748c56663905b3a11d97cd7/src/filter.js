var digrams = ['er', 'in', 'es', 'ti', 'on', 'an', 'te', 'is', 'at', 're', 'en', 'al', 'ri', 'ra', 'le', 'st', 'ne', 'ar', 'li', 'ic', 'ro', 'ng', 'ed', 'or', 'nt', 'se', 'la', 'it', 'un', 'co', 'ni', 'ca', 'de', 'ss', 'ia', 'ta', 'to', 'ch', 'io', 'ma', 'el', 'll', 'tr', 'he', 'us', 'me', 'no', 'di', 'lo', 'as', 'na', 'ol', 'ou', 'et', 'si']
var rareDigrams = ['gk', 'qa', 'wg', 'cb', 'fb', 'fd', 'zb', 'kg', 'mk', 'fh', 'cf', 'cg', 'xf', 'xb', 'bk', 'fp', 'xm', 'fw', 'vn', 'zm', 'kj', 'fg', 'zk', 'zs', 'lj', 'xw', 'zw', 'cw', 'qi', 'zt', 'zn', 'pv', 'hz', 'vt', 'vd', 'zd', 'fk', 'wz', 'pj', 'mj', 'gj', 'lq', 'vc', 'zc', 'zr', 'zv', 'js', 'jr', 'rx', 'vk', 'xd', 'cv', 'hj', 'jn', 'gz', 'qs', 'hq', 'mz', 'vm', 'yy', 'zp', 'gv', 'tq', 'xn', 'jc', 'jd', 'xv', 'yj', 'dq', 'xx', 'zg', 'lx', 'wv', 'xr', 'vg', 'vp', 'bz', 'xg', 'jh', 'jy', 'xq', 'jp', 'qe', 'fj', 'jk', 'vh', 'qr', 'bq', 'jl', 'jm', 'jt', 'dx', 'mq', 'qt', 'tx', 'bx', 'jj', 'mx', 'ql', 'qq', 'vf', 'yq', 'zf', 'fv', 'qm', 'wj', 'fz', 'pq', 'pz', 'qd', 'qo', 'qw', 'sx', 'zq', 'cj', 'jf', 'jg', 'jw', 'qn', 'vz', 'cx', 'fx', 'jb', 'gq', 'jv', 'kq', 'px', 'qb', 'qc', 'qf', 'qv', 'vb', 'vw', 'vx', 'fq', 'kz', 'qk', 'qp', 'xk', 'xz', 'kx', 'qg', 'qh', 'qy', 'wq', 'zj', 'gx', 'hx', 'vj', 'wx', 'jq', 'jx', 'jz', 'qj', 'qx', 'qz', 'vq', 'xj', 'zx'];
var volwes = 'aeiouy';
var buffer;

exports.init = function(b){
  buffer = b;
}

exports.test = function(word){
  word = word.toLowerCase();
  
  if (word.length >= 2 && (word.substr(word.length - 2, 2) == '\'s')){
    word = word.replace('\'s', '');
  }
  
  if (!bloom(word.length > 8 ? word.substr(0, 8) : word)){
    return false;
  }
  
  var probability = 0.5;
  if (word.indexOf('\'') >= 0){
    return false;
  }
  if (word.length > 13){
    return false;
  }
  for(var i = 0; i < rareDigrams.length; i++){
    if(word.indexOf(rareDigrams[i]) >= 0){
      return false;
    }
  }
  if (word.length <= 3){
    return true;
  }
  var consonantsLength = 0;
  for (var i = 0; i < word.length; i++){
    if (volwes.indexOf(word[i]) >= 0){
      consonantsLength = 0;
    } else{
      consonantsLength++;
    }
    if (consonantsLength == 6){
      return false;
    }
    if (consonantsLength == 5){
      probability -= 0.30;
    }
  }
  var firstSymbol = word.substr(0, 1);
  var lastSymbol = word.substr(word.length - 1, 1);

  if (firstSymbol == 's'){
    probability += 0.1;
  }
  if (lastSymbol == 's'){
    probability += 0.15;
  }
  if ('pc'.indexOf(firstSymbol) >= 0){
    probability += 0.05;
  }
  if ('eyd'.indexOf(lastSymbol) >= 0){
    probability += 0.05;
  }
  if ('xy'.indexOf(firstSymbol) >= 0){
    probability -= 0.15;
  }
  if ('qjvzb'.indexOf(lastSymbol) >= 0){
    probability -= 0.20;
  }
  for(var i = 0; i < digrams.length; i++){
    if(word.indexOf(digrams[i]) >= 0){
      probability += word.length <= 5 ? 0.4 : 0.3;
    }
  }
  
  return probability > 0.5;
}

function hashCode(s){
  return Math.abs(s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0))%(64000*8);
}

function bloom(word){
  var hash = hashCode(word);
  var pos = ~~(hash / 8);
  var mask = 128 >> (hash%8);
  var val = buffer.readUInt8(pos);
  return mask & val;
}