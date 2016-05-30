terms={}, shorts=[], shorts3=[], css='AZaz0123456789\'';
exports.init=function(data) {
  var offset=0;
  function readB() {return data[offset++];}
  function readW() {
	var x=(data[offset+1]<<8)|data[offset];
	offset+=2;
	return x;
  }
  function read3() {
	var x=(data[offset+2]<<16)|(data[offset+1]<<8)|data[offset];
	offset+=3;
	return x;
  }
  String.prototype.javaReplace = function(a,b) {
	  return this.split(a).join(b);
  }
  String.prototype.endsWith = function(suffix) {
	  return this.indexOf(suffix, this.length - suffix.length) !== -1;
  };
  String.prototype.startsWith = function(prefix) {
	  return this.indexOf(prefix) == 0;
  };
  var grpsCount=readW();
  var longGrpsCount=readB();
  for (var i=0;i<longGrpsCount;i++) {
	 var grpId=read3(),grpSize=readW(); 
	 for (var j=0;j<grpSize;j++) terms[readW()]=grpId;
  } 
  grpsCount-=longGrpsCount;
  var prevGrpId=0;
  for (var i=0; i<grpsCount; i++) {
	 var diff=readW();
	 if (diff==0) diff=read3();
	 var grpId=diff+prevGrpId, grpSize=readB(); 
//	 console.log(grpId+' '+grpSize);
	 prevGrpId=grpId;
	 for (var j=0;j<grpSize;j++) terms[readW()]=grpId;
  }
  var s1Count=readB();
//  console.log(s1Count);
  for (var i=0; i<s1Count; i++) shorts.push(readB());
  var s2Count=readW();
  for (var i=0; i<s2Count; i++) shorts.push(readW());
  var s3Count=readW();
  for (var i=0; i<s3Count; i++) shorts3.push(readW());
//  console.log(shorts3.length);
  var _css={};
  for (var i=0;i<css.length;i++) _css[css.charAt(i)]=css.charCodeAt(i);
  css=_css;
};
const _0=["'s","ed", "ing", "tion", "ll"], _1=["ll","ch", "ea", "ph", "th"];
function improve(s) {
	var l0=_0.length, l1=_1.length, ls=s.toLowerCase();
	for (var i=0; i<l0; i++) {
		var k=_0[i];
		if (ls.endsWith(k)) {
			var c=String.fromCharCode(css['0']+i);
			s=s.substring(0,s.length-k.length)+c;
			break;
		} 
	}
	for (var i=0; i<l1; i++) {
		var m=_1[i], n=m.toUpperCase(), r=String.fromCharCode(css[5]+i);
		s=s.javaReplace(m,r).javaReplace(n,r);  
	}
	if (s.startsWith("ea")) s='\''+s.substring(2);
	if (s.endsWith("ly")) s=s.substring(0,s.length-2)+'\'';
	return s;
}
function packIt(c, c2, c3) {
	if (c3!=undefined) {
		var ch1, ch2, ch3;
		if ((ch1=packIt(c))==null||(ch2=packIt(c2))==null||(ch3=packIt(c3))==null) return null;
		return ((ch1<<10)|(ch2<<5)|ch3);	
	} else 
	if (c2!=undefined) {
		var ch1, ch2;
		if ((ch1=packIt(c))==null||(ch2=packIt(c2))==null) return null;
		return ((ch1<<5)|ch2);	
	}
	if (c>=css['a']&&c<=css['z'])   c-=css['a']; /*0..25*/ else
	if (c>=css['A']&&c<=css['Z'])   c-=css['A'];  else
	switch (c) {
	case css['\'']:c=26;  break;
	case css['0']:/* 's */   c=27; break;
	case css['1']:/* ed */   c=28; break;
	case css['2']:/* ing  */ c=29; break;
	case css['3']:/* tion */ c=30; break;
	case css['4']:/* ly */   c=31; break;
	case css['5']:/* ll */   c=27; break;
	case css['6']:/* ch */   c=28; break;
	case css['7']:/* ea  */  c=29; break;
	case css['8']:/* ph */   c=30; break;
	case css['9']:/* th */   c=31;   			
	break;
	default: return null;
	}
    return c;	   
}
function getKeys(is) {
	var isl;
	if (is!=null&&(isl=is.length)>3&&(isl<=14)) {
		var res=[], nk=0;
		for (var i=0;i<isl;i++) {
			var c1=is.charCodeAt(i); 
			for (var j=i+1; j<isl; j++, nk++) {
				if (nk>23) return res;
				var c2=is.charCodeAt(j);
				var k=(j<isl-1)?(j+1):0;
				var p=packIt(c1,c2,is.charCodeAt(k));
				res.push((nk==0)?p:(p&0x3fff));
			}
		}
		return res;

	}
	return null; 
}
exports.test=function(s) {
	  if (s.endsWith("\'")||s.startsWith("\'")) return false;
	  var is=improve(s), isl;
	  if (is!=null&&(isl=is.length)>0) {
		  if (isl<=2) return shorts.indexOf(is)>=0;
		  if (isl==3) {
			 return shorts3.indexOf(packIt(is.charCodeAt(0),is.charCodeAt(1),is.charCodeAt(2)))>=0;
		  }
		  var keys=getKeys(is);
	      if (keys==undefined) return false;
		  for (var i=0;i<keys.length;i++) {
			var t=terms[keys[i]];
		//	console.log(i+': '+keys[i]+' '+t+' '+((t&(1<<i))!=0));		
			if ((t==undefined)||((t&(1<<i))==0)) return false;
		  }
	      return true;
	  }
	  return false;
}