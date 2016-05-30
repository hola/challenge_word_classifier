
function z_value(S, Z)
{
	Z[0]=0;
	var bst=0;
	for(var i=1;i<S.length;i++) {
		if(Z[bst]+bst<i) Z[i]=0;
		else Z[i]=Math.min(Z[bst]+bst-i,Z[i-bst]);
		while(S[Z[i]]==S[i+Z[i]]) Z[i]++;
		if(Z[i]+i>Z[bst]+bst) bst=i;
	}
}