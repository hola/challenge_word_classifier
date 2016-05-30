
function crossp(o,p) {
  return ( conMatrix[o][p>>5] & (1<<(p&31)) )  !==0 ;
}
function crossd(o,p) {
  conMatrix[o][p>>5] |= (1<<(p&31)) ;
  conMatrix[p][o>>5] |= (1<<(o&31)) ;
}

// read data
var dimension=15001;
var fs = require('fs');
var words = fs.readFileSync("resnew.dat").toString().split("\n").map( function(p) { return p.split(" ").map( function(l,i){ return parseInt(l,10); } ); });

// fill matrix and aux arrays
var m= new Array(dimension);
var msum= new Array(dimension);
var midx= new Array(dimension);
var mclr= new Array(dimension);
var crossij;

msum.fill(0);
mclr.fill(0);
for(var i=0; i<midx.length; i++) {midx[i]=i; };
var conMatrix=m.fill([]).map(function() { var t = new Array(((dimension)>>5)+2); return t.fill(0);});

// count matrix
words.forEach( function (w) {
  for(var il=0; il<w.length; il++)
    for(var jl=il+1; jl<w.length; jl++) {
      crossd(w[il],w[jl]);
      msum[w[il]]++;
      msum[w[jl]]++;
      //console.log(w[il],w[jl]);
    }
});

//print matrix
//conMatrix.forEach(function(row) {  var s="";   for(var il=0; il<row.length; il++) for(var bit=0; bit<32; bit++) {  if((row[il]&(1<<bit))!==0)  s+="1";  else   s+="0"; } console.log(s); });

// sort matrix rows
midx.sort(function(a,b) {return msum[b]-msum[a];} );

for(m=0;m<midx.length && msum[m]===0;m++) {}
// paint graph
var c=1,ipow;
for(var i=0; i<conMatrix.length ; i++) {
  ipow=0;
  idx=midx[i];
  if (mclr[idx]!==0)
    continue;
  mclr[idx]=c;
  c++;
  //console.log(" = ",i,idx,mclr[idx]);
  for(var j=i+1; j<conMatrix.length ; j++) {
    jdx=midx[j];
    if(mclr[jdx]!==0)
      continue;
    crossij=false;
    for(var k=i; k<j; k++) {
      kdx=midx[k];
      //console.log(" === ",idx,jdx,kdx,mclr[jdx]);
      if ((mclr[kdx]===mclr[idx]) && crossp(kdx,jdx)) {
        crossij=true;
        break;
      }
    }
    if ( ! crossij ) {
      mclr[jdx]=mclr[idx];
      //console.log(" == ",idx,jdx,mclr[jdx]);
      ipow++;
    }
  }
  console.log(" = ",idx,ipow,mclr[idx]);
}

mclr.forEach( function(e,i){ console.log(i,e)});
