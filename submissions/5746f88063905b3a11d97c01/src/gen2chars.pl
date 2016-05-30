use strict;
use JSON;
use Data::Dumper;



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

my @B;

for (my $o1 = 0; $o1<26; $o1++) {
    for (my $o2 = 0; $o2<26; $o2++) {
	my $bo = $o1*26+$o2;
	my $w = chr(ord('a')+$o1) . chr(ord('a')+$o2);
	my $b = defined($W{$w}) ? 1 : 0;
	my $r = $bo%8;
	my $o = ($bo-$r)/8;
	$B[$o] |= ($b << $r);
    }
}

my $buf = pack("C[85]", @B);

open BUF, ">buf2.bin";
print BUF $buf;
close BUF;
