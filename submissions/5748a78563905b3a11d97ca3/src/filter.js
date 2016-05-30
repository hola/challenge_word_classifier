// http://closure-compiler.appspot.com/home
var z; 
function a(c){z=c;}
function b(w){
	if(/.{17}|^'|'$|[^eyuioa']{5}|'[^s]|'s.|yy|mmm|ooo|lll|sss|w[xqj]|d[xq]|x[jzkqgxr]|j[^'adeinorsu]|yq|k[xzq]|hx|g[xq]|f[qxzvj]|t[xq]|v[qjbxwfzhpgm]|m[xq]|sx|p[xqz]|c[xj]|q[^'aisu]|b[xqz]|z[xjqf]/.test(w)) return false;
	if(w.length==1) return true;
	
	w=w.replace(/'s$/, '').replace(/s$/, '');
	
	if(w.length>7)
		w=w.substr(0,4) + w.substr(w.length-3);
	var h=2166136261;
	for (var i=0;i<w.length;i++){
		h^=w.charCodeAt(i);
		h += (h<<1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
	}
	h=(h>>>0)%(82800<<3);
	return ((z[h>>3]>>>(h&7))&1)==1;
}
module.exports={init:a,test:b}
