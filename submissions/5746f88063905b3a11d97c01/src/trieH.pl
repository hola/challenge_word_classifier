use strict;
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


sub add_to_wka($$$$) {
    my ($hr, $w, $o, $c) = @_;
    # add to hash-ref $hr word $w with count $c into column $o
    if (!defined($$hr{$w})) {
	$$hr{$w} = [0, 0];
    }
    ${$$hr{$w}}[$o]+=$c;
}

sub l2($) {
    return log(shift)/log(2.0);
}

sub dl($) {
    my $p = shift;
    if (abs($p)<1e-12) { return 0; }
    return $p*l2($p);
}

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
sub min_wka($) {
    my $a = shift;
    my ($w, $k) = @$a;
    return ($w>$k) ? $k : $w;
}




sub Entropies(@) {
    #my $H1 = l2($nN); my $H1a = $H1;
    my $F = 0;
    my $H1 = 0;
    my $H1a = 0;
    my $nN = 0;
    for my $aa (@_) {
	my $a = $$aa[1];
	$nN += sum_wka($a);
	$H1 -= dl(sum_wka($a));
	$H1a -= dl($$a[0])+dl($$a[1]);
	$F += min_wka($a);
    }
    $H1 = l2($nN)+$H1/$nN;
    $H1a = l2($nN)+$H1a/$nN;
    return ($H1, $H1a-$H1, $F/$nN,$nN);
}

sub wka_list_sum {
    my @S = (0, 0);
    for my $aa (@_) {
	my $a = $$aa[1];
	$S[0] += $$a[0];
	$S[1] += $$a[1];
    }
    return \@S;
}

my @AL=split(//,"abcdefghijklmnopqrstuvwxyz'09");
my @wka_list = ();
open CLASSES, "<classes.txt" or die "$!";
while(<CLASSES>) {
    chomp;
    my ($s, $w, $k) = split;
    if ($s =~ m/^\[(.+)\]$/ ) {	
	push @wka_list, [$1, [$w, $k]];
    } else {
	warn "$s not class";
    }
}
close CLASSES;

if (defined($ARGV[0])) {
    @wka_list = splice(@wka_list, 0, $ARGV[0]);
}

my ($H0, $IL0, $f, $nN) = Entropies(@wka_list);
printf("Loaded: classes=%d H0=%f IL0=%f f0=%f nN=%d\n", 
    (scalar @wka_list), $H0, $IL0, $f, $nN);

sub mk_zero_node($$) {
    my $n = {};
    $n->{left} = shift;
    $n->{right} = shift;
    $n->{exact} = 0;
    $n->{inner} = 0;
    $n->{wka} = [0, 0];
    $n->{dir} = 0;
    $n->{false} = 0;
    $n->{count} = 1;
    return $n;
}

sub node_name($) {
    my $n = shift;
    return $n->{left} . '*' . $n->{right};
}

sub mk_trie($$$) {
    my ($l, $r, $wlr) = @_;
    my $swka = wka_list_sum(@$wlr);
    my $n = mk_zero_node($l, $r);
    $n->{wka} = $swka;
    printf("Node [%s] : classes=%d W=%f K=%f\n", 
	node_name($n), scalar @$wlr,
	$$swka[0], $$swka[1]);
    # Terminal case 1: w=0
    if ($$swka[0]==0) {
	return $n;
    }
    # Terminal case 2: only word ''
    if ((scalar @$wlr)<=1) {
	my $aa = $$wlr[0];
	my $a = $$aa[1];
	if ($$aa[0] eq '') {
	    if ($$a[0]>$$a[1]) { $n->{exact} = 1; }
	    $n->{false} = min_wka($a);
	    return $n;
	}
    }
    # non-teminal case: inner node
    $n->{inner} = 1;

    # trying left
    my %tl = ('dir' => 0);
    LL:
    for my $aa (@$wlr) {
	my ($s, $a) = @$aa;
	if ($s eq '') {
	    if  ($$a[0]>$$a[1]) { $tl{exact} = 1; }
	    $tl{''} = [[$s, $a]]; # one word as list
	    next LL;
	}
	my $l = substr($s,0,1);
	substr($s,0,1) = '';
	$tl{$l} = [] unless defined $tl{$l};
	my $lwl = $tl{$l};
	push @$lwl, [$s, $a];
    }
    #print Dumper(\%tl);
    # calculating information gain: all multiplied by $nN
    my $ldHc = dl($$swka[0]+$$swka[1]);
    my $ldHck = dl($$swka[0])+dl($$swka[1]);
    my @aa_list = grep {ref; } (values %tl);
    my @check_list = ();
    for my $aalr (@aa_list) { @check_list = (@check_list, @$aalr); }
    my $check_swka = wka_list_sum(@check_list);
    unless (($$swka[0]==$$check_swka[0]) && ($$swka[1]==$$check_swka[1])) {
	print "FALSE ($$swka[0]==$$check_swka[0]) && ($$swka[1]==$$check_swka[1])!\n";
	return;
    }
    for my $aalr(@aa_list) {
	my $nwka = wka_list_sum(@$aalr);
	$ldHc -= dl($$nwka[0]+$$nwka[1]);
	$ldHck -= dl($$nwka[0])+dl($$nwka[1]);
	#print "nwka: $$nwka[0] $$nwka[1]\n";
    }
    printf("Left H.gain=%f I.gain=%g\n", $ldHc/$nN, ($ldHc-$ldHck)/$nN);
    # trying right
    my %tr = ('dir' => 1);
    LR:
    for my $aa (@$wlr) {
	my ($s, $a) = @$aa;
	if ($s eq '') {
	    if  ($$a[0]>$$a[1]) { $tr{exact} = 1; }
	    $tr{''} = [[$s, $a]]; # one word as list
	    next LR;
	}
	my $r = substr($s,-1,1);
	substr($s,-1,1) = '';
	$tr{$r} = [] unless defined $tr{$r};
	my $lwl = $tr{$r};
	push @$lwl, [$s, $a];
    }
    #print Dumper(\%tl);
    # calculating information gain: all multiplied by $nN
    my $rdHc = dl($$swka[0]+$$swka[1]);
    my $rdHck = dl($$swka[0])+dl($$swka[1]);
    my @aa_list = grep {ref; } (values %tr);
    my @check_list = ();
    for my $aalr (@aa_list) { @check_list = (@check_list, @$aalr); }
    my $check_swka = wka_list_sum(@check_list);
    unless (($$swka[0]==$$check_swka[0]) && ($$swka[1]==$$check_swka[1])) {
	print "FALSE ($$swka[0]==$$check_swka[0]) && ($$swka[1]==$$check_swka[1])!\n";
	return;
    }
    for my $aalr(@aa_list) {
	my $nwka = wka_list_sum(@$aalr);
	$rdHc -= dl($$nwka[0]+$$nwka[1]);
	$rdHck -= dl($$nwka[0])+dl($$nwka[1]);
	#print "nwka: $$nwka[0] $$nwka[1]\n";
    }
    printf("Right H.gain=%f I.gain=%g\n", $rdHc/$nN, ($rdHc-$rdHck)/$nN);

    # Choosing section with better I.gain/H.gain
    my $section;
    if (($rdHc-$rdHck)*$ldHc>($ldHc-$ldHck)*$rdHc) {%tl = (); $section = \%tr }
    	                                      else {%tr = (); $section = \%tl };
    #if ($rdHc<$ldHc)  {%tl = (); $section = \%tr }
    #	                          else  {%tr = (); $section = \%tl };

    # conserve_memory
    @_ = ();
    $wlr = undef;

    FIELD:
    while (my ($field, $value) = each %$section) {
	if (ref($value)) {
	    if ($field eq '') {
		my $aa = $$value[0];
		my $a = $$aa[1];
		$n->{false} += min_wka($a);
		next FIELD;
	    }
	    # $value is ref to wka list
	    my $newl = ($$section{dir}) ? $l : $l.$field;
	    my $newr = ($$section{dir}) ? $field.$r : $r;
	    my $n1 = mk_trie($newl,$newr,$value);
	    $n->{$field} = $n1;
	    $n->{false} += $n->{$field}->{false};
	    # optimization to conserve memory
	    if (!$n1->{inner} && !$n1->{wka}->[0] && !$n1->{false}) {
		print "  opt. deleting ", node_name($n1), "\n";
		delete $n->{$field};
	    }
	    if (ref($n->{$field})) {
		$n->{count} += $n->{$field}->{count};
	    }
	} else {
	    # copying from $section to $n
	    $n->{$field} = $value;
	}
    }

    return $n;
}

sub node_u32($) {
    my $n = shift;
    my $u = 0;
    $u |= 1<<31 if $n->{inner};
    $u |= 1<<30 if $n->{exact};
    $u |= 1<<29 if $n->{dir};
    for (my $i=0; $i<@AL; $i++) {
	my $child = $n->{$AL[$i]};
	if (defined($child)) {
	    $u |= 1<<$i if (ref($child) || $child>0);
	}
    }
    return $u;
}

sub walk_trie($$) {
    my ($n, $process) = @_;
    # $process will be called with args: node, path (const list ref)
    my @path = ();
    my $walker_p;
    my $walker = sub {
	my $n = shift;
	&$process($n, \@path);
	for my $i (@AL) {
	    if (ref($n->{$i})) {
		push @path, [$n, $i];
		&$$walker_p($n->{$i});
		pop @path;
	    }
	}
    };
    $walker_p = \$walker;
    &$walker($n);
}

$| = 1;
my $trie = mk_trie('','',\@wka_list);

print "trie: false=$trie->{false} count=$trie->{count}\n";

@wka_list = (); # conserve memory

my $zeroed;
my $min_falses;
my %bestrecs;
my @bestpaths;
my @bestnodes;
# deletes zero leaf node, and for inner node checks false increment if deleted
sub check_zero($$) {
    my ($n, $path) = @_;
    my $a = $n->{wka};
    #unless($n->{inner} || $n->{exact}) {
    unless (node_u32($n) & 0x5FFFFFFF) {
	print "zeroing ${\(node_name($n))} : ",
	    "$n->{inner} $n->{exact} $n->{dir} ",
	     "zeroed=$zeroed false=$n->{false} ",
	     "wka $n->{wka}->[0] $n->{wka}->[1]\n";

	#if ($$a[0] > 0) { return; }
	# no words here
	if (!@$path) {
	    print "ZERO root!\n";
	    return;
	}
	++$zeroed;
	my $plink = $$path[(scalar @$path)-1];
	my ($parent, $link) = @$plink;
	delete $parent->{$link};
	if ((node_u32($parent) & ((1<<29) - 1)) == 0) { # no siblings
	    $parent->{inner} = 0;
	}
	for my $pl1 (@$path) {
	    my ($parent, $link) = @$pl1;
	    $parent->{count} --;
	}
    }
    my $candidate = 0;
    my $dF = 0;
    my $dN = 0;
    #my $debug = (node_name($n) eq 'z*se');
    my $debug = 0;
    if ($debug) {
	print "DEBUG ${\(node_name($n))} : $n->{inner} $n->{exact} $n->{dir} ",
	    "zeroed=$zeroed false=$n->{false} ",
	    "wka $n->{wka}->[0] $n->{wka}->[1]\n";
    }
    if ($n->{inner} && ($zeroed == 0) && @$path) {
	LETTER:
	for my $letter (@AL) {
	    my $child = $n->{$letter};
	    defined($child) or next LETTER;
	    # current falses for this node is $n->{false}
	    # this node's own falses = $n->{false)-SUM($child->{false}
	    # if we make this a leafs then new falses will be own+SUM($child->min_wka)
	    # Thus, false delta will be SUM($child->min_wka)-SUM($child->{false})
	    $dF += min_wka($child->{wka}) - $child->{false};
	    # $dN ++;
	}
	$dN = $n->{count} - 1;
	$candidate = 1;
    }
    if (!$n->{inner} && ($zeroed == 0) && @$path) {
	$dF = $n->{wka}->[0] - $n->{false};
	$dN = 1;
	$candidate = 1;
	if ($debug) {
	    print "DEBUG candidate ${\(node_name($n))} : $dF $n\n";
	}
    }
    if ($candidate) {
        my $metric = $dF/($dN?$dN:0.01);
	if ($debug) {
	    print "    DEBUG $dF/$dN=$metric < $min_falses ? \n";
	}
	my @copy_path = @$path;
	if ($metric<$min_falses) {
	    $min_falses = $metric;
	    @bestpaths = (\@copy_path);
	    @bestnodes = ($n);
	    $bestrecs{node_name($n)} = $metric;
	} elsif ($metric==$min_falses) {
	    $bestrecs{node_name($n)} = $metric;
	    # check if some ancestor is already has been marked as best
	    my $anc = 0;
	    ANC:
	    for my $plink (@$path) {
		my ($parent, $link) = @$plink;
		my $parent_rec = $bestrecs{node_name($parent)};
		if (defined($parent_rec) && $parent_rec<=$min_falses) {
		    $anc = 1;
		    last ANC;
		}
	    }
	    if (!$anc) {
		push @bestpaths, \@copy_path;
		push @bestnodes, $n;
	    }
	}
    }
}

my $count_limit = 28000;
my $byte_limit = 65536-111;
my $verbose_export = 0;
#sub export_u32($$) {
#    my $n = shift;
#    my $path = shift;
#    my $u = node_u32($n);
#    push @Serial, $u;
#    if ($verbose_export) {
#	my $pp = " " x (scalar @$path);
#	my $name = node_name($n);
#	print "$pp/$name : $n->{inner} $n->{exact} $n->{dir}";
#	printf(" %08X\n", $u&((1<<29)-1));
#    }
#}

sub pack_test($) {
    my @u32 = ();
    my $n =  shift;
    my @q = ($n);
    while (@q) {
	$n = shift @q;
	push @u32, node_u32($n);
	if ($n->{inner}) {
	    for (my $i=0; $i<@AL; $i++) {
		if (ref($n->{$AL[$i]})) {
		    push @q, $n->{$AL[$i]};
		}
	    }
	}
    }
    my $len = scalar @u32;
    print "Packed length: $len , ";
    my $packed_trie = pack("N[$len]", @u32);
    open BTRIE, ">breadth.bin" or die "$!";
    print BTRIE $packed_trie;
    close BTRIE;
    my $cl = `cat data1.bin breadth.bin | gzip -9n | wc -c`;
    $cl += 0;
    print "compressed size: $cl\n";
    return $cl;
}

my $skip_zero = 0;
do { # trim zeroes, collapse node list
    unless ($skip_zero) {
	do {
	    $zeroed = 0;
	    $min_falses = min_wka($trie->{wka});
	    %bestrecs = ();
	    @bestpaths = ([]);
	    @bestnodes = ($trie);
	    walk_trie($trie, \&check_zero);
	    print "zeroed: $zeroed\n";
	} while ($zeroed>0);
    }
    for(my $i = 0; $i<@bestnodes; $i++) {
	my $bestnode = $bestnodes[$i];
	my $bestpath = $bestpaths[$i];
	die "bestpath not a ref!" unless ref($bestpath);
	# print "DEBUG bestpath ", Dumper($bestpath);
	print "COLLAPSE: " . node_name($bestnode) . " with dF=$min_falses\n";
	print "  \\ $bestnode->{inner} $bestnode->{exact} $bestnode->{dir} ... \n";
	# collapse node
	my $dF = 0;
	my $dC = 0;
	if($bestnode->{inner}) {
	    # Collapsing inner node
	    $bestnode->{inner} = 0;
	    for my $letter (@AL) {
		my $child = $bestnode->{$letter};
		if (defined($child)) {
		    my $a = $child->{wka};
		    my $minwka = min_wka($a);
		    $dF += $minwka - $child->{false};
		    $dC += $child->{count};
		    $bestnode->{$letter} = ($$a[0]>$$a[1]) ? 1 : 0;
		    print "  \\ $letter : $$a[0] $$a[1]",
			" ( $minwka $child->{false} ) : $bestnode->{$letter}\n";
		}
	    }
	    $bestnode->{false} += $dF;
	    $bestnode->{count} -= $dC;
	    print "  dF=$dF dC=$dC false=$bestnode->{false} ",
		"count=$bestnode->{count} ",
		"wka $bestnode->{wka}->[0] $bestnode->{wka}->[1]\n";
	} else {
	    # removing a leaf
	    $dF = $bestnode->{wka}->[0] - $bestnode->{false};
	    $dC = 1;
	    my $plink = $$bestpath[(scalar @$bestpath)-1];
	    my ($parent, $letter) = @$plink;
	    delete $parent->{$letter};
	    print "  \\ delete ", node_name($parent), " -> $letter\n";
	    if ((node_u32($parent) & ((1<<29) - 1)) == 0) { # no siblings
		$parent->{inner} = 0;
		print "  \\\\ collapsing empty parent: ", node_name($parent), "\n";
	    }
	}
	# Update falses in all path from the root
	for my $plink (@$bestpath) {
	    my ($n, $l) = @$plink;
	    $n->{false} += $dF;
	    $n->{count} -= $dC;
	    print "DEBUG updated " . node_name($n) . " with $dF , -$dC\n";
	}
    }
    $skip_zero = 0;
    do {
	$zeroed = 0;
	#$zeroed = 1; # HACK: +1
	$min_falses = min_wka($trie->{wka});
	%bestrecs = ();
	@bestpaths = ([]);
	@bestnodes = ($trie);
	walk_trie($trie, \&check_zero);
	#--$zeroed; # HACK: -1
	print "zeroed: $zeroed\n";
    } while ($zeroed>0);
    $skip_zero = 1;
    print "Count =  $trie->{count}\n";
    printf("False: %f %f\n", 
	$trie->{false}, $trie->{false}/sum_wka($trie->{wka}) );
} while ( ($trie->{count} > $count_limit) 
    || (pack_test($trie) > $byte_limit) );

