#!/usr/bin/perl

use strict;
use warnings;

my $N = shift 
    or die "Number of chars as a command-line argument is mandatory\n";

my $h = {};

while (<>) {
    chomp;
    my $in = $_; 

    my $k = substr ($in, 0, $N);
    next if length ($k) != $N;
    $h->{$k} += 1;
}

foreach my $k (sort { $h->{$b} <=> $h->{$a} } keys %$h) {
    print "$k\n";
}

