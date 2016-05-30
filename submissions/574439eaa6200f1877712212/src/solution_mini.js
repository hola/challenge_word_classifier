x="'s,s,ing,ed,able,ion,ine,en,er,ism,ist,et,est,ty,id,um,tic,ant,ar,ely,gly"
r=[]
y={}
exports.init = function(d) {
	h=0
	i=0;
	for(;i<60536;i++){
		b=d[i]
		for(j=0;j<8;j++){
			if (((b>>j)&1)==1)
				y[h]=0
			h+=1
		}
	}
	z = ""
	for(;i<64691;i+=5)
	{
		l=0
		s=""
		for(j=4;j>=0;j--)
			l=(l*256+d[i+j]);
		for (j=0;j<8;j++)
		{
			c=l&31;	
			l=l/32;
			if (c==31)
				s="'"+s;
			else
				s=String.fromCharCode(c+97)+s;
		}
		z+=s
	}
	for(i=0;i<64;i+=2)
		r.push("gxhxjqjxjzmxpxqcqdqhqjqkqmqpqvqxqyqzq'vbvfvjvqvxwxxjzx'j'q'x'z''".substring(i,i+2))
	for(i=0;i<6648;i+=3)
		r.push(z.substring(i,i+3))
	x=x.split(",")
}
exports.test=function(w) {
	l=w.length
	if (l==1||l==2)
		return 1
    for(i=0;i<x.length;i++){
		if (w.endsWith(x[i]))
			w = w.slice(0,w.length-x[i].length)
	}
	l=w.length
	if (l<=3||l>=15)
		return 0
	if (w.charAt(0)=="'")
		return 0
	for(i=0;i<r.length;i++){
		if (w.indexOf(r[i])>=0)
			return 0
	}
	h=0
	for (i=0;i<l;i++) {
		h=((w.charCodeAt(i)+(31*h))&0xffffffff)>>>0
	}
	if(h%484287 in y)
		return 1
	return 0
}
