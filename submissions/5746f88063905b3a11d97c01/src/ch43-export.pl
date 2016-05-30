use strict;
use JSON;
use Data::Dumper;

sub oc($) {
    my $c = ord(shift)-97;
    if ($c<0) {$c=($c+292)/9};
    return $c;
}

sub h($$) {
    my $x = 0;
    my ($p, $w) = @_;
    while (1) {
	unless ($w =~ m/^(.)/) {
	    return $x;
	}
	my $c = $1; $w =~ s/^.// ;
	$x = $x*$p+oc($c);
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

my @J = (glob('../../dump/*.json') , glob('../../1dump/*.json'));
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

# load 3grams
my %S3 = ();
open FH3, "<result3.txt" or die "$!";
LINE3:
while (<FH3>) {
    chomp;
    next LINE3 unless m/^\d+\.\s+\[(...)\]\s/;
    $S3{$1} = 1;
}
close FH3;
    

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

my $minlen = 3; my $maxlen = 15;

sub check_stop3($) {
    my $w = shift;
    #for my $s (alls(substr($w, 1), 3, 3)) {
    for my $s (alls($w, 3, 3)) {
	if ($S3{$s}) { return 1; }
    }
    return 0;
}

sub get_normal_words($) {
    my $hr = shift;
    return grep { 
	(length($_)>=$minlen) && (length($_)<=$maxlen) && ($$hr{$_}>0)
	    && !(m/^'/) && !(m/'$/) 
	    #&& !check_stop3($_)
	     }
	(keys %$hr);
}

my @lW = get_normal_words(\%W); # words
my @lK = get_normal_words(\%K); # no-words
    
$nW = sumif(sub{return 1;}, \%W, \@lW);
$nK = sumif(sub{return 1;}, \%K, \@lK);
$nN = $nW + $nK;
print "${\(scalar @lW)}, ${\(scalar @lK)}\n";
print "normal words nW=$nW nK=$nK nN=$nN\n";

my @lW = grep {!check_stop3($_)} @lW;
my @lK = grep {!check_stop3($_)} @lK;
$nW = sumif(sub{return 1;}, \%W, \@lW);
$nK = sumif(sub{return 1;}, \%K, \@lK);
$nN = $nW + $nK;
print "${\(scalar @lW)}, ${\(scalar @lK)}\n";
print "after stop3 nW=$nW nK=$nK nN=$nN\n";

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
sub metric_wka($) {
    my $a = shift;
    my ($w, $k) = @$a;
    #return ($k-$w)/($k+$w);
    return $k-$w;
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

sub tx {
    my $w = shift;
    return substr($w, -4);
}

my %Classes = ();
for my $w (@lW) { add_to_wka(\%Classes, tx($w), 0, $W{$w}); }
for my $w (@lK) { add_to_wka(\%Classes, tx($w), 1, $K{$w}); }
my ($H1, $IL1, $f) = Entropies(\%Classes);

printf("H.loss=%f I.loss=%f f=%f\n", $H0-$H1, $IL1, $f);

my @SClasses = sort { metric_wka($Classes{$a}) <=> metric_wka($Classes{$b}) }
    (grep { length >= 4 } (keys %Classes));

my @Top1 = ();
my @Top2 = ();
my $x = 1;
for my $c (splice(@SClasses, 0, 256)) {
    if (length($c)<4) {
	$c = "^" . $c
    }
    if ($W{$c}) {
	push @Top1, $c;
    } else {
	push @Top2, $c;
    }
    $x=1-$x;
}

my $regex1 = 's/(' . join('|', @Top1). ')/9/g';
my $regex2 = 's/(' . join('|', @Top2). ')/0/g';
print "DEBUG $regex1\nDEBUG $regex2\n";
my $tx1sub = eval('sub { $_ = shift; ' . "$regex1; $regex2; " . 'return $_}');

my %Classes = ();
for my $w (@lW) { add_to_wka(\%Classes, $tx1sub->($w), 0, $W{$w}); }
for my $w (@lK) { add_to_wka(\%Classes, $tx1sub->($w), 1, $K{$w}); }
my ($H1, $IL1, $f) = Entropies(\%Classes);

printf("Classes H.loss=%f I.loss=%f f=%f\n", $H0-$H1, $IL1, $f);

sub mk_bloom($$$) {
    my ($m, $pv, $lv) = @_;
    my @res = ();
    for (my $i=0; $i<$m; $i++) { push @res, 0; }
    for my $w (@$lv) {
	for my $p (@$pv) {
	    $res[h($p,$w) % $m] = 1;
	}
    }
    return \@res;
}

my $bloom1 = mk_bloom(5120, [11,17,23,29,73,101,113], [@Top1, @Top2]);
my $bloom2 = mk_bloom(1280, [13,19,101,109], \@Top1);

sub test_bloom($$$$) {
    my ($b, $m, $pv, $w) = @_;
    for my $p (@$pv) {
	unless ($$b[h($p,$w) % $m]) { return 0; }
    }
    return 1;
}

sub check_blooms($) {
    my $w = shift;
    unless (test_bloom($bloom1, 5120, [11,17,23,29,73,101,113], $w)) {return undef;}
    if (test_bloom($bloom2, 1280, [13,19,101,109], $w)) {return '9';}
    return '0';
}

print "BLOOMS!\n";
for my $w (@Top1) {
    my $cb = check_blooms($w);
    if (!defined($cb)) { print "UNDEF for $w!\n"; }
    if ($cb ne '9') { print "$w: $cb!\n"; }
}
for my $w (@Top2) {
    my $cb = check_blooms($w);
    if (!defined($cb)) { print "UNDEF for $w!\n"; }
    if ($cb ne '0') { print "$w: $cb.\n"; }
}

sub tx2($) {
    my $w = shift;
    my $sw = $w;
    for (my $i = 0; $i <= length($w)-4; $i++) {
	my $cb = check_blooms(substr($w, $i, 4));
	if (defined($cb)) {
	    substr($w, $i, 4) = $cb;
	}
    }
    #my $w1 = $tx1sub->($sw);
    #if ($w1 ne $w) {
    #	print "$sw: $w $w1\n";
    #}
    return $w;
}

sub txn($) {
    my $w = shift;
    my $l = length($w)%3;
    if ($l == 1) { return "0$w"; }
    if ($l == 2) { return "9$w"; }
    return $w;
}


my %BClasses = ();
for my $w (@lW) { add_to_wka(\%BClasses, $w, 0, $W{$w}); }
for my $w (@lK) { add_to_wka(\%BClasses, $w, 1, $K{$w}); }
#for my $w (@lW) { add_to_wka(\%BClasses, tx2($w), 0, $W{$w}); }
#for my $w (@lK) { add_to_wka(\%BClasses, tx2($w), 1, $K{$w}); }
my ($H1, $IL1, $f) = Entropies(\%BClasses);

printf("After bloom: H.loss=%f I.loss=%f f=%f\n", $H0-$H1, $IL1, $f);
printf("Classes: %d\n", scalar (keys %BClasses));

sub pack_bloom($) {
    my $b = shift;
    my @b = @$b;
    my $r = '';
    while (@b) {
	my @b1 = splice(@b,0,8);
	my $bit = 1;
	my $byte = 0;
	while (@b1) {
	    my $b = shift @b1;
	    if ($b) { $byte += $bit; }
	    $bit *= 2;
	}
	my $p = pack('C', $byte);
	$r .= $p;
    }
    return $r;
}

open BL1, ">bloom1.bin" or die "$!";
print BL1 (pack_bloom($bloom1));
close BL1;
open BL2, ">bloom2.bin" or die "$!";
print BL2 (pack_bloom($bloom2));
close BL2;

my ($n9, $n0, $n9x, $n0x) = (0,0,0,0);
open RES, ">classes.txt" or die "$!";
while (my ($s, $a) = each %BClasses) {
    print RES "[$s] $$a[0] $$a[1]\n";
    $n9++ if ($s =~ /9/);
    $n0++ if ($s =~ /0/);
    $n9x++ if ($s =~ /9./);
    $n0x++ if ($s =~ /0./);
}
close RES;

print "$n9 $n0 $n9x $n0x\n";
