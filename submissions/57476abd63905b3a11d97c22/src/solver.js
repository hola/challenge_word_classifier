var o={};
var abc='abcdefghijklmnopqrstuvwxyz\' ';
var lkl={l3:1,l6:4,l9:7,l12:10,l15:13,l18:16,l21:19,l24:22,l27:25,l60:58,l30:28,l36:34,l33:31,l45:43};
var hash_buckets=2;
String.prototype.padRightMod = function(m,c) {
	//console.log(this,m,c,((m - (this.length % m)) % m));
	return this+Array(((m - (this.length % m)) % m) + 1).join(c||" ")
}

function bitReader(b) {
	console.log("initializing bit reader");
	console.log(b);
	this.buf = b;
	this.iBit=0;
	this.iByte=0;
	this.ui8=this.buf.readUInt8(this.iByte);
	this.read=function(){
		var mask=1<<this.iBit;
		var v=(((this.ui8 & mask)==0)?0:1);
		this.next();
		return v;
	}
	this.next=function(){
		this.iBit++;
		if (this.iBit==8) {
			this.iBit=0;
			this.iByte++;
			if (this.iByte<this.buf.length) {
				this.ui8=this.buf.readUInt8(this.iByte);	
			}
			else {
				console.log("SKIPREAD iByte=",this.iByte," this.buf.length=" ,this.buf.length);
				//this.ui8=this.buf.readUInt8(this.iByte);	
			}
		}
	}	
}

exports.init=function(b){
	console.log("initializing solver");
	var br=new bitReader(b);
	var ch1i,ch1,ch2i,ch2,ch3i,ch3;
 	for (var lki=3;lki<=60;lki+=3) { 
 		lk = 'l' + lki;
	    if (lkl.hasOwnProperty(lk)) { 
	    	if (br.read()==1) {
		    	o[lk]={};/*
		    	for (var h=0;h<hash_buckets;h++) {	
		    		if (br.read()==1) {
		    			gk= 'h' + h;
		    			o[lk][gk]={};*/
				    	for (var ch1i=0;ch1i<abc.length;ch1i++) {
				    		if (br.read()==1) {
								ch1=abc[ch1i];
								o[lk]/*[gk]*/[ch1]={};
						    	for (var ch2i=0;ch2i<abc.length;ch2i++) {
						    		if (br.read()==1) {
										ch2=abc[ch2i];
										o[lk]/*[gk]*/[ch1][ch2]={};
								    	for (var ch3i=0;ch3i<abc.length;ch3i++) {
								    		if (br.read()==1) {
												ch3=abc[ch3i];
												o[lk]/*[gk]*/[ch1][ch2][ch3]={};
												//console.log(lk,gk,ch1,ch2,ch3);
												for (var ii=0;ii<lkl[lk];ii++) {
													//console.log(lk,gk,ch1,ch2,ch3,ii,lkl[lk]);
									 				if (br.read()==1) {
									 					o[lk]/*[gk]*/[ch1][ch2][ch3][ii]=1;
									 				}
									 			}
								    		}
								    	}
						    		}
						    	}
				    		}
				    	}
				    //}
				//}
			}
	    }
	}
}

function hash(word,abc,hash_groups) {
	var hash=0;
	var chi;
	for (var i=0;i<word.length;i++) {
		chi=abc.indexOf(word[i]);
		hash ^= chi;
	}
	return hash % hash_groups;
}

var long_words={
"llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch's":1,
"llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch":1,
"pneumonoultramicroscopicsilicovolcanoconioses":1,
"pneumonoultramicroscopicsilicovolcanoconiosis":1,
"diaminopropyltetramethylenediamine":1,
"supercalifragilisticexpialidocious":1,
"dichlorodiphenyltrichloroethane's":1,
"dichlorodiphenyltrichloroethanes":1,
"dichlorodiphenyltrichloroethane":1,
"methylenedioxymethamphetamine's":1,
"floccinaucinihilipilifications":1,
"hippopotomonstrosesquipedalian":1,
"antidisestablishmentarianisms":1,
"cyclotrimethylenetrinitramine":1,
"ethylenediaminetetraacetate's":1,
"floccinaucinihilipilification":1,
"methylenedioxymethamphetamine":1,
"trinitrophenylmethylnitramine":1,
"antidisestablishmentarianism":1,
"ethylenediaminetetraacetates":1,
"hydroxydehydrocorticosterone":1,
"electroencephalographically":1,
"ethylenediaminetetraacetate":1,
"honorificabilitudinitatibus":1,
"hydroxydesoxycorticosterone":1,
"microspectrophotometrically":1,
"aldiborontiphoscophornia's":1,
"antiestablishmentarianisms":1,
"phosphatidylethanolamine's":1,
"pseudolamellibranchiata's":1,
"antidisestablishmentarian":1,
"antiestablishmentarianism":1,
"demethylchlortetracycline":1,
"dichlorodifluoromethane's":1,
"disestablishmentarianisms":1,
"electroencephalographer's":1,
"electroencephalographical":1,
"hypobetalipoproteinemia's":1,
"immunoelectrophoretically":1,
"microspectrophotometrical":1,
"overintellectualization's":1,
"philosophicopsychological":1,
"phosphatidylethanolamines":1,
"polytetrafluoroethylene's":1,
"psychoneuroimmunologist's":1,
"regeneratoryregeneratress":1,
"superincomprehensibleness":1
}

exports.test=function(w){
	var lcw=w.toLowerCase();
	if (w.length>=25) return long_words.hasOwnProperty(lcw);
	if (w.length==1) return w!='\'';
	if (w.length==2) return w.indexOf("'")<0 && 'bj,bq,cx,ej,ek,fh,fj,fk,fq,gf,gj,gx,gz,hx,ih,jb,jf,jh,jk,jm,jn,jq,jw,jx,jz,kf,kh,kk,kq,kx,kz,lk,lq,mq,mz,nk,nn,nx,oq,pj,pz,qg,qj,qk,qo,qw,qx,qz,rk,rz,sz,tf,tj,tq,tz,ue,uf,uj,uo,uq,uy,uz,vh,vk,vq,vy,vz,wj,wn,wq,wx,wz,xf,xg,xh,xj,xk,xm,xy,xz,yc,yg,yh,yj,yk,yl,yq,yw,yx,yz,zc,ze,zf,zh,zj,zm,zp,zq,zv,zw,zx,zy,'.indexOf(lcw+"'")<0;

	//todo handle special case of length 1 and 2
	var nw=lcw.padRightMod(3);
	var lk='l'+nw.length;
	//var gk='h'+hash(nw,abc,hash_buckets);
	for(var si=0;si<nw.length-3;si++) {
		var ss=nw.substr(si,3);
		try {
			if (o[lk]/*[gk]*/[ss[0]][ss[1]][ss[2]][si]==1) {}
		}
		catch (e) {
			return false;
		}
	}
	return true;
}