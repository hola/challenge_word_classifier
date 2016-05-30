has_garbage=function(a){
	for(var x=0;x<a.length-1;)if(garbage[a.substr(x,2)]||garbage[a.substr(x++,3)])return 1
}
