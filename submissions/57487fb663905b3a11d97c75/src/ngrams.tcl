#! /usr/bin/env tclsh
package require fileutil

proc get-ngrams {n word} {
    set ngrams {}
    for {set i 0} {$i < [string length $word] - $n + 1} {incr i} {
        lappend ngrams [string range $word $i [expr {$i + $n - 1}]]
    }
    return $ngrams
}

# https://tcl.wiki/2546
proc product args {
    set xs {{}}
    foreach ys $args {
        set result {}
        foreach x $xs {
            foreach y $ys {
                lappend result [list {*}$x $y]
            }
        }
        set xs $result
    }
    return $xs
}

proc main n {
    set words [split [::fileutil::cat words.txt] \n]
    
    set freq {}
    set alphabet {a b c d e f g h i j k l m n o p q r s t u v w x y z '}
    foreach keys [product {*}[lrepeat $n $alphabet]] {
        dict set freq [join $keys {}] 0
    }

    foreach word $words {
        foreach ngram [get-ngrams $n $word] {
            dict incr freq $ngram
        }
    }

    set total 0
    dict for {k v} $freq { incr total $v }

    set cumulative 0
    puts "let _${n}grams = \["
    dict for {k v} [lsort -integer -dec -stride 2 -index 1 $freq] {
        incr cumulative $v
        set vPercentage [expr {100.0 * $v / $total}]
        set cumulativePercentage [expr {100.0 * $cumulative / $total}]
        puts "    \"$k\", // $vPercentage ($cumulativePercentage)"
    }
    puts {];}
}

main [lindex $argv 0]
