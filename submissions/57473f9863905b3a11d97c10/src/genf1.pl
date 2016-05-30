#!/usr/bin/perl

use strict;
use warnings;

sub f ($) {
    local $_ = $_[0];
    my @chars = split('', $_);
    my ($vow, $con, $m, $mcon, $mvow) = (0, 0, 0, 0, 0);
    foreach my $c (@chars) {
        if ($c =~ /[aeiouy]/) {
            $vow += 1;
            $mvow += ord ($c) - 97;
        } elsif ($c =~ /[bcdfghjklmnpqrstvwxyz]/) {
            $con += 1;
            $mcon += ord ($c) - 97;
        }
    }
    $m = $mcon + $mvow;
    $m    /= ($con+$vow)||1;
    $mcon /= $con||1;
    $mvow /= $vow||1;

    my $x = 0;
    my $y = 25;
    $x = $x * $y + $vow;
    $x = $x * $y + $con;
#     $x = $x * $y + (($mcon * 5) | 0);
    $x = $x * $y + (($mvow * 5) | 0);
#     $x = $x * $y + (($mvow * 4) | 0) + (($mcon * 1) | 0);
    return $x;
}

my $h = {};
my $count = 0;
while (<>) {
    chomp;
    s/Z/'/g;

    my $x = f ($_);

    $h->{$x} += 1;
    $count += 1;
}

my @c_indiff;
my $c_indiff_p = 0;
sub c_indiff (@) {
    my @out;
    while (@_ > 0) {
        push @out, $_[0] - $c_indiff_p;
        $c_indiff_p = $_[0];
        shift @_;
    }
    return @out;
}

{
    binmode (STDOUT);
    my @out;
    my $f = $count;
    my $i = scalar keys %$h;
    foreach my $k (sort { $h->{$a} <=> $h->{$b} } keys %$h) {
        $f -= $h->{$k}; 
        $i -= 1;
        if ($f/$count < 0.971) {
            push @out, $k;
        }
    }
    @out = sort { $a <=> $b } @out;
    @out = c_indiff @out;
    unshift @out, scalar (@out);
    foreach (@out) {
        print pack ("CC", $_ >> 8, $_ & 0xff);
    }
}


