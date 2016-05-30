e=exports;

abc=[]
for(i=0;i<26;i++)
	abc[i]=String.fromCharCode(97+i)
//console.log(abc,abc[0])

allLetters=(len)=>{
	if(len==1)
		return abc
	
	var p=allLetters(len-1),r=[]
	for(j=0;j<p.length;j++)
	for(i=0;i<26;i++)
		r.push(p[j]+abc[i])
	return r
}

//abc2=allLetters(2)
//console.log(abc2[0],abc2[abc2.length-1],abc2.length)

e.init=(B)=>{	
	b=B.toString('ascii')
	//unmerge
	x=/([a-z{]+)(\d*)/g
	w=0
	z={}
	//console.log("abc{def{".replace(/{$/,"'s").replace(/{/g,"'"))
	while(m=x.exec(b)){//.match(/(\w+)(\W+)/g)
		a=m[1];c=m[2];		
		if(w)a=w+a;
		//console.log(a)
		a=a.replace(/{$/,"'s").replace(/{/g,"'");
		z[a]=1
		//console.log(a,z[a])		
		if(c)
			w=a.substring(0,parseInt(c))
			//console.log('part=',w,0,c,parseInt(c))
		else
			break		
	}
	//out: z,b
	
	p=x.lastIndex//тут должен быть разделитель!!!!!!!!!!!!!!!!
	//продолжаем со следующего символа
	console.log('bufferPosition=',p,b.substring(p,p+1),b.charCodeAt(p))
	p++
	bi=1
	getBit=()=>{		
		if(bi==1){
			//v=b.charCodeAt(p)
			v=B[p]
			//console.log('v=',v)
			if(isNaN(v)){
				console.log(p)
				throw 'Error'
			}
			p++			
			//console.log(p)
		}
		bi++
		if(bi>8)
			bi=1
		r=v&1
		v=(v-r)/2
		//console.log(r,v)
		return r
	}
	
	subLen=2
	abc2=allLetters(subLen)
	bigCan=[]
	for(q=0;q<3;q++){
		can={}
		bigCan[q]=can
		for(j=0;j<abc2.length;j++){
			s1='',s2=''
			a={}
			can[abc2[j]]=a
			for(l=subLen;l<=24;l++)
				if(getBit()==1){
						a[l]={}
						s1+='1'
				}else s1+='0'		
			for (var l in a) {
				s2+=' l='+l+' '
				//console.log(key)
				if(l>subLen){
					for(t=0;t<=l-subLen;t++)
						if(getBit()==1){
							a[l][t]=1
							s2+='1'
						}else s2+='0'
				}
			}
			//console.log(abc2[j],s1,s2)
			//return
		}
		console.log('bufferPosition=',p)
	}
}

e.test=(w)=>{
	l=w.length;
	//console.log(w);
	//console.log(l);
	//return (l==1)||((';'+z+';').indexOf(l)>=0)
	//console.log(w,w.length,z[w]);
	if((l==1)||(/^.'?s$/.test(w))||z[w])
		return true
	if((l>24)||(/'/.test(w.replace(/'s$/,""))))
		return false
	
	var q=2
	if(/^.s$/.test(w))
		q=1
	if(/^.'s$/.test(w))
		q=0
	l=l-2+q
	can=bigCan[q]
	for(t=0;t<=l-subLen;t++){
		cc=w.substring(t,t+2)
		//console.log(cc);
		if(can[cc]){
			if(l==subLen)
				return true
			if((!can[cc][l])||(!can[cc][l][t]))
				return false
		}
	}
		
	return true
}
