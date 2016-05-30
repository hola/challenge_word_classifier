var name='ver';
var S, H, P, M;
var AB="eaicypstouhxvqwflkzj'ngmrbd";
var Se=["es","in","er","an","on","ti","te","is","en"];
var Re=["_", "^", "]", "\\", "[", "Z", "Y", "X", "W"]; //9
Y = [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];
//console.log(Y);

function expand(e){
  for(var i=0; i<P.en; i++) e = e.split(Se[i]).join(Re[i]);
  return e;
}

function hash(w){
  w = w.slice(P.hw);
  if(w.length<3) return 0;
  var c, n = 0;
  for(var j=0; j<w.length; j++){
    c = w.charCodeAt(j);
    c = (c==39) ? 27 : c-96
    n += 1/c;
  }
  return Math.round(P.hash*w.length/n);
}

function test(so, mode){
  var n, w, c, p, f=false, t=true, last, s;
  if(so.slice(-2)==="'s") { so=so.slice(0,so.length-2);}
  if(so[0]=="'"||so.slice(-1)=="'") return f;
  if(so.length==1) return t;
  if(H[hash(so)]===undefined) return f;
  s=expand(so);

  for(n=0, p=0, x=P.suf; n<P.kol; n++){
    w = s.slice(p, p+x);
    if(w.length<2) break;
    c = M[w];

    if(S[n][c] ===undefined) return f;
    p += x;
  }
  return t;
}

function init(buf, par){
  var fs = require('fs');
  //console.log('init', par);
  P = par;
  if(!M) genM();

  S={};
  H={};
  var I = [];
  for(i=0; i<buf.length; i++){
    var s = buf[i].toString(2);
    s = '0'.repeat(8-s.length) + s;
    I.push(s);
  }
  //fs.writeFileSync(name+"__b"+'.txt', I.join(''));

  s = I.join('');
  I = [];
  i = 0;
  k = Y;
  while(i<s.length){
    j = 0;
    while(s[i]==1 && j<k.length-1) {
      i++;  
      j++;
    } 
    if(j < k.length-1) i++;
    n = s.slice(i,i+k[j]);

    if(n.length<k[j]) break;
    i+=k[j--];
    n = parseInt(n,2);
    for(;j>=0;j--) n+= (1<<k[j])-1;
    I.push(n);
  }
  //fs.writeFileSync(name+"__N"+'.txt', I.join('\n'));

  var n=0, m;
  for(i=0; i<I.length; i++){
    n += I[i]-0;
    b = Math.floor(n/M.L);
    if(b>P.kol*2-1) {
      b = P.kol*2-1; // last hash
    }
    m = n - b*M.L;
    if(!S[b]) S[b]={};
    S[b][m] = 1;
  }

  for(n=0; n<P.kol*2; n++){
    if(S[n]) {
      var t = Object.keys(S[n]);
      //console.log(P.kol, n, t.length);
      //fs.writeFileSync(name+"__w"+n+'.txt', t.sort().join('\n'));
    }
  }

  for(n=0; n<P.kol-1; n++){
    for(var w in S[P.kol+n]) {
      S[n][w]=1;
      S[n+1][w]=1;
    }
  }

  H = S[P.kol*2-1];
  //fs.writeFileSync(name+"__h"+'.txt', Object.keys(H).sort().join('\n'));
}

module.exports = {test:test,init:init,gen:gen};

function gen(file, par){
  var fs = require('fs');
  var zlib = require('zlib');
  P = par;

if(1){

  genM();
  H = {};
  S = {}; 
  var I = fs.readFileSync(file,'utf8').split('\n');
  var Il = I.length;
  var D = {};
  var IM = [];

  for(var i=0; i<Il; i++){
    var s = I[i];
    if(s.length<2) continue;
    if(s.slice(-2)==="'s") { s=s.slice(0,s.length-2);}
    H[hash(s)] = 1;
    IM.push(expand(s));
  }
  var Il = I.length;
  I = null;

  var x=P.suf, n, w, last, c, p=0, m, k, d;
  
  for(n=0; n<P.kol*2; n++) { D[n]={}; }
  for(n=0; n<P.kol; n++) { S[n]={}; }

  for(n=0; n<P.kol; n++){
    k = 0; d = 0;
    m = n + P.kol - 1;
    for(var i=0; i<Il; i++){
      var s = IM[i];
      w = s.slice(x*n, x*(n+1));
      if(w.length<2) continue;
      c = M[w];

      S[n][c]=1;
      if(n>0){
        if(D[n-1][c] !== undefined){
          D[m][c] = 1;
          delete(D[n-1][c]);
          d++;
          continue;
        }
        if(D[m][c] !== undefined) continue;
      }
      if(D[n][c] === undefined){
        D[n][c] = 1;
        k++;
      }
    }
    //console.log(n,k,d);
  }
  IM = null;

  for(n=0; n<P.kol*2; n++){
    //if(!S[n]) S[n]={};
    //if(S[n]) fs.writeFileSync(name+"_w"+n+'.txt', Object.keys(S[n]).sort().join('\n'));
  }

  var N = [];
  for(var i=0; i<P.kol*2; i++){
    var t = (i===P.kol*2-1) ? H : D[i];
    if(t){
      Object.keys(t).forEach(function(w){    
        n = (w-0) + M.L*i;
        N.push(n); 
      });
    }
  }
  D = null;
  
  N = N.sort(function(a,b){return(a>b)?1:-1;}).map(function(w,i,a){ 
    var n = (i==0) ? w : w-a[i-1];
    return n; 
  });
  //fs.writeFileSync(name+"_h"+'.txt', Object.keys(H).sort(function(a,b){a-=0;b-=0;return(a>b)?1:-1;}).join('\n'));
  fs.writeFileSync(name+"_N"+'.txt', N.join('\n'));
  //fs.writeFileSync(name+"__N"+'.txt', I.join('\n'));

} else N = fs.readFileSync(name+"_N"+'.txt','utf8').split('\n');

  N = N.map(function(w,i,a){
    var n = w-0;
    var p = '0', l = Y[0];
    for(var i=0; i<Y.length; i++){
      var x = (1<<Y[i])-1;
      if(n>x) { 
        if(i==Y.length-1){
          console.log('overflow', w);
          break;
        }
        n -= x; 
        l = Y[i+1];
        if(i==Y.length-2){
          p = '1'.repeat(Y.length-1);
        } else {
          p = '1' + p; 
        }
      }
    };
    n = n.toString(2);
    if(n.length>l){
      console.log(w-0,p,l,n);    
    }
    n = '0'.repeat(l-n.length) + n;
    return p+n; 
  });

  N = N.join('');
  if(N.length%8){
    N = N + '1'.repeat(8-N.length%8); 
  }
  //fs.writeFileSync(name+"_b"+'.txt', N);
  //fs.writeFileSync(name+"_b"+'.txt', N, 'binary');
  var B = [];
  s = '';
  for(var i=0; i<N.length; i++){  
    s += N[i];
    if((i+1)%8===0){
      B.push(String.fromCharCode(parseInt(s,2)));
      s = '';
    }
  }
  s = B.join(''); 
  var buf=new Buffer(s,'binary');
  fs.writeFileSync('data.gz', zlib.gzipSync(buf, {level: zlib.Z_BEST_COMPRESSION, strategy:zlib.Z_FILTERED}));
}

function genM(){
  var A = AB; 
  for(var i=0; i<P.en; i++) A=Re[i]+A;
  M = {};
  var w, n=0, m=A.length;
  for(var i=0; i<m; i++)
  for(var j=0; j<m; j++){
    w=A[i]+A[j];
    M[w]=n;
    M[n++]=w;
  }

  for(var i=0; i<m; i++)
  for(var j=0; j<m; j++)
  for(var k=0; k<m; k++){
    w=A[i]+A[j]+A[k];
    M[w]=n;
    M[n++]=w;
  }
  M.L = n; 
  //console.log(n);
  if(P.suf==3)return;

  for(var i=0; i<m; i++)
  for(var j=0; j<m; j++)
  for(var k=0; k<m; k++)
  for(var l=0; l<m; l++){
    w = A[i]+A[j]+A[k]+A[l];
    M[w] = n;
    M[n++]=w;
  } 
  M.L = n; 
  //console.log(n);
}
