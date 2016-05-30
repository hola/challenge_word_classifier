meiyan=function(k){
	var x=0,c=k.length,h=0x811c9dc5
	while(c>=8){
		var x1=k.charCodeAt(x)|(k.charCodeAt(x+1)<<8)|(k.charCodeAt(x+2)<<16)|(k.charCodeAt(x+3)<<24)
		var z=x+4
		var y=k.charCodeAt(z)|(k.charCodeAt(z+1)<<8)|(k.charCodeAt(z+2)<<16)|(k.charCodeAt(z+3)<<24)
		h=(h^(((x1<<5)|(x1>>>27))^y))*0xad3e7
		c-=8,x+=8
	}
	if(c&4)h=(h^(k.charCodeAt(x)|(k.charCodeAt(x+1)<<8)))*0xad3e7,x+=2,
		h=(h^(k.charCodeAt(x)|(k.charCodeAt(x+1)<<8)))*0xad3e7,x+=2
	if(c&2)h=(h^(k.charCodeAt(x)|(k.charCodeAt(x+1)<<8)))*0xad3e7,x+=2
	if(c&1)h=(h^k.charCodeAt(x))*0xad3e7
	h^=(h>>>16)
	return h>>>0
}
