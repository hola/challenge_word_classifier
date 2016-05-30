'use strict'


var hashArr = [];
var letterLen = { a: 29,  b: 23,  c: 29,  d: 34,  e: 29,  f: 30,  g: 23,  h: 30,  i: 25,  j: 18,  k: 22,  l: 22,  m: 31,  n: 24,  o: 25,  p: 45,  q: 20,  r: 25,  s: 34,  t: 29,  u: 23,  v: 20,  w: 19,  x: 21,  y: 15,  z: 22 };
	

function init(buffer) {
	// Get a buffer with file data.
	console.log(buffer);
	hashArr = buffer.toString('utf-8').split('\n');
	
	console.log(hashArr.length);
};

function test(word) {
    // Check the word.
    
    // console.log(word);
    
    // var hashArr = [];
    var cleanedWord = word.toLowerCase();
    
	if (cleanedWord.length > letterLen[cleanedWord.slice(0, 1)]) {
		return false;
	}
	
    cleanedWord = removeAff(cleanedWord);
    if (cleanedWord.length < 3) {
    	return false;
    }
    
	cleanedWord = removeAff(cleanedWord);
	cleanedWord = removeAff(cleanedWord);
	cleanedWord = removeAff(cleanedWord);

	if (cleanedWord.length >= 4) {
		cleanedWord = removeWord(cleanedWord);
	}
	
	if (cleanedWord.length >= 4) {
		cleanedWord = removeWord(cleanedWord);
	}
	
	if (cleanedWord.length >= 3) {
		cleanedWord = removeWord2(cleanedWord);
	}
	
	if (cleanedWord.length >= 3) {
		cleanedWord = removeWord2(cleanedWord);
	}
	
	if (cleanedWord.length > 5) {
		cleanedWord = cleanedWord.slice(-4);
	}
	
		
	if (cleanedWord.length == 0) {
		// console.log(true, '1');
		return true;
	}

    if (hashArr.indexOf(cleanedWord) > -1) {
    	// console.log('in file');
        return true;
    } else {
        return false;
    }

}


module.exports = {
    test: test,
    init: init
};


// remove affixies.
function removeAff(word) {
	// 's.
	word = word.replace( /'s$/i, "" );
	
	// Check multiple.
	if (word.slice(-1) == 's') {
		word = word.slice(0, -1);
	}
	
	// -ed/ing/ly/y.
	word = word.replace( /i?es$|ed$|er$|ing$|ibles$|ibly$|l?y$|ib$/i, "" );
	
	// if (word.length < 3) {
	// 	return word;
	// }

	word = word.replace( /pollution$|lateral$|lecithal$|potence$|convert$|channel$|charnel$|nophill?$|[cs]ation$|ibilit$|phobia$|[ai]bilit$|ically$|sporid$|bacter$|method$|genous$|polith?$|people$|person$|ation$|ssion$|course$|scotch$|sville$|worthi?$|trope$|meter$|ative$|ambul$|chemi$|tween$|aceae$|sperm$|bour[n/g]$|chance$|chant$|charm$|phone$|polis$|pound$|mesis$|graph$|phill?$|music$|proof$|tend$|plan$|beu?rg$|merge$|ology$|thumb$|digit$|sion$|ment$|[ln]ess$|post$|ship$|[ai]ble$|ibly$|ists$|hood$|tomy$|borg$|ised$|trop$|loma$|phor$|form$|ator$|tail$|skin$|maid$|anal$|wood$|lock$|like$|lost$|time$|wake$|walk$|mong$|weed$|sold$|sorb$|ence$|some$|nock$|pool$|cell$|dyne$|land$|hend$|saur$|mest$|coma$|stan$|bind$|emma$|[rt]ess$|lose$|solv$|wear$|wise$|bird$|book$|mark$|ants$|back$|fish$|sack$|hole$|flam$|ie[rs]$|is[mt]$|ian$|age$|dom$|ion$|ure$|[ae]nt$|ful$|ish$|ive$|ous$|eng$|ank$|c[ai]t$|e[cs]t$|i[stz]e$|iar$|mat$|ini$|ate$|ory$|gen$|man$|out$|[bc]yt$|[ao]me$|bid$|cim$|mot$|mut$|pro$|net$|axe$|ori$|act$|din$|rus$|io$|ak$|om$do$|ee$|en$|fy$|i[dmx]$|um$|i[cn]$|al$|az$|or$|a$|o$|l$|e$|k$|s$/i, "" );

	// preaffix.
	// /^pre|post/i
	word = word.replace( /^anthraco|^anthropo?|^counter|^acantho|^america|^apalach|^apostol|^archaeo|^astylos|^babylon|^bacilla|^apache|^aphoro|^archn[eio]|^actin[io]|^argent|^arnold|^arthro|^atlant|^austro|^bacter|^balkan|^barnes?|^basili|^beaver|^under|^inter|^ultra|^afrio?|^agape|^ahmad|^allen?|^allis|^alban|^alber|^aleks|^amphi|^andro|^angl[io]|^antho|^aporo|^apter|^arch[ei]|^aster|^astr[ao]|^babel|^bactr|^baham|^baker?|^barb[aei]|^barde?|^barn[ae]|^batra|^anti|^over|^post|^past|^aber|^abra|^acro|^ada[ei]|^aegi|^aero|^agae|^agr[io]|^alta?|^alma|^allo|^alb[io]|^alc[aio]|^alex|^amm[aio]|^anch?|^and[io]|^ang[aeilo]|^ann[aei]|^anom|^anth|^aph[aeio]|^apl[ao]|^apol|^aqu[ai]|^ara[blm]|^arch|^arg[ioy]|^arm[aeio]|^arri|^art[aeio]|^adtr|^asty|^ath[ae]|^atr[aeio]|^att[ai]|^auck|^auri|^auto|^avan|^aver|^baal|^baby|^bac[kt]|^bai[ln]|^bakh|^bal[ail]|^ban[ek]|^bar[abdnt]|^bat[eo]|^beau|^beck|^bel[lo]|^bene?|^berg?|^dis|^non|^mis|^pre|^sub|^ab[io]|^abs|^aca|^aca|^act|^ada|^aga|^agg|^agr|^agu|^ahi|^ai[lr]|^ak[ai]|^al[abcedfgio]|^am[abeioy]|^an[acdginot]|^ap[aeilop]|^ar[acegikmot]|^as[iosty]|^at[aer]|^au[dfs]|^av[io]|^ayu?|^az[aeo]|^ba[bdgklnprstuxy]|^bac|^be[cdehlmnor]|^un|^in|^de|^re|^co|^ex|^en|^ae|^ax|^ab|^a/i, "" );

	if (word.slice(0, 2) == 'il' && word.slice(2, 1) == 'l') {
		word = word.slice(2);
	}
	
	if (word.slice(0, 2) == 'ir' && word.slice(2, 1) == 'r') {
		word = word.slice(2);
	}
	
	if (word.slice(0, 2) == 'im' && (word.slice(2, 1) == 'm' || word.slice(2, 1) == 'p')) {
		word = word.slice(2);
	}

	return word;
}

function removeWord(word) {
		word = word.replace( /ophthalm|electro|branchi|ogenesi|phthalm|pharyng|pseudo|tionar|thermo|therap|super|sthesi|quadri|psycho|phosph|oplast|omorph|oblast|icular|hetero|haryng|genesi|electr|circum|chondr|cephal|branch|hyper|blast|board|brach|carbo|cardi|centr|cepha|chlor|chond|chro[mn]|circu|craft|crypt|cula[rt]|dynam|ectom|elect|ethyl|field|gastr|gloss|gnath|heart|heter|hydro|ialit|idean|illar|iolog|ionar|lectr|light|lymph|m[ai]cro|morph/i, "");
		word = word.replace( /mouth|multi|nalit|nceph|nephr|neuro|ngton|nolog|nucle|ocarp|ocyst|oderm|odont|ogram|olith|olysi|omanc|omani|ometr|opath|ophag|ophob|ophyt|organ|ortho|oscop|ostat|ostom|palae|penta|peric|phil[io]|photo|physi|plasm|plast|pleur|proto|pseud|psych|quadr|rachi|radio|ranch|right|rolog|romet|rough|sburg|scler|semi[cp]|smith|ster[eno]|stown|sulph|supra|teroc|tetra|ther[im]|thesi|tolog|tomet|trach|trans|trich|troph|ulari|olog|bili|boa[rt]|bra[cn]|bro[mn]|bur[gn]|bush|cal[ci]|camp|cand|car[bdip]/i, "");
		word = word.replace( /cast|cen[ct]|cep[ht]|cha[lnr]|che[mrt]|chi[lnrt]|chlo|cho[lnpr]|chro|cipi|circ|cket|clas|cler|cra[cnt]|cro[cmps]|ctom|cul[it]|cyan|cycl|cyst|cyto|diac|dont|down|dro[cmnps]|duct|each|east|eath|econ|ectr|eigh|elan|elec|ell[iu]|embr|emon|epat|epit|equi|era[cnt]|ere[bt]|erit|ermi|ero[mnpt]|erst|erti|ervi|esqu|esth|est[ir]|ethy|eton|etti|ewar|ferr|fibr|flow|foot|for[demt]|fron|fter|gast|geni|glo[bs]|gnat|goni|gra[mn]|grav|gton|haem|hagi|hair|hali|halm|han[dg]|har[dimt]|hea[drt]|hedr|heli|hem[io]|her[im]|hexa|hili|hipp|hist|hold|holo/i, "");
		word = word.replace( /homo|hond|horn|hosp|hron|hydr|hypo|icar|icon|idan|idi[ot]|ield|ight|ilit|illi|imet|impe|ioph|iosi|ipar|isch|ison|ist[ir]|ita[nr]|itch|iton|iver|ivit|lac[hkt]|lan[cdg]|lari|last|lat[ir]|lean|leni|lep[ht]|lett|leu[cr]|lich|lind|lit[hi]|lla[nrt]|llet|llit|llow|loch|logi|long|loph|losi|loth|lton|lysi|mac[hr]|magn|mali|man[cdint]|mari|mast|mati|medi|mega|meli|men[it]|mer[io]|meso|met[ahr]|micr|mill|mith|mon[iot]|morp|most|moth|mpan|mult|myel|nali|nari|nath|neph|nesi|nett|neur|niac|nit[hir]|noch|noph|nos[it]|nson|ntar|nthu|nton|nucl|ocar|och[ir]|ocon|octo|o[dg]on|oint|ola[rt]/i, '' );
		word = word.replace( /olet|oli[gt]|olli|omet|omni|onat|onch|oneu|onit|ono[cmt]|onti|opat|oper|opod|opsi|ora[cn]|orch|oret|orni|orph|orrh|orth|osau|osit|osom|osph|ost[er]|othe|oto[mnx]|otyp|ouch|ough|ound|out[hs]|pala|pant|par[ait]|path|pect|pen[nt]|per[cdfimpst]|pha[glnr]|phen|phil|pho[bnst]|phra|phy[lst]|pist|pith|pla[cnt]|pneu|po[dl]i|poly|pond|port|posi|pro[cpst]|pseu|pter|pyro|quad|quet|quin|rach|radi|raft|rali|ramm|ran[cdgi]|raph|rast|rati|rbon|rchi|rgan|ric[hu]|rid[gi]|riti|rmat|road|roch|romi|ron[cit]|roo[mt]|roph|ros[ceit]|roth|rou[gn]|rson|rthr|rtic|rton|rush|ryst|ryth|sand/i, '' );
		word = word.replace( /sarc|sbur|sca[lp]|scen|schi|scop|scri|semi|sept|sett|shir|sili|smit|soph|spar|spe[cr]|spi[nr]|sple|spo[nr]|squi|sta[rt]|ste[mnr]|sti[ct]|sto[cmnpw]|str[iou]|sul[fp]|supr|sych|tach|tali|tan[cd]|taph|ta[rs]i|tech|tele|temp|ter[beimnor]|tetr|tha[lnr]|the[crt]|thon|thri|thy[lr]|ticu|ti[lt]i|titu|toch|to[mn]i|toph|tos[it]|town|tra[cdimnpt]|tri[acpt]|tro[cmnt]|tton|ula[rt]|ulph|ulti|uran|uret|urop|usti|vari|ve[nr]t|ward|whit|wind|wor[mt]|yard|yso/i, '' );

	return word;
}

function removeWord2 (word) {
	word = word.replace( /i?ferou|aceou|berri|genou|iousn|lessn|aean|alit|alli|ant[hi]|arch|assi|atou|atur|augh|ber[rt]|caln|cata|ceou|ciou|citi|elet|emat|ench|enci|enou|en[st]i|erou|essn|fero|fuln|geno|here|inat|ingn|inou|irre|ishn|lace|ling|mala|mato|mini|nder|neou|ogen|olou|omyc|orou|ousn|read|ring|riou|rous|siti|squa|stea|tati|tedn|thro|tiou|ulou|ab[iru]|ac[achirtu]|ad[dei]|ae[mt]|aff|ag[eiru]|ai[rt]|aki|al[cdgilmnptuv]|am[beimpu]|an[acdeginou]|ap[hiopstu]|aqu|ar[abcdgimnprtuv]|as[chimstu]|at[hiortu]|au[dgrt]|avi|awn|axi|ba[clnrt]|bbi|be[agnrst]|bi[norst]|bl[aeiou]|bo[dlnortuwx]|br[aeiou]|bu[clnrt]|ca[bcdlmnprstu]|cc[io]|ce[lrst]|ch[aeiortuy]|ci[dlnot]|ck[is]|cl[aeiou]|co[clmnprtu]|cr[aeiou]|ct[iu]|cu[lmnrt]|da[clmnrt]|ddi|de[cmnrs]|di[acfgnoptv]|dle|do[cglmnorsu]|dr[aei]|du[clnr]|dys|ea[bcdfmnrtu]|eb[aoru]|ec[hiotu]|ed[aeginru]|ee[lpt]|eff|eg[agior]|ei[rt]|el[adeilmotu]|em[abeiop]|en[cdeinotuz]|eo[npu]|ep[ahiot]|equ|er[abcdegimnoprstuvw]|es[chiopst]|et[hiortu]|eu[rt]|ev[aei]|ex[it]|fa[cnr]|fer|ffi|fi[clnrs]|fl[aeiou]|fo[lr]|fr[aeiu]|fur|ga[lmnrt]|ge[lnort]|ggi|gi[nt]|gl[aeiou]|gn[io]|go[nortu]|gr[aeio]|gu[ain]|gyn|ha[bcdegilmnprtuw]|he[acdilmnoprs]|hi[cnoprz]|ho[cdlmnprtuw]|hr[aei]|hth|hu[mnr]|hy[mnp]|ia[cdmnrst]|ib[iu]|ic[ehiotu]|id[deiou]|iet|if[fit]|ig[ghinoru]|iki|il[adeilot]|im[abimpu]|in[acdeginostu]|io[cdnptu]|ip[hiop]|iqu|ir[eiortu]|is[aciot]|it[hiortu]|ivi|jac|ka[lnrt]|ke[lnrt]|kin|kle|la[bcdghimnprstuvwy]|le[bcdegimnoprstuvwx]|lgi|li[acdefgmnoptvz]|ll[aeiou]|lmi|lo[bcdgimnoprstuvw]|lp[hi]|lti|lu[cmnrst]|lv[ei]|ly[cnt]|ma[cdgilmnrst]|mb[iru]|me[alnrst]|mi[cdlnrt]|mm[aeiou]|mo[cdlnorstu]|mp[aehilortu]|mu[clnrs]|my[co]|na[bcdgilmnprstu]|nc[hitu]|nd[iru]|ne[abcilmortw]|ng[ehinu]|ni[cfgnotz]|nki|nn[ei]|no[bcdgimnprstuvw]|ns[eit]|nt[ehinr]|nu[rt]|nvi|oa[cnrt]|ob[abi]|oc[acehiortu]|od[deiouy]|oe[cnt]|off|og[egilu]|oi[dt]|ol[deiotuy]|om[abeimopy]|on[cdeginosty]|oo[dmnptu]|op[hioptu]|oqu|or[abcdeghimnorstu]|os[acehipst]|ot[aehiortu]|ou[lnrt]|ov[ai]|own|ox[iy]|pa[cdilnprst]|pe[adlnrt]|ph[aeilory]|pi[ceglnpst]|pl[aeiou]|po[dilmnprtu]|ppi|pr[aeio]|psi|pti|pu[lnrt]|pyr|qu[aei]|ra[bcdghilmnprttuvw]|rbi|rc[hiu]|rdi|re[acgimopstv]|rgi|rh[aioy]|ri[bcdefgmnoptuvz]|rli|rni|ro[bcdefgilmnprstuvw]|rr[ehi]|rs[ehit]|rt[hi]|ru[bcdnst]|rvi|sa[bcdlmnrtu]|sc[ahioru]|se[aclmnprtx]|sh[aeinoru]|si[acdfglmnot]|sk[ei]|sli|smo|sna|so[clmnrtu]|sp[aehior]|squ|ss[inu]|st[aeioru]|su[cnr]|sw[ae]|sy[lmn]|ta[bcdgilmnprstu]|tch|te[adlnprst]|th[eioruy]|ti[cfgmnptv]|tle|to[cilmnoprtu]|tr[aeiou]|tti|tu[bdmnr]|ty[lp]|ua[nrt]|ub[bi]|uc[chi]|ud[di]|uff|ug[gh]|ui[lt]|ul[adilnotu]|um[abimp]|un[cdgint]|uou|upp|ur[abdeginorstu]|us[cehint]|ut[aehiortu]|va[glnrst]|ve[lnrst]|vi[clnrst]|vo[lr]|wa[lnrst]|we[lr]|wh[ei]|wi[nt]|wo[mor]|yan|yc[ho]|ygo|yl[io]|yon|yph|yri|yst|yth|za[nr]|zo[no]/i, '' );
	
	return word;
}