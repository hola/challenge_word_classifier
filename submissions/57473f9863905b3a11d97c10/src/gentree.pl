#!/usr/bin/perl

use strict;
use warnings;

my $N = shift 
    or die "Number of levels as a command-line argument is mandatory\n";

binmode (STDOUT);

my $h = {};

while (<>) {
    chomp;
    my $in = $_; 

    my @chars = split ('', substr ($in, 0, $N));

    my $x = $h;
    foreach my $c (@chars) {
        if (!exists $x->{$c}) {
            $x->{$c} = {};
        }
        $x = $x->{$c};
    }
}

sub c_pack {
    my $buf = "";
    foreach (@_) {
        $buf .= pack ('C', $_);
    }
    return $buf;
}

my @c_cnt2;
my $c_cnt2_skip = 0;
sub c_cnt2 (@) {
    push @c_cnt2, @_;
    my @out;
    while (@c_cnt2 > 0) {
        my $c = shift @c_cnt2;
        if ($c == 0) {
            $c_cnt2_skip++;
            next;
        }
        push @out, $c_cnt2_skip;
        $c_cnt2_skip = 0;
    }
    return @out;
}


my @out;
my @chld = ($h);
for my $l (1 .. $N) {
    my @nodes = @chld; 
    @chld = ();
    foreach my $h (@nodes) {
        my @word = ();
        for my $c ('a'..'z','Z') {
            if (exists $h->{$c}) {
                push @word, 1;
                push @chld, $h->{$c};
            } else {
                push @word, 0;
            }
        }
        push @out, @word;
    }
}

@out = c_cnt2 (@out);
print c_pack (@out);
