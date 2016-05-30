

var fs = require('fs');
var words = fs.readFileSync("/dev/stdin").toString().split("\n");
var pairs = [];
var maxp, maxpair0,maxpair1;
var substn=127;
var data = words.map( function(w){ var res=[]; for (var i=0; i<w.length; i++ ) res[i]=w.charCodeAt(i); return res;});

function pairinc(l1,l2,n) {
  if ( pairs[l1] === undefined ) pairs[l1]=[]; if (pairs[l1][l2] === undefined ) pairs[l1][l2] = 0;
  pairs[l1][l2]+= n;
}

data.map( function (w) { for(var i=0; i<w.length-1; i++) {  pairinc(w[i],w[i+1],1); } });

// find the most frequently pair of characters and replace with new code, repeat this 15000 times
do {
  substn++;
  maxp=0; maxpair0=0; maxpair1=0;
  pairs.forEach(function (l1,i1) { l1.forEach( function (l2,i2)  { if( l2>maxp ) { maxpair0=i1; maxpair1=i2; maxp=l2; }  }  ) } );
  data.map( function (w) {    for(var i=0; i<w.length-1; i++) {
                                    if ( w[i] === maxpair0 && w[i+1] === maxpair1 ) {
                                        pairinc( w[i], w[i+1], -1 );
                                        if ( i>0 )          { pairinc(w[i-1],w[i],-1);   pairinc(w[i-1],substn,1); }
                                        if ( i<w.length-2 ) { pairinc(w[i+1],w[i+2],-1); pairinc(substn,w[i+2],1); }
                                        w.splice(i,2,substn);
                                    }
                                }
                            });
  console.log(maxpair0,maxpair1,maxp,substn);
  delete pairs[maxpair0][maxpair1];
} while ( substn < 15000 );

console.log("ok1");

data.map( function (w) { var s="";   for(var i=0; i<w.length; i++) s=s + w[i] + " "; console.log(s);    });
