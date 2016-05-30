var w2_data='';

exports.init= function(data) {
//  w_data= fs.readFileSync('./re1.csv').toString();
  w2_data= data;
}

exports.test= function(word) { 
  var w2= new Object(); 
    w2.c10=String.fromCharCode(10);
    w2.ps ='|^-^,^-^|'; w2.p=w2.ps.split('^');
    w2.l =word.length; 
    w2.lt=16; //if (w2.l<=4) w2.lt=4; if (w2.l>8) w2.lt=9; 
  word= word.toLowerCase();
  if (w2.l>30) { return (w2_data.indexOf('#'+word+w2.c10)>=0); }

  var st=word; 

  w2.cl=4;
  for (var ii=0; ii <w2.l; ii=ii+w2.cl) { 
    w2_is(w2,st,w2.cl,ii); if (w2.i4<0) {return false;}   }
  w2.cl=3;
  for (var ii=2; ii <w2.l; ii=ii+w2.cl) { 
    w2_is(w2,st,w2.cl,ii); if (w2.i4<0) {return false;}   }
  return true; }

function w2_is(w2,st,ic,ii) { w2.i4 =-99; 
  w2.ss=w2.c10+'-'+ic+'|.|'+w2.lt;
  w2.dat=w2_data.split(w2.ss)[1].split(w2.c10+'-')[0];
  w2.a0 =w2.dat.split(w2.c10+ii+'|'+st.substr(ii,1)+'|');
  if (w2.a0.length<=1) {return;}
  w2.a0 =w2.a0[1].split(w2.c10); w2.i1=0;
  for (var i=1; i<ic; i++) { 
    w2.a0 =w2.a0[w2.i1].split(w2.p[i+4-ic]);
    w2.ss =st.substr(ii+i,1); 
    w2.i1 =w2.a0[0].indexOf(w2.ss);
    if (w2.i1<0) {return;}
    if (w2.l<=(ii+i)) {w2.i4=w2.i1; return;}
//echo(ii+':'+i+w2.ss+','+st+','+w2.i1+','+w2.a0[0]+'^'+1+','+w2.p[i+4-ic] ); //
    w2.i1++; 
  }
  w2.i4 =w2.i1;
  return; }

function repAlls(s,a,rp){for (i=0; i<a.length; i++) s=s.split(a.substr(i,1)).join(rp); return s;}
