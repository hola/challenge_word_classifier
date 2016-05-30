use strict;
use JSON;
use Data::Dumper;

sub oc($) {
    my $c = shift;
    if ($c eq "'") { return 0; } 
    if ($c eq 'Z') { return 27; }
    if ($c eq 'X') { return 28; }
    $c = ord($c)-ord('a')+1; 
    return $c;
}

sub h($) {
    my $x = 0;
    my $w = shift;
    while (1) {
	unless ($w =~ m/^(.)/) {
	    return $x;
	}
	my $c = $1; $w =~ s/^.// ;
	$x = $x*113+oc($c);
	$x &= 0xFFFFFFF;
    }
}


open WORDS, "<llwords.txt" or die "$!";
	
my $i;

my %W = (); # words
my %K = (); # no-words
my @words = ();
WORD:
while (<WORDS>) {
    chomp;
    my $word = $_;
    push @words, $word;
    $W{$word} = 0;
}
close WORDS;

my @J = (glob('dump/*.json'));
my $N=$ARGV[0];
if (!defined($N)) { $N = 100; }
my @J1 = splice(@J,0,$N);
print ((scalar @J1), " ", (scalar @J), "\n");

# load JSON
my ($nW, $nK) = (0, 0);
for my $fname (@J1) {
    local $/;
    open FH, "<$fname" or die "$fname: $!";
    my $json_text = <FH>;
    close FH;
    my $j = decode_json($json_text);
    for my $k (keys %$j) {
	if ($$j{$k}) { ++$nW; } else { ++$nK; }
	my $hr = ($$j{$k}) ?  \%W :  \%K;
	if (!defined($$hr{$k})) {
	    $$hr{$k} = 1;
	} else {
	    ++$$hr{$k};
	}
    }
}

my $nN = $nW + $nK;
print "${\(scalar @words)}, ${\(scalar (keys %W))}, ${\(scalar (keys %K))}\n";
print "nW=$nW nK=$nK nN=$nN\n";

sub sumif($$$) {
    my ($crit, $hr, $lr) = @_;
    my $S = 0;
    for my $i (grep {&$crit($_)} @$lr) { $S += $$hr{$i}; }
    return $S;
}

$|=1;
#LEN:
#for(my $Len=60; $Len>=0; $Len--) {
#    my $Sw = sumif(sub{length(shift)>=$Len}, \%W, [keys %W]);
#    my $Sk = sumif(sub{length(shift)>=$Len}, \%K, [keys %K]);
#    my $S = $Sw+$Sk;
#    next LEN if $S<=10;
#    my $f = $Sk/$S;
#    printf("%2d: %7.2f (%d+%d=%d)\n", $Len, 100*$f, $Sw, $Sk, $S);
#    last LEN if $S>=10000 and $f<0.7;
#}
#
#exit(0);


sub alls($$$) {
    my ($s, $a, $b) = @_;
    # all unique substrings of $s of lengths from $a to $b
    my %h;
    my $ls = length($s);
    for (my $l=$a; $l<=$b && $l<=$ls; $l++) {
	my $to = $ls-$l;
	for (my $p=0; $p<=$to; $p++) {
	    my $ss = substr($s, $p, $l);
	    $h{$ss} = 1;
	}
    }
    return (keys %h);
}

sub add_to_wka($$$$) {
    my ($hr, $w, $o, $c) = @_;
    # add to hash-ref $hr word $w with count $c into column $o
    if (!defined($$hr{$w})) {
	$$hr{$w} = [0, 0];
    }
    ${$$hr{$w}}[$o]+=$c;
}

my %S; # substrings
my $minlen = 3; my $maxlen = 15;

sub get_normal_words($) {
    my $hr = shift;
    return grep { 
	(length($_)>=$minlen) && (length($_)<=$maxlen) && ($$hr{$_}>0)
	    && !(m/^'/) && !(m/'$/) }
	(keys %$hr);
}

my @lW = get_normal_words(\%W); # words
for my $w (@lW) {
	for my $ss (alls($w, 3, 3)) {
	    add_to_wka(\%S, $ss, 0, $W{$w});
	}
}
my @lK = get_normal_words(\%K); # no-words
for my $w (@lK) {
	for my $ss (alls($w, 3, 3)) {
	    add_to_wka(\%S, $ss, 1, $K{$w});
	}
}
    
$nW = sumif(sub{return 1;}, \%W, \@lW);
$nK = sumif(sub{return 1;}, \%K, \@lK);
$nN = $nW + $nK;
print "${\(scalar @lW)}, ${\(scalar @lK)}\n";
print "nW=$nW nK=$nK nN=$nN\n";

sub l2($) {
    return log(shift)/log(2.0);
}

sub dl($) {
    my $p = shift;
    if (abs($p)<1e-12) { return 0; }
    return $p*l2($p);
}

# Entropy
my $Ht = l2($nN)-(dl($nW)+dl($nK))/$nN;
print "Ht=$Ht\n";

my $H0 = l2($nN);
foreach my $w (@lW) {
    $H0 -= dl($W{$w})/$nN;
}
foreach my $w (@lK) {
    $H0 -= dl($K{$w})/$nN;
}
print "H0=$H0\n";




sub sum_wka($) {
    my $a = shift;
    my ($w, $k) = @$a;
    return $w+$k;
}
sub min_wka($) {
    my $a = shift;
    my ($w, $k) = @$a;
    return ($w<$k)?$w:$k;
}
sub metric_wka($) {
    my $a = shift;
    my ($w, $k) = @$a;
    return ($k-$w)/($k+$w);
    #return $k-$w;
}

my @Substrings = sort { metric_wka($S{$b})<=>metric_wka($S{$a}) }
    (grep {sum_wka($S{$_}) > 0} (keys %S) );

my $NS = @Substrings;
print "Subtrings: $NS\n";

my $Fn = 0; # false negatives
my $Tn = 0; # true negatives
my $stops = 0; # substrings stopped
my $H1i = $H0; # Entropy incremental
my $Ps = 0; # P stopped
my %DD = (); # Already deleted words
while (@Substrings) {
    my $s = shift @Substrings;
    my $a = $S{$s};
    $stops++;
    #print "DEBUG took $s -- $$a[0]/$$a[1]\n";
    my $dFn = 0; my $dTn = 0;
    my %DC = (); # candidates for deletion
    for my $w (@lW) {
	unless ($DD{$w}) {
	    if ($w =~ m/$s/) {
		#$DD{$w} = 1;
		$dFn+=$W{$w};
		$DC{$w}=dl($W{$w})/$nN;
	    }
	}
    }
    for my $w (@lK) {
	unless ($DD{$w}) {
	    if ($w =~ m/$s/) {
		#$DD{$w} = 1;
		$dTn+=$K{$w};
		$DC{$w}=dl($K{$w})/$nN;
	    }
	}
    }
    if ($dFn<=$dTn) {
	while (my ($w, $hv) = each %DC) {
	    $H1i+=$hv;
	    $DD{$w}=1;
	}
	$Fn+=$dFn; $Tn+=$dTn;
	my $H1c = $H1i-(dl($Fn)+dl($Tn))/$nN;
	my $H1 = $H1i-dl($Fn+$Tn)/$nN;
	print "$stops. [$s] f=${\($Fn/$nN)} Fn=$Fn (+$dFn) Tn=$Tn (+$dTn)",
	    " HL=${\($H0-$H1)} IL=${\($H1c-$H1)}\n";
    } else {
	print ">$stops. [$s] +$dFn/+$dTn\n";
    }
}





sub Entropies($) {
    my $CL = shift;
    my $H1 = l2($nN); my $H1a = $H1;
    my $F = 0;
    for my $a (values %$CL) {
	$H1 -= dl(sum_wka($a))/$nN;
	$H1a -= (dl($$a[0])+dl($$a[1]))/$nN;
	$F += ($$a[0]<$$a[1]) ? $$a[0] : $$a[1];
    }
    return ($H1, $H1a-$H1, $F/$nN);
}

#    my %Classes = ();
#    for my $w (@lW) { add_to_wka(\%Classes, &$txsub($w), 0, $W{$w}); }
#    for my $w (@lK) { add_to_wka(\%Classes, &$txsub($w), 1, $K{$w}); }
#    my ($H1, $IL1, $f) = Entropies(\%Classes);
