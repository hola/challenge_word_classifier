var D,S=["'s","s","ed","ing","able","ly","nes","er","ation"],P=["over","non","under","un","pre","anti","inter","out","semi","sub","super"];
var x=function(a){t,q=0;for(i=0;i<3;){t=a.charCodeAt(i++)-97;t=t<0?26:t;q=q*27+t;}return q;}
var _i=function(d){D=d;}
var _t=function(z)
{var i,L,L2,q,T1=0,T2=0,T3=0,h;L=z.length;
if(L<2||L>16)return 0;
for(i=0;i<L;++i){t=z.charCodeAt(i)-97;if(t<0)++T1;else{if((0x3EFBEEE>>>t)&1){T3=0;if(++T2>6)return 0;}else{T2=0;if(++T3>4)return 0;}}}
if(T1>1||(T1&&z.indexOf("\'s")!=L-2))return 0;
for(q=0;q<9;++q){L2=S[q].length;if(L>=L2+4 && z.lastIndexOf(S[q])==L-L2){z=z.substr(0,L-L2);L-=L2;}}
for(q=0;q<11;++q){L2=P[q].length;if(L>=L2+4&&z.indexOf(P[q])==0){z=z.substr(L2);L-=L2;}}
for(h=i=0;i<L;++i){h+=z.charCodeAt(i);h+=h<<10;h^=h>>>6;}h+=h<<3;h^=h>>>11;h+=h<<15;
T1=x(z);T2=x(z.substr(L-3));T3=x(z.substr(L-3));T3=z.charCodeAt(L-1)-97;T3=T3<0?26:T3;T3+=x(z.substr(L-4))*27;
if((L>2 && ((D[Math.floor(T1/8)]>>(T1%8))&1))||(L>10 && ((D[2461+(T2/8|0)]>>(T2%8))&1))||(L>11 && ((D[4922+(T3/8|0)]>>(T3%8))&1)))return 0;
h=(h>>>0)%(8*60480);return ((D[71353+h/8|0]>>(h%8))&1);}
module.exports.test=_t;
module.exports.init=_i;
