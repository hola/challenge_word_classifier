var wovels  =  {'a':1,'e':1,'o':1,'u':1,'i':1,'y':1,"'":1}

max_cons=function max_cons (a,b,c) {
	;var c  =  0  ;var m  =  0
	 for(var i_=0; i_<a.length; i_++) {
		if (wovels[a[i_]]) {
			if (c > m) { m = c }  
			c = 0
		} else {
			c++
			}
	}
	if (c > m) { m = c }  
	return  m
}

