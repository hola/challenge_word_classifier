<?php

$hashes = require __DIR__ . '/hashes_true_false_data.php';

$hashes_true = [];
foreach ($hashes as $hash => $count) {
    if ($count < 0) {
        break;
    }
    $hashes_true[$hash] = 1;
}
ksort($hashes_true);
//file_put_contents(__DIR__ . '/no_compressed_hashes.txt', implode("\n", array_keys($hashes_true)));exit;

$all_hashes = [];
$p = pow(2, 20);
for ($i = 0; $i < $p; $i++) {
    $all_hashes[$i] = array_key_exists($i, $hashes_true) ? 1 : 0;
}

//print_r(array_chunk($all_hashes, 8)[0]);exit;

$chars = implode('', array_map(function($v){return chr(bindec(implode('',array_reverse($v))));}, array_chunk($all_hashes, 8)));
//echo decbin(ord($chars{0}))."\n";exit;

$lefts = file_get_contents(__DIR__ . '/dict_lefts.txt');
$rights = file_get_contents(__DIR__ . '/dict_rights.txt');


$three = require __DIR__ . '/three_chars_stat.php';
ksort($three);
$three = array_values($three);
// (26*26*26)/8 = 2197
$hashes = [];
for ($i = 0; $i < 17576/* 26*26*26 */; $i++) {
    $hashes[$i] = ($three[$i] < 1) ? 1 : 0;
}
$three_chars = implode('', array_map(function($v){return chr(bindec(implode('',array_reverse($v))));}, array_chunk($hashes, 8)));
//$three_chars = '';

file_put_contents(__DIR__ . '/compressed_output.txt', $lefts."\n".$rights."\n".$three_chars.$chars);

