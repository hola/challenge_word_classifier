tab=[]

function test(a){
	if(a.length==4||a.length>15||max_cons(a)>4||has_garbage(a))return
	return tab[meiyan(do_magic(a))%tab.length]
}

function init(buf){
	var data=[],i,l,x=6
	for(i=0;i<3;i++)l=buf.readUInt16LE(i*2),data.push(buf.slice(x,x+l).toString('binary')),x+=l
	global.eval(data[1])
	var i,f,s,b=new bb(),a=data[0]
	for(f=0;f<a.length;f+=2)b.z.push((a.charCodeAt(f)<<8)+a.charCodeAt(f+1))
	s=mod.dec(b)
	for(i=0;i<s.length;i++)tab.push(parseInt(s[i]))
	unzip_garbage(data[2])
}

module.exports.init=init
module.exports.test=test

