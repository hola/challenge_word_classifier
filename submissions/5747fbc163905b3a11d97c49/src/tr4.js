var t=['bq','bw','bg','bz','bx',
'cw','cp',/*'cd',*/'cf','cg','cj','cz','cx','cv','cb',/*'cm',*/'cc',
'dq','dk','dz','dx',
'fq','fw','fp','fd','fg','fh','fj','fk','fz','fx','fc','fv','fb','fn','fm',
'gq','gp','gj','gk','gz','gz','gx','gc','gv',
'nx',
'jq','jw','jr','jt','jy','jp','js','jd','jf','jg','jn','jj','jk','jl','jz','jx','jc','jv','jb','jn','jm',
'kq','kd','kg','kj','kz','kx','kc','kv',
'lq','lj','lz','lx',
'mq','mg',
'mj','mk','mx','mv',
'hq','hg','hj','hx',
'pq','pd','pg','pj','pk','pz','px','pv',
'qq','qw','qe','qr','qt','qy','qi','qo','qp','qa','qs','qd','qf','qg','qh','qj','qk','ql','qz','qx','qc','qv','qb','qn','qm',
'rx',
'sj','sz','sx',
'tq','tj','tk','tx',
'uq','uw','un',
'vq','vw','vt','vp','vd','vf','vg','vh','vj','vk',
'vz','vx','vc','vv','vb','vn','vm',
'wq',
'wg','wj','wz','wx',
'xq','xw','xr','xs','xd','xf','xg','xj','xk','xl','xz','xx','xv','xb','xn','xm',
'yq','yy','yj',
'zq','zw','zr','zt','zp','zs','zd','zf','zg','zh','zj','zk','zx','zc','zv','zb','zn','zm'
]
var fs=require("fs")
var words2=fs.readFileSync( 'words.txt' ).toString().toLowerCase().trim()
var words=words2
var l={}
for (var i = t.length - 1; i >= 0; i--) {
	var z=0
	while(words.search(t[i])!=-1){
		words=words.slice(words.search(t[i])+1)
		z++
		console.log(words.length)
	}
	l[t[i]]=z
	words=words2
}
for(var lll in l){
	if (l[lll]>60) {
		delete l[lll]	
	}
}
var tte=[]
for(var lt in l){
	tte.push(lt)	
	
}
fs.writeFileSync("symbl.txt",JSON.stringify(tte))