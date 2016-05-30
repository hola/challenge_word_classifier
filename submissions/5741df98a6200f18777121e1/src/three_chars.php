<?php

$raw_words = array_filter(array_map('strtolower', array_map('trim', file(__DIR__ . '/words.txt'))));
sort($raw_words);
$words = array_unique($raw_words);

$chars = str_split("abcdefghijklmnopqrstuvwxyz");

$three = [];
foreach ($chars as $c1) {
    foreach ($chars as $c2) {
        foreach ($chars as $c3) {
            $pattern = $c1.$c2.$c3;
            //$three[$pattern] = ..;
            echo $pattern."... ";
            $sum = array_sum(array_map(function($w)use($pattern){return (int)(strpos($w, $pattern) !== false);}, $words));
            $three[$pattern] = $sum;
            echo $sum."\n";
        }
    }
}
asort($three);
file_put_contents(__DIR__ . '/three_chars_stat.php', "<?php\nreturn ".var_export($three,true).';');
// ...
