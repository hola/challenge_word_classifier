<?php

$compressed = file_get_contents(__DIR__ . '/compressed_output.txt');

$lefts = array_slice(explode("\n", $compressed), 0, 128);
//echo implode("\n",$lefts)."\n";
$rights = array_slice(explode("\n", $compressed), 128, 128);
//echo implode("\n",$rights)."\n";

$chars = implode("\n",array_slice(explode("\n", $compressed), 256));

$hashes = [];
$p = pow(2, 20); // кол-во всех возможных значений 20 битного хеша
for ($hash = 0; $hash < $p; $hash++) {
    $i = $hash >> 3; // целочисленное деление на 8, т.е. получаем номер символа в котором хранится бит для текущего хеша
    $j = $hash % 8; // остаток от деления на 8, т.е. получаем номер бита, который соответствует текущему хешу (будем использовать как маску для получения значения бита)
    if ((ord($chars{$i}) & (1 << $j)) > 0) {
        $hashes[] = $hash;
    }
}
//file_put_contents(__DIR__ . '/decompressed_hashes.txt', implode("\n", $hashes));

