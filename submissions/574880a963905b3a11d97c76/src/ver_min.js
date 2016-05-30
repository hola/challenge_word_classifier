var S, H, M; module.exports = {

test:function (s){
  var n=0, c, w, p, f=false, l=s.length;

  if(s.slice(-2)=="'s") { s=s.slice(0, l-2); }
  if(s[0]=="'" || s.slice(-1)=="'") return f;
  if(l==1) return true;

  w = s.slice(10); // P.hw=10
  l = w.length;
  if(l>2) {
    for(var i=0; i<l; i++){
      c = w.charCodeAt(i);
      c = (c==39) ? 27 : c-96
      n += 1/c;
    }
    if(!H[ Math.round(445*l/n) ]) return f; // P.h=445
  }

  for(var i=0; i<5; i++) s = s.split(["es","in","er","an","on"][i]).join(i+''); // P.en=5

  for(n=0; n<5; n++){ // P.kol=5
    w = s.slice(n*4, (n+1)*4);
    if(w.length<2) break;
    if(!S[n][M[w]]) return f;
  }
  return true;
},

init:function init(buf){
  M = {};
  S = {};
  H = {};

  var A="43210eaicypstouhxvqwflkzj'ngmrbd", //P.en=5
    i, n=0, m=27+5, j, k, l, s, b, I = [];

  for(i=0; i<m; i++) 
  for(j=0; j<m; j++) 
    M[A[i]+A[j]]=n++;
  for(i=0; i<m; i++) 
  for(j=0; j<m; j++) 
  for(k=0; k<m; k++)
    M[A[i]+A[j]+A[k]]=n++;
  for(i=0; i<m; i++)
  for(j=0; j<m; j++)
  for(k=0; k<m; k++)
  for(l=0; l<m; l++)
    M[A[i]+A[j]+A[k]+A[l]]=n++;
  
  M.L = n;

  for(i=0; i<buf.length; i++){
    s = buf[i].toString(2);
    I.push('0'.repeat(8-s.length) + s);
  }
  s = I.join('');

  I = [];
  i = 0;
  while(i<s.length){
    j = 0;
    while(s[i]==1 && j<15) {i++;j++;}
    if(j < 15) i++;
    n = s.slice(i,i+j+3);
    
    if(n.length<j+3) break;
    i += j+3;
    j--;
    n = parseInt(n,2);
    for(;j>=0;j--) n += (1<<(j+3))-1;
    I.push(n);
  }

  n = 0;
  I.map(function(w){
    n += w-0;
    b = Math.floor(n/M.L);
    if(b>9) b = 9; // P.kol=5
    if(!S[b]) S[b]={};
    S[b][n - b*M.L] = 1;
  });

  for(n=0; n<4; n++){ // P.kol=5
    for(var w in S[5+n]){ // P.kol=5
      S[n][w]=1;
      S[n+1][w]=1;
    }
  }
  H = S[9]; // P.kol=5
}

};
