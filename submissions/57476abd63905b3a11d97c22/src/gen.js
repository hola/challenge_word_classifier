const zlib = require('zlib');
const fs = require('fs');
const bitSinks = require('./bitSinks.js');

var words=require('./words.js').all;
//var sample_words={'abc':1,'a':1,'abx':1,'bcdx':1};
//var sample_words={'a':1,'ab':1,'abc':1};
//var words=sample_words;

var abc='abcdefghijklmnopqrstuvwxyz\' '; //28 chars when using space as a padding char 5 bits can encode 32 different values so 16 bits can encode 3 chars as 0b0111112222233333
// where 11111 22222 33333 are the bits of the 3 chars

function writeCharTrioToBufAs2Bytes(buf,offset,c1,c2,c3) {
	//if (offset > buf.length-10) 
	// console.log(offset+ ' ' + buf.length + ' ');
	// console.log('c1=' + c1 + ' abc.indexOf(c1)= ' + abc.indexOf(c1));
	// console.log('c2=' + c2 + ' abc.indexOf(c2)= ' + abc.indexOf(c2));
	// console.log('c3=' + c3 + ' abc.indexOf(c3)= ' + abc.indexOf(c3));

	buf.writeUInt16BE(((abc.indexOf(c1)<<10) | (abc.indexOf(c2) << 5)) | abc.indexOf(c3), offset);
}

/* a word in the list can be encoded as its length (as a multiple of 3) followed by its chars as Uint16 setes representing 3 chars each; */

function pad3(word) {
	word=word.toLowerCase();
 	var m=word.length % 3;

 	if (m==0) {return word;}
 	if (m==1) {return word+'  ';}
 	if (m==2) {return word+' ';}
 	throw("WTF");
}

/*
function wordBufSize(w3) {
	if (w3.length % 3 != 0) throw(w3 + " is Not 3 padded");
 	var l=w3.length;
 	var bufSize=0;
 	bufSize=l/3*2;  //as 15 bits require 2 bytes;
 	/ *
 	while (l>0) {
 		l-=3;
 		bufSize+=1;
 	}
 	* / 
 	return bufSize;
}


function calcBufSize(words) {
 var size=0;
 for (word in words) {
 	size++; // for length byte (we know longest word is 60 chars)
 	var wbs=wordBufSize(pad3(word));
 	size+=wbs;
 	//console.log(word + " wbs=" + wbs + ' total size=' + size);
 } 
 return size;
}

function writeWord3ToBuf(buf,offset,word3) {
 	//console.log("word3=" + word3 + "| len=" + word3.length);
 	//console.log(buf);
 	var wbs=wordBufSize(word3);
	buf.writeUInt8(wbs,offset);
 	offset++; // for length byte
 	i=0;
 	for (i=0;i<word3.length;i+=3) {
 		//console.log('i= ' + i + ' word3=' + word3);
 		//console.log('i= ' + i + ' word3[i]=' + word3[i]);
 		//console.log('i= ' + i + ' word3[i+1]=' + word3[i+1]);
 		//console.log('i= ' + i + ' word3[i+2]=' + word3[i+2]);
 		writeCharTrioToBufAs2Bytes(buf,offset,word3[i],word3[i+1],word3[i+2]);
 		offset+=2;
 	}
	//console.log(buf);
 	return 1+wbs;

}

function createCompressedWordlist(words) {
	var bufSize=calcBufSize(words);
	console.log('bufSize=' + bufSize);
	const buf = Buffer.alloc(bufSize);
	var offset=0;
	var i=0;
	var word3;
	console.log("LOOP");
	for (word in words) {
		//console.log("-------------- word=" + word + "| len=" + word.length);
		word3=pad3(word);
		 offset+=writeWord3ToBuf(buf,offset,word3);
	 } 

	 
	 zlib.gzip(buf, function (error, zbuf) {
    	   if (error) throw error;
    	 console.log(buf);
    	 console.log(zbuf);
		 console.log('bufSize=' + bufSize);
		 console.log('offset=' + offset);
		 console.log('zbuf.length=' + zbuf.length);

	 })

}

//createCompressedWordlist({"abcdefghi":1,"abd":1});
//createCompressedWordlist(words);
//zlib.gzip(buf[, options], callback)


function buildprefixesTrieTree(){
	var prefixes={};
	var flat={};

	for (word in words) {
		var word3=pad3(word).replace("'",'_').toLowerCase();
		//tbd. skipping words that end with 's
		for(var si=0;si<word.length-3;si++) {
			var ss=word3.substr(si,3);
			
			if (!prefixes.hasOwnProperty(ss[0])) {
				prefixes[ss[0]]={};
			}
			if (!prefixes[ss[0]].hasOwnProperty(ss[1])) {
				prefixes[ss[0]][ss[1]]={};
			}
			if (!prefixes[ss[0]][ss[1]].hasOwnProperty(ss[2])) {
				prefixes[ss[0]][ss[1]][ss[2]]=[];
			}
			var ssis=prefixes[ss[0]][ss[1]][ss[2]];
			if (ssis.indexOf(si)==-1) {
				ssis.push(si);
				ssis=ssis.sort();
			}
			
			/ *
			if (!flat.hasOwnProperty(ss)) flat[ss]=[];
			var ssis=flat[ss];
			if (ssis.indexOf(si)==-1) ssis.push(si);
			* /
		}
	}
}

function buildSubstingsPerIndex(l) {
	var indai={};
	var bufSize=0;

	for (word in words) {
		var word3=pad3(word).replace("'",'_').toLowerCase();
		//tbd. skipping words that end with 's
		for(var si=0;si<word.length-3;si++) {
			var ss=word3.substr(si,3);
			if (!indai.hasOwnProperty("k"+si)) {
				indai["k"+si]={};
			}
			if (!indai["k"+si].hasOwnProperty(ss)) indai["k"+si][ss]=1;
		}
	}

	for (var l=0;l<=60;l++) {
		bufSize+=2; //  for size
		for (ss in indai['k'+l]) {
			bufSize+=2; // for ss (assumig length of 3)
		}
	}
	console.log('allocating a ' ,bufSize , ' buffer');
	const buf = Buffer.alloc(bufSize);

	var offset=0;
	var ss_count_in_size=0;
	for (var l=0;l<60;l++) {
		offset_for_count=offset;
		offset+=2;
		ss_count_in_size=0;
		for (ss in indai['k'+l]) {
			ss_count_in_size++;
			console.log('writing ' , ss , ' at ' ,offset);
	 		writeCharTrioToBufAs2Bytes(buf,offset,ss[0],ss[1],ss[2]);
	 		offset+=2;
		}
		buf.writeUInt16BE(ss_count_in_size,offset_for_count);
	}


	return {indai:indai,buf:buf};
}
*/
/*
var indai_data=buildSubstingsPerIndex(3);
zlib.gzip(indai_data.buf, function (error, zbuf) {
	if (error) throw error;
	indai_data.zbuf=zbuf;
	console.log(indai_data.buf);
	console.log(indai_data.zbuf);

	console.log(indai_data.buf.length);
	console.log(indai_data.zbuf.length);

	console.log('zbuf.length=' + zbuf.length);

})
*/



//String.prototype.padRight = function(l,c) {return this+Array(l-this.length+1).join(c||" ")}
//makes sting legth be a multiple of l by padding with spaces
String.prototype.padRightMod = function(m,c) {
	//console.log(this,m,c,((m - (this.length % m)) % m));
	return this+Array(((m - (this.length % m)) % m) + 1).join(c||" ")
}


//console.log("1234".padRightMod(3,'x'));
//console.log("1234".padRightMod(4,'x'));
//console.log("1234".padRightMod(5,'x'));
//console.log("1234".padRightMod(6,'x'));
//console.log("1234".padRightMod(7,'x'));
//console.log("1234".padRightMod(8,'x'));

//console.log(JSON.stringify(indai).replace(/["]/g,''));
//console.log('exports.hints='+JSON.stringify(indai).replace(/["]/g,''));

function walk_trie_node(ss,node,leaf){
	if (!node.hasOwnProperty(ss[0])) {
		node[ss[0]]=(ss.length==1)?leaf:{};
	}
	if (ss.length==1) {
		return node[ss[0]];	
	}
	else {
		return walk_trie_node(ss.substr(1),node[ss[0]],leaf);
	}
}

function add_substrings_to_trie(word,ssl,trie_root){
	//tbd. skipping words that end with 's
	
	//console.log('word,ssl,trie_root:',word,ssl,trie_root);

	for(var si=0;si<=word.length-ssl;si++) {
		var ss=word.substr(si,ssl);
		//console.log('ss=',ss,' si=',si);
		var leaf=walk_trie_node(ss,trie_root,[]);

		if (leaf.indexOf(si)==-1) {
			leaf.push(si);
			leaf=leaf.sort();
		}
	}
}

function hash(word,abc,hash_groups) {
	var hash=0;
	for (var i=0;i<word.length;i++) {
		chi=abc.indexOf(word[i]);
		hash ^= chi;
	}
	return hash % hash_groups;
}

function buildTrie(words,abc,hash_groups,v) {
	var trie={};
	var normalized_word_length_key;
	var normalized_word;
	for (word in words) {
		if (word.length>2 && word.length<25) {
			normalized_word=word.toLowerCase().padRightMod(3);
			normalized_word_length_key='l'+normalized_word.length;
			if (v) console.log(normalized_word ,  normalized_word_length_key);
			if (!trie.hasOwnProperty(normalized_word_length_key)) {
				trie[normalized_word_length_key]={};
			}
			/*
			var hk='h'+hash(normalized_word,abc,hash_groups);
			//console.log('hash key for ', normalized_word , " is ", hk);
			if (!trie[normalized_word_length_key].hasOwnProperty(hk)) {
				trie[normalized_word_length_key][hk]={};
			}*/

			if (v) console.log(JSON.stringify(trie));
			add_substrings_to_trie(normalized_word,3,trie[normalized_word_length_key]/*[hk]*/);
		}
	}
	return trie;
}


function writeTrieToWriter(trie,hash_groups,abc,bitWriter) {

 	//var lkl={l3:1,l6:4,l9:7,l12:10,l15:13,l18:16,l21:19,l24:22,l27:25,l60:58,l30:28,l36:34,l33:31,l45:43};
 	var lkl={l3:1,l6:4,l9:7,l12:10,l15:13,l18:16,l21:19,l24:22};
 	var lk;
 	var gk;
 	for (var lki=3;lki<=24;lki+=3) { 
 		lk = 'l' + lki;
	    if  (!trie.hasOwnProperty(lk)) {
	    	bitWriter.write0(0,lk);
	    }
	    else {
	    	bitWriter.write1(0,lk);
	    	/*
	    	for (var hash_group_index=0;hash_group_index<hash_groups;hash_group_index++) {
	    		gk= 'h' + hash_group_index;
	    		if (!trie[lk].hasOwnProperty(gk)) {
	    			bitWriter.write0(1,gk);
	    		}
	    		else {
	    			bitWriter.write1(1,gk);*/
					for (var ch1i=0;ch1i<abc.length;ch1i++) {
						ch1=abc[ch1i];
						if (!trie[lk]/*[gk]*/.hasOwnProperty(ch1)) {
							bitWriter.write0(2,ch1);
						}
						else {
							bitWriter.write1(2,ch1);					
							for (var ch2i=0;ch2i<abc.length;ch2i++) {
								ch2=abc[ch2i];
								if (!trie[lk]/*[gk]*/[ch1].hasOwnProperty(ch2)) {
									bitWriter.write0(3,ch2);
								}
								else {
									bitWriter.write1(3,ch2);					
								 	for (var ch3i=0;ch3i<abc.length;ch3i++) {
								 		ch3=abc[ch3i];
								 		if (!trie[lk]/*[gk]*/[ch1][ch2].hasOwnProperty(ch3)) {
											bitWriter.write0(4,ch3);
										}
										else {
											bitWriter.write1(4,ch3);
								 			var indai=trie[lk]/*[gk]*/[ch1][ch2][ch3];
								 			
								 			for (var ii=0;ii<lkl[lk];ii++) {
								 				if (indai.indexOf(ii)>-1) {
								 					bitWriter.write1(5,ii);
								 				}
								 				else {
								 					bitWriter.write0(5,ii);
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

function writeTrieToBuffer(trie,hash_groups,abc){
	var counter=new bitSinks.Counter();
	writeTrieToWriter(trie,hash_groups,abc,counter);
	
	var rawbytesCount=counter.getByteCount()
	console.log('     rawBytes=',rawbytesCount)
	var biter=new bitSinks.Writer(rawbytesCount);

	writeTrieToWriter(trie,hash_groups,abc,biter);
	console.log('     biter.buf.length=',biter.buf.length);
	return biter.buf;
}

/*
	zlib.gzip(biter.buf, function (error, zbuf) {
			if (error) throw error;
			console.log("biter.buf:" , biter.buf);
			console.log("biter.buf.length:",biter.buf.length);
			console.log("zbuf.length:",zbuf.length);
			fs.writeFile("L3.z", zbuf,{encoding:'binary'}, function (err){
				console.log("buffer written");
			})
		})
*/
function zipAndSave(buf,fn) {

	zlib.gzip(buf, function (error, zbuf) {
		if (error) throw error;
		//console.log("buf:" , buf);
		//console.log("buf.length:",buf.length);
		//console.log("zbuf.length:",zbuf.length);
		fs.writeFile(fn, zbuf,{encoding:'binary'}, function (err){
			console.log(fn + " buf.length:",buf.length, " =Z> ",zbuf.length + " saved.");
		});
	}
	)
}


function bitReader(b) {
	console.log("initializing bit reader");
	console.log(b);
	this.buf = b;
	this.iBit=0;
	this.iByte=0;
	this.ui8=this.buf.readUInt8(this.iByte);
	console.log("byte read:" , this.ui8, "@B[" + this.iByte + "]b{" + this.iBit + "}");
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
				console.log("byte read:" , this.ui8, "@B[" + this.iByte + "]b{" + this.iBit + "}");
			}
			else {
				console.log("SKIPREAD iByte=",this.iByte," this.buf.length=" ,this.buf.length);

				//this.ui8=this.buf.readUInt8(this.iByte);
			}
			
		}
	}	
}

//I used this to find which 2 char strings where missing
function ww2chars(){
	var tcw={};
	for(var w in words) {
		if (w.length==2) {
			tcw[w.toLowerCase()]=1;
		}
	}
	for (var ch1i=0;ch1i<abc.length-2;ch1i++) {
	  	var ch1=abc[ch1i];
	  	for (var ch12=0;ch12<abc.length-2;ch12++) {
	  		var ch2=abc[ch12];
	  		if (!tcw.hasOwnProperty(ch1+ch2)) {
	  			console.log('"'+ch1+ch2+'":1,');
	  		}
	  	}
	}
}
//ww2chars();


var trie;
var buf;
var fn;
for (var no_of_sub_groups=1;no_of_sub_groups<=1;no_of_sub_groups+=1) {
	fn ="L" + no_of_sub_groups + ".z";
 	console.log("generating file:" + fn );
 	console.log("     Building Trie" );
 	trie=buildTrie(words,abc,no_of_sub_groups);
 	//console.log("     trie:" , JSON.stringify(trie) );
 	console.log("     serializing to buffer" );
 	buf=writeTrieToBuffer(trie,no_of_sub_groups,abc);

/*
 	var br= new bitReader(buf);
 	baarr=[];
 	for (var bi=0;bi<buf.length*8;bi++) {
 		baarr.push(br.read())
 	}
 	var bitstr=baarr.join('');
 	console.log(bitstr.length + " bits:" +bitstr );
 	
 	console.log("     zippin g and saving" );
*/  	
 	zipAndSave(buf, fn);
}

