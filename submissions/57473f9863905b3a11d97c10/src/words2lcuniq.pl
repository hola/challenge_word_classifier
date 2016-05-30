#!/usr/bin/perl

use strict;
use warnings;

my $h = {};

while (<>) {
    chomp;
    my $in = lc $_; 
    $in =~ tr/'/Z/;  # to make sure command-line sort works properly

    $h->{$in} += 1;
}

foreach my $k (sort keys %$h) {
    print "$k\n";
}

