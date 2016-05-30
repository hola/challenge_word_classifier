let l=w.length,
	h=(w,t)=>{
		let i=1+e.indexOf(w),n,u,r;
		if (i) return [i];
		t--;
		for (i=w.length-1;i;i--) {
			n=1+e.indexOf(w.slice(0,i));
			if (n&&t) {
				if (u=h(w.slice(i),t)) {
					t=u.length-1;
					r=[n].concat(u);
				}
			}
		}
		return r;
	},
	W=w.endsWith("'s")?w.slice(0,-2):w,
	t=h(W,4),
	c=(i,u,r,n,e)=>((t[0]-1)*i+(1 in t?t[1]*u:0)+(2 in t?t[2]*r:0)+(3 in t?t[3]*n:0))%e,
	i=(c,u)=>g[u+(c>>3)]&(1<<(c&7));

w>"'"&&l<28&&(l<3||
(1+f.indexOf(w))||
(t&&
i(c(24393,5788,33547,45032,438370),0)&&
(w!=W?i(c(2720,1163,175,2442,47924),54797):i(c(2410,1400,3026,4023,46628),60788))
))