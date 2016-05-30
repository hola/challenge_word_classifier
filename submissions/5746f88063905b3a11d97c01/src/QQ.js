"use strict";
b=>{
var AL="abcdefghijklmnopqrstuvwxyz'".split(""),OT=2546;
function tb(o,n){
	let r=n%8;
	let x=b.readUInt8(o+(n-r)/8);
	return (x&(1<<r))>0;
}
function ord(w,o){
	o=w.charCodeAt(o)-97;
	if(o<0){o=(o+292)/9};
	return o;
}
function t2(w){
	return tb(0,26*ord(w,0)+ord(w,1));
}
function r(){
	let u=b.readUInt32BE(OT);
	OT+=4;
	let t=new Object;
	t.b31=(u>>31)&1;
	t.b30=(u>>30)&1;
	t.b29=(u>>29)&1;
	t.a=new Object;
	let i=0;
	for(;i<AL.length;i++){t.a[AL[i]]=!!(u&(1<<i))}
	return t;
}
function tt(t,w){
	if(w==""){return !!t.b30;}
	let c=(t.b29)?w.substr(-1):w.substr(0,1);
	w=(t.b29)?w.substr(0,w.length-1):w.substr(1);
	if(!t.a[c]){return false;}
	if(t.b31){return tt(t.a[c],w);}
	return true;
}
function trr(w){
	let i=0;
	for(;i+2<w.length;i++){
	if(tb(85,27*27*ord(w,i)+27*ord(w,i+1)+ord(w,i+2))){return false;}
	}
	return tt(T,w);
}
var T=r(), TQ=[T];
for(;TQ.length;){
	let t=TQ.shift();
	if(t.b31){
	let i=0;
        for(;i<AL.length;i++){
	if(t.a[AL[i]]){t.a[AL[i]]=r();TQ.push(t.a[AL[i]])}}
	}
}
return w=>{
	if(w.substr(0,1)=="'"){return false;}
	if(w.substr(-1,1)=="'"){return false;}
	if(w.length<2){return true;}
	if(w.length<3){return t2(w);}
	if(w.length>15){return false;}
	return trr(w);}
}
