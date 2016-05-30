var fs= require('fs');
var words=fs.readFileSync( 'words.txt' ).toString().toLowerCase().trim().split('\n')
var mass={}
for (var i = words.length - 1; i >= 0; i--) {
	var n = words[i].slice(-3)
	if (mass[n]) {
			mass[n]++
	}else {
		mass[n]=1	
	}
}
for(var lt in mass){
	if (mass[lt]<0) {
		delete mass[lt]	
	}
}
var tte=[]
for(var lt in mass){
	tte.push(lt)	
	
}
mass={}
for (var i = words.length - 1; i >= 0; i--) {
	var n = words[i].slice(0,3)
	if (mass[n]) {
			mass[n]++
	}else {
		mass[n]=1	
	}
}
for(var lt in mass){
	if (mass[lt]<0) {
		delete mass[lt]	
	}
}
var tte2=[]
for(var lt in mass){
	tte2.push(lt)	
	
}
fs.writeFileSync("wordst55555.txt",tte.join("\n")+"~\n"+tte2.join("\n"))
//fs.writeFileSync("wordst2.txt",mass.join('\n'))
