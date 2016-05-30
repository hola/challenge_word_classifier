D={}
S={}
c=0
p=2640000
R=(w,W)=>{if(c>13100000)return D[w]>c/p
D[w]?++D[w]:D[w]=1
S[W]?++S[W]:S[W]=1
return ++c>2640000?(S={},D[w]>c/p):S[W]>c*3/p}
t=(h)=>(d[Math.floor(h/8)]>>>(h%8))&1
h=(w,s)=>{r=1
for(i of w)r=(s*r+i.charCodeAt(0))&0x7FFFFFFF
return r}
e=exports
e.init=(i)=>d=i
e.test=(w)=>{s=548863
V=w
"'s s ing ed nesse ly nes ation able er al est ility ate like ship itie ville les ment e ic ou ism ist ology ity y i iform oid ful ing".split(' ').map((s)=>{if(w.endsWith(s))w=w.slice(0,0-s.length)})
"un non over super inter anti pre sub semi out der ps".split(' ').map((s)=>{if(w.startsWith(s))w=w.slice(s.length,w.length)})
return!w.split(/[aeiou]/).filter((w)=>w.length>4).length>0&w!=""&w.split(/['ijqy]/).pop().length>0&w[0]!='x'&R(V,w)&t(h(w,2)%s)&t(h(w,111)%s)}