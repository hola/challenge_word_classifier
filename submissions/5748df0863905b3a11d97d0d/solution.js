var w=[5,29,1,185760,10813,11283],c=6+w[3],i,j,p=0,y,f,n=0,r
exports.init=(d)=>{for(;n<3;)for(w.push(r=w[n++]),i=1;i<w[n+2];++i){for(y=0;!(d[p>>3]&1<<p%8);++y,++p);++p
f=0;for(j=0;j<y;++j)if(d[p>>3]&1<<p++%8)f|=1<<j;w.push(r+=f+=1<<y)}r=28}
exports.test=(x)=>{t=(x,i)=>x[i]=="'"?27:x.charCodeAt(i)-96
u=(i)=>i?" xqj'vzwfkbgphdmcntlrysiueoa"[i]:""
v=(i)=>t(" bojkaspqewthlicn{fdgmvuyrxz",t(x,i))
f=x.length
if(f>4)for(i=0;i<w[4];)if(f>15||x.indexOf(u((p=w[c+i++])%r)+u((p/r|0)%r)+u(p/784|0))+1)return 0
y=~f&1;for(k in x)y|=1<<t(" bpjncmqlfplhmgdopeakiosrrqs",t(x,k))
return f<5?w.indexOf(v(0)+((f>1)*v(1)+(f>2)*v(2)*r+(f>3)*v(3)*784)*r,-w[5])+1:w.slice(6,c).indexOf(y)+1}