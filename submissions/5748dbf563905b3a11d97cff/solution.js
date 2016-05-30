'use strict';let W=new Set(),$=w=>w.replace(/y/g,'i').replace(/[au]/g, 'o').replace(/[qjxzwvkfbg]/g,'q').replace(/'s/g,"").slice(0,6)
module.exports={init:b=>{
for(let d=b.toString(),t=d.split(/\d+/),o=d.split(/\D+/),p=t[0],i=0;i<t.length;++i)
W.add(p=p.slice(0,o[i])+t[i])
for(let v of[...W].filter(h=>h.length>6)){W.delete(v)
let s=v.slice(0,5)
for(let c of v.slice(5))W.add(s+c)
}
},test:w=>w.length<16&&/^[a-z]+('s)?$/.test(w)&&(w.length>5||!/[eaoiu]{9,}|[^eaoiu]{9,}|[qj]$|[vhwq][xjq]/.test(w))&&W.has($(w))}