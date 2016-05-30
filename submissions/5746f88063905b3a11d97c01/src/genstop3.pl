use strict;

my $fname = $ARGV[0];
my @res;
my @AL=split(//,"abcdefghijklmnopqrstuvwxyz'");
my %S = ();

LINE:
while(<STDIN>) {
	chomp;
	next LINE unless m/^\d+\.\s+\[(...)\]\s/;
	$S{$1}=1;
}

my $N = @AL;
	
for (my $i1 = 0; $i1 < $N; $i1++) {
	#print "$AL[$i1] $i1\n";
	for (my $i2 = 0; $i2 < $N; $i2++) {
		for (my $i3 = 0; $i3 < $N; $i3++) {
			my $bitn = $i1*27*27+$i2*27+$i3;
			my $s = $AL[$i1] . $AL[$i2] . $AL[$i3];
			my $bito = $bitn%8;
			my $byten = ($bitn-$bito)/8;
			my $bit = $S{$s} ?  1 : 0;
			$res[$byten] |= ($bit << $bito);
		}
	}
}

my $num = @res;
my $p = pack("C[$num]", @res);

open FILE, ">$fname" or die "$fname: $!";
print FILE $p;
close FILE;
