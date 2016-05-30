var sbs;
function init(data) {
  sbs=data.toString().split("\n").map( function(p) { return p.split(" ").map( function(l){ return parseInt(l,10)} ) });
  sbs.forEach( function(p,i) {sbs[i][3]=sbs[i][2]>>3; sbs[i][2]&=7;}) }
function test(word) {
  var l=word.split("").map(function (a) { return a.charCodeAt(0);});
  var step=0;
  sbs.forEach(function(pair,nr) { for(var i=0; i<l.length-1; i++) if (pair[0]===l[i] && pair[1]===l[i+1]) { l.splice(i,2,nr+1) ; step++; } } );
  var lsum1=l.reduce(function (sum,curr){return curr+sum;});
  var lpos=l.reduce(function (pbits,c,i){ return pbits|(sbs[c-1][2]&(1<<i))} , l.length<3 ? 4 : 0);
  l.sort(function (a, b) {return a - b;});
  cl=l.map(function(c) { return sbs[c-1][3] ;} ).sort(function(a,b) {return a-b;});
  for(var c=1; c<cl.length; c++) {
    if ( ( cl[c-1] === cl[c] ) && (cl[c]!==0) ) {
      return false;
    }
  }
  return ((l.length===2&&step>1) || (l.length===3&&step>2)) && lpos===7&&lsum1>840&&lsum1<31000 }
module.exports.init=init;
module.exports.test=test;