var weight=[];

function loader(data)
{
	var str=data.toString('binary');
	if(str==='')
	{
		for(var i=0;i<616;++i) weight.push(0);
	}
	else weight=JSON.parse(str);
}

function main(word)
{
	if(iskl(word)) return true;
	if(!byLength(word) || !byFirstLastLetter(word) || !bySG(word) || !byMaxNum(word) || !byOrder(word)) 
		return false;
	return neiro(word);
}

function neiro(word)
{
	var matrix='abcdefghijklmnopqrstuvwxyz\'';
	var sum=0;
	var len=word.length;
	for(var i=0;i<len;++i)
	{
		var c=word.charAt(i);
		var m=matrix.indexOf(c);
		sum+=weight[28*i+m];
	}
	for(var i=len;i<22;++i) sum+=weight[28*i+27];
	return (sum>1000000);
}

module.exports={
	init:loader,
	test:main
};

function byLength(word)
{
	var len=word.length;
	return (len>0 && len<23);
}

function bySG(word)
{
	var m=getMaxSGL(word);
	return (m.g<=6 && m.s<=8);
}

function byFirstLastLetter(word)
{
	var len=word.length;
	return (word.charAt(0)!=='\'' && word.charAt(len-1)!=='\'');
}

function byMaxNum(word)
{
	var len=word.length;
	var maxNum={"a":6,"'":4,"s":8,"i":7,"b":4,"o":7,"d":5,"y":4,"t":5,"h":4,"n":6,"g":5,"l":6,"e":7,"r":6,"c":6,"p":4,"f":4,"u":9,"m":4,"q":2,"v":4,"k":4,"w":4,"x":3,"j":4,"z":4};
	var inWord={};
	for(var i=0;i<len;++i)
	{
		var c=word.charAt(i);
		if(!(c in inWord)) inWord[c]=1;
		else ++inWord[c];
	}
	for(var i in inWord)
	{
		if(inWord[i]>maxNum[i]) return false;
	}
	return true;
}

function byOrder(word)
{
	var len=word.length;
	var unOrder={"a":"","'":"jqxz'","s":"","i":"","b":"","o":"","d":"","t":"","h":"","n":"","e":"","r":"","g":"","c":"","l":"","p":"","u":"","y":"","m":"","q":"jxz","v":"q","k":"","w":"","f":"","x":"j","j":"qxz","z":"x"};
	for(var i=0;i<len-1;++i)
	{
		var c=word.charAt(i);
		var n=word.charAt(i+1);
		if(unOrder[c].indexOf(n)>=0) return false;
	}
	return true;
}

function getMaxSGL(word)
{
	var maxSl=0,maxGl=0;
	var gl='aeiouy';
	var g=0,s=0;
	var len=word.length;
	for(var i=0;i<len;++i)
	{
		var c=word.charAt(i);
		if(gl.indexOf(c)>=0)
		{
			if(s>0)
			{
				if(s>maxSl) maxSl=s;
				s=0;
			}
			++g;
		}
		else
		{
			if(g>0)
			{
				if(g>maxGl) maxGl=g;
				g=0;
			}
			++s;
		}
	}
	if(s>maxSl) maxSl=s;
	if(g>maxGl) maxGl=g;
	return {g:maxGl,s:maxSl};
}

function iskl(word)
{
	return /^(a(l(diborontiphoscophornia('s)|kylbenzenesulfonate's)|nt(i(disestablishmentarian(ism(s)?)|establishmentarian(s|ism(s)))|hropomorphologically))|c(o(nstitutionalisation's|unter(countermeasure's|interpretation's|productivenesses))|arboxymethylcellulose(s|'s)|hlorotrifluoroethylene|yclotrimethylenetrinitramine)|d(e(institutionalization(s|'s)|methylchlortetracycline|soxyribonucleoprotein)|i(s(establis(hmentarian('s|ism(s))|mentarianism)|proportionableness('s|es))|aminopropyltetramethylenediamine|chlorodi(fluoromethane(s|'s)|phenyltrichloroethane(s|'s))|hdroxycholecalciferol|phenylaminechlorarsine))|e(lectro(cardiographically|encephalograph(i(c(al(ly)?)|es)|'s|er(s|'s)|y's)|nystagmographies|photomicrography)|pididymodeferentectomy|stablishmentarianism's|thylenediaminetetraacetate(s|'s))|f(loccinaucinihilipilification(s)|ormaldehydesulphoxyl(ate|ic))|h(e(matospectrophotometer|xamethylenetetramine(s|'s))|y(dro(chlorofluorocarbon(s)|xyde(hydrocorticosterone|soxycorticosterone))|po(betalipoproteinemia('s)|gammaglobulinemia's))|ippopotomonstrosesquipedalian|onorificabilitudinit(atibus|ies))|i(n(distinguishableness('s|es)|ter(comprehensibilit(ies|y's)|substitutabilit(ies|y's)))|mmunoelectrophore(sis's|tically))|m(a(cracanthrorhynchiasis|gneto(hydrodynamically|thermoelectricity))|ethylenedioxymethamphetamine('s)|icro(electrophoretically|spectrophotomet(r(i(c(al(ly)?)|es)|y's)|er(s|'s))))|o(torhinolaryngologist's|ver(commercialization's|in(dividualistically|tellectualization(s|'s))))|p(a(ncreaticoduodenostomy|thologico(histological|psychological))|e(ntamethylenetetrazol's|ricardiomediastinitis)|h(enolsulphonephthalein|ilosophico(psychological|theological)|osph(atidylethanolamine(s|'s)|oglyceraldehyde's))|r(e(inferredpreinferring|obtrudingpreobtrusion)|orhipidoglossomorpha's)|s(eudo(hermaphroditism's|internationalistic|lamellibranchia(t(a('s)|e)|'s)|philanthropically)|ychoneuroimmunolog(i(cal|es|st(s|'s))|y's))|neumonoultramicroscopicsilicovolcanoconios(es|is)|olytetrafluoroethylene(s|'s))|s(c(hizosaccharomycetaceae|ientifico(geographical|philosophical))|uper(califragilisticexpialidocious|incomprehensibleness))|t(r(ansubstantiationalist(s)|initrophenylmethylnitramine)|etraiodophenolphthalein|hy(molsulphonephthalein|roparathyroidectomize))|blepharosphincterectomy|gastroenteroanastomosis|llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch('s)|nonrepresentationalism(s|'s)|re(generatoryregeneratress|institutionalization(s|'s))|undistinguishablenesses)$/.test(word);
}