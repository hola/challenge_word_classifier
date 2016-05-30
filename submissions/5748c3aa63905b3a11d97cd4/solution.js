N="accident you she he  accessory adventure advice age agency agent ambition amplitude arc area ashe boy cat colour column corner difficulty dog door day eye face god grace head i man night room something thing time way"

V="accept allow appear approximate arrange ask be bottom break calculate can collect collide come concept convert do excite exercise find go get give have know like look make move must open should say see settle stand take tell think turn try want will would"

ADJ="active absent adjacent all brave busy civil clever combat concrete congruent continuous convenient cool custom direct dreadful each empty exact fair famous foreign fresh frozen good late little mortable near some other true extinct"

ADV="so there then about again ago along also always and around as at away behind both but by down easy either for from if in into just more no not now of off on only or out over through to too up what with"

NAME="america asia europe india korea china japan vietnam"

ARTICLE="a the"

N_ADJ="alternative back capital constant desert right"

N_V="address beat choice clay claim clip code coil compound cost crop cross date degenerate demand deposit dip disgrace dislike ditch dive divorce envy export fan fever figure flash flesh flood flour focus forecast fracture flint flood frost fume funnel fur furnace germ gill hand yawn"

PRONOUN="it this which what"

NUMB="one two three four five six seven eight nine teen eleven twelve"










dict=[]

add=function(element,type){
	dict.length++
	dict[dict.length-1]={value:element,type:type}
}


add_packet=function(name,set){
	var start=0;
	for(var i=0;i<window[name].length;i++){
		if(window[name].charAt(i)==" "){
			add(window[name].substring(start,i),set)
			start=i+1
		}
		else
			if(i==window[name].length-1)
				add(window[name].substring(start,i+1),set)
	}
}


add_packet("N","N")
add_packet("V","V")
add_packet("ADJ","ADJ")
add_packet("ADV","ADV")
add_packet("NAME","NAME")
add_packet("ARTICLE","ARTICLE")
add_packet("N_ADJ",["N","ADJ"])
add_packet("N_V",["N","V"])
add_packet("NUMB","NUMB")


COUNT_OF_FUNCTIONS=22


FUNCTION=17



getType=function(word){
	if(word.fun===undefined)
		return dict[word.word].type
	if(outputtypes[word.fun]==null)
		return getType(word.previous)
	return outputtypes[word.fun]
}





correct=function(x){
	if(x.fun===undefined)
		return true
	if(x.fun==FUNCTION){
		if(getType(x.other)!="N")
			return false
		if(x.other==x.previous)
			return false
	}
	if(inputtypes[x.fun]==null)
		return true
	var inp1=getType(x.previous)
	var inp2=inputtypes[x.fun]
	
	if(typeof(inp1)!="object")
		var i1=[inp1]
	if(typeof(inp2)!="object")
		var i2=[inp2]
	for(var i in i1){
		for(var j in i2)
			if(i1[i]==i2[j])
				return true
	}
	return false
}

outputtypes=["PL","OF","N","ADJ","PS",,"ADJ","N","V","ADJ","N","ADJ","ADV","N","PS","N",,,"PP","ADJ","ADJ","ADJ"]
inputtypes=[["N","PRONOUN"],["NAME","N"],["N","V","ADJ"],"N","V",,"V","V",["ADJ","N"],"N",["N","V"],"N","N","NAME","V",["NAME","N"],,,"V","ADJ","ADJ","NUMB"]


real=function(x){


	if(x.fun===undefined)
		return dict[x.word].value

	var pr=real(x.previous)

	switch(x.fun){
		case 0:
			if(pr=="this")
				return "those"
			if(pr=="i")
				return "we"
			if(pr=="you")
				return "you"
			if(pr=="he"||pr=="she")
				return "they"
			if(pr.endsWith("y"))
				return pr.substring(0,pr.length-1)+"ies"
			if(pr=="child")
				return pr+"ren"
			if(pr=="tooth")
				return "teeth"
			if(pr=="foot")
				return "feet"
			if(pr=="man")
				return "men"
			if(pr.endsWith("s")||pr.endsWith("sh"))
				return pr+"es"
			return pr+"s"

		case 1:
			if(pr=="i")
				return "my"
			
			return pr+"'s"
			
		case 2:
			if(pr=="equip"||pr.endsWith("ce")||pr.endsWith("ge")||pr.endsWith("le"))
				return pr+"ment"
			if(pr.endsWith("te")||pr.endsWith("se"))
				return pr.substring(0,pr.length-1)+"ion"
			if(pr=="absorb"){
				return pr+"tion"
			}

			if(pr=="convert")
				return "conversion"
			if(pr.endsWith("t"))
				return pr+"ion"
			if(x.function==8||pr.endsWith("ine"))
				return pr.substring(0,pr.length-1)+"ation"
			if(pr.endsWith("ss"))
				return pr+"ion"
			if(pr.endsWith("de"))
				return pr.substring(pr.length-2)+"sion"
			if(pr=="child")
				return pr+"hood"

			if(pr=="disturb"||pr=="accept"||pr=="allow")
				return pr+"ance"
			if(pr.endsWith("ent"))
				return pr.substring(0,pr.length-3)+"ence"
			


			if(pr="dark")
				return pr+"ness"
			if(pr=="empty")
				return pr.substring(0,pr.length-1)+"iness"
			if(pr=="excite")
				return pr+"ment"
			if(pr=="true")
				return pr.substring(0,pr.length-1)+"th";
			if(x.previous.function==6)
				return real(x.previous.previous)+"ability"
			if(pr=="difficult")
				return pr+"y"
			if(pr=="king")
				return pr+"dom"
			return pr+"ing"
		case 3:
			if(pr=="good")
				return "well"
				
			if(pr=="self")
				return pr+"ish"
			if(pr=="woman")
				return pr+"like"
			if(pr=="other")
				return pr+"wise"
			return pr+"ly"
			
		case 4:
			if(pr=="go")
				return "went"
			if(pr=="stand")
				return "stood"
			if(pr=="say")
				return "said"
			if(pr=="see")
				return "saw"
			return pr+"ed"
		case 5:
			if(x.previous.function=="15")
				return real(x.previous.previous)+"less"
			if(pr=="able"||pr=="grace"||pr=="like"||pr=="apear")
				return "dis"+pr
			if(pr=="combat")
				return "non"+pr
			if(pr=="mortable")
				return "im"+pr
			if(pr=="")
				return "mal"+pr
			if(pr=="known")		
				return "un"+pr
		case 6:
			return pr+"able";
		case 7:
			return pr+"ing";
		case 8:
			return pr+"ize"
		case 9:
			
			if(pr.endsWith("ce"))
				return pr.substring(0,pr.length-1)+"ial"
			if(pr=="grace"||pr=="grate")
				return pr+"ful"
		case 10:
			if(pr.endsWith("ism"))
				return pr.substring(0,pr.length-3)+"ist"
			if(pr=="sea")
				return pr+man
			if(pr="combat")
				return pr+"ant"
			if(pr.endsWith("te"))
				return pr.substring(pr.length-1)+"or"
			if(pr.endsWith("ct"))
				return pr+"or"
			return x+"er"
		case 11:
			return pr+"wide"
		case 12:
			return pr+"ward"
		case 13:
			if(pr=="china"||pr=="vietnam"||pr=="japan"){
				if(pre.endsWith("a"))
					return pr.substring(0,pr.length-1)+"ese"
				return pr+"ese"
			}
			if(pr.endsWith("ny"))
				return pr.substring(0,pr.lingth-1)
			return pr.substring(0,pr.length-1)+"n"
			
		case 14:
			return pr+"s" 
		case 15:
			return pr+"logy"
		case 16:
			if(x.previous=="stand")
				return "under"+pr
			
			return "sub"+pr
		case 17:
			return x.other+x.previous
		case 18:
			if (pr=="keep")
				return "kept"
			if(pr=="see")
				return "seen"
			return pr+"ed"

		case 19:
			return pr+"er"
		case 20:
			if(pr=="good")
				return "best"
			if(pr=="near")
				return "next"
			if(pr="late")
				return "last"
		case 21:
			return pr+"th"
		
	}
	
	
	return null
}



MAX=3



next=function(tree){
	if(tree.fun===undefined){
		if(tree.word<dict.length-1){
			tree.word++
			return true
		}
	
		if(level<MAX){
			tree.fun=0;
			level++
			tree.previous={word:0}
			return true
		}
		return false
	}

	if(next(tree.previous))
			return true
	if(tree.fun==FUNCTION){
		if(next(tree.other)){
			tree.previous={word:0}
			return true
		}
	}
		
	if(tree.fun<COUNT_OF_FUNCTIONS-1){
		tree.fun++
		delete tree.other
		tree.previous={word:0}
		if(tree.fun==FUNCTION)
			tree.other={word:0}
		return true
	}
	return false
}




test=function(word){
	tested=word=="an"?"a":word
	ob={word:0}
	level=0


	while(real(ob)!=word||!correct(ob)){
		if(correct(ob))
			console.log(real(ob))
		if(!next(ob))
			return false
	}
	return true
}

test("hello")