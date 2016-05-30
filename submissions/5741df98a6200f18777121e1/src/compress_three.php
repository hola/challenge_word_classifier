<?php

$three = require __DIR__ . '/three_chars_stat.php';
ksort($three);
$three = array_values($three);

// ...

// (26*26*26)/8 = 2197
$hashes = [];
for ($i = 0; $i < 17576/* 26*26*26 */; $i++) {
    $hashes[$i] = ($three[$i] < 1) ? 1 : 0;
}

$chars = implode('', array_map(function($v){return chr(bindec(implode('',array_reverse($v))));}, array_chunk($hashes, 8)));

file_put_contents(__DIR__.'/compressed_three.txt', $chars);
