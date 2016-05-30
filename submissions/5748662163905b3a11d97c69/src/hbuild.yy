≣'lib/meiyan'
≣'lib/aricode'
≣'lib/garbage_filter'
≣'lib/vowels'

➮ mk_tab size {
	size = pow2(size)
	tab ∆ []
	⧖ tab↥ < size { tab ⬊ 0 }
	$ tab
}

➮do_magic {
	var i,A="',s,r,ng,ly,un,at,ni,an,al,ut,ha,al,am,ea,ve,co,il,pi,og,po,ep,iv".split(','),
	B=",,k,w,,,mg,nk,dn,ol,qv,1z,js,bz,'o,zd,cj,jt,bp,us,j1,nx,h1".split(',')
	i ► A a=a.replace(⟡RegExp(i,'g'),B[i_])
	$ a
}

➮ hash_func {
	❰a↥ == 4❱ $
	❰a↥ > 15❱ $
	❰max_cons(a) > 4❱ $
	❰has_garbage(a)❱ $
	a = do_magic(a)
	$ meiyan(a)
}

➮ build_dic tab {
	tabl ∆ tab↥
	i ► O {
		x ∆ hash_func(i)
		❰x ≟ ∅❱ ♻
		tab[x % tabl] = 1
	}
}

➮ show_dic_stat tab {
	zero ∆ zero_count(tab)
	ロ '' ((tab↥-zero)/tab↥*100) .toFixed(2) '% of ' tab↥ ' slots occupied'
}

➮ build {
	O = ⛁ 'data/dic.lower' ≂
	O = O ⌶ '\n'
	tab ∆ mk_tab(5e5-1e4)
	build_dic(tab)
	show_dic_stat(tab)
	$ tab
}

➮ del_magic {
	i ► b {
		x ∆ a ≀ i
		a = a ⩪ (0, x) + a ⩪ (x+1)
	}
	$ a
}

➮ unzip_garbage zip {
	garbage = {}
	allc ∆ del_magic("abcdefghijklmnopqrstuvwxyz'", 'aeiou')
	z ∆ 0
	➮ record {
		a = repl(a, '_', '')
		❰zipᶻ == '1'❱ garbageᵃ = 1
		z++
	}
	l ∆ allc↥
	⧗ (a ∆ 0; a < l; a++) 
	⧗ (b ∆ 0; b < l; b++) 
		record('_'+allcᵃ + allcᵇ)
	⧗ (a ∆ 0; a < l; a++)
	⧗ (b ∆ 0; b < l; b++) 
	⧗ (c ∆ 0; c < l; c++) 
		record(allcᵃ + allcᵇ + allcᶜ)
}

➮ load_garbage {
	a ∆ ari_file_decode('tab/ga.aeiou8',⦿)
	unzip_garbage(a)
}

➮ pack_htable() {
	⛃('tab/htab.10', tab ⫴ '')
	zipsize ∆ ari_file_encode('tab/htab.10', ⦿)
	ロロ 'ratio: '+zipsize
}

load_garbage()

T ∆ ⚡
tab ∆ build()
ロ 'build time ' (⚡-T) ' ms'

pack_htable()
