<?php

$hs_true = require __DIR__ . '/hashes_true_stat.php';
$hs_false = require __DIR__ . '/hashes_false_stat.php';

$hs_true_sum = array_sum($hs_true)/1000;
$hs_false_sum = array_sum($hs_false)/1000;

$hs_all = array_values(array_unique(array_merge(array_keys($hs_true), array_keys($hs_false))));

$hs_diff = [];
foreach ($hs_all as $i => $hs) {
    $v_true = array_key_exists($hs, $hs_true) ? (1000*$hs_true[$hs])/$hs_true_sum : 0;
    $v_false = array_key_exists($hs, $hs_false) ? (1000*$hs_false[$hs])/$hs_false_sum : 0;

    $diff = $v_true-$v_false; // получаем то что если $diff > 0 то хеш из тех что даёт true, если $diff < 0, то отнести этот хеш в группу для false
    $hs_diff[$hs] = $diff;

    if ($i%1000 == 0) {
        echo "$i\n";
    }
}
arsort($hs_diff);
file_put_contents(__DIR__ . '/hashes_true_false_data.php', "<?php\nreturn ".var_export($hs_diff,true).';');
// ...
