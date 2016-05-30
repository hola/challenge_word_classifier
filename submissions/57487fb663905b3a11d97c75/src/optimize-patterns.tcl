#! /usr/bin/env tclsh
package require fileutil

proc modify-line {filename line lambda} {
    set lines [split [::fileutil::cat $filename] \n]
    lset lines $line [apply $lambda [lindex $lines $line]]
    ::fileutil::writeFile $filename [join $lines \n]
}

proc comment-out-line {filename line} {
    modify-line $filename $line [list line {
        regsub {^   } $line {// }
    }]
}

proc uncomment-line {filename line} {
    modify-line $filename $line [list line {
        regsub {^// } $line {   }
    }]
}

proc append-comment {filename line comment} {
    modify-line $filename $line [list [list line [list comment $comment]] {
        lindex "$line // $comment"
    }]
}

# Returns the score.
proc test-classifier {} {
    lindex [exec make test] end
}

proc log message {
    puts "[clock format [clock seconds] -format {%Y-%m-%d %H:%M:%S}] $message"
}

proc optimize-lines {baseScore from to} {
    log "Commenting out lines $from ... $to (at $baseScore)"
    set filename classifier_bloom.js

    for {set i $from} {$i <= $to} {incr i} {
        comment-out-line $filename $i
    }

    set newScore [test-classifier]
    log "... The new score is $newScore"

    append-comment $filename $from \
            "[expr {$from + 1}] ... [expr {$to + 1}] [expr {$baseScore - $newScore}]"

    if {$baseScore - $newScore < 0.0001} {
        return $newScore
    } else {
        log "... Uncommenting lines $from ... $to"
        for {set i $from} {$i <= $to} {incr i} {
            uncomment-line $filename $i
        }
        return $baseScore
    }
}

proc main {} {
    set score [test-classifier]
    log "Starting score: $score"

    set start 288
    set end 2682
    set block 200

    for {set i $start} {$i <= $end} {incr i $block} {
        set score [optimize-lines $score $i [expr {min($i + $block - 1, $end)}]]
    }
}

main
