<?php

$raw_words = array_filter(array_map('strtolower', array_map('trim', file(__DIR__ . '/words_clear_true.txt'))));
sort($raw_words);
$words_true = array_unique($raw_words);

$raw_words = array_filter(array_map('strtolower', array_map('trim', file(__DIR__ . '/words_clear_false.txt'))));
sort($raw_words);
$words_false = array_unique($raw_words);

//$test_case = require __DIR__ . '/testdata_big.php';
//$test_case = array_merge($test_case, array_combine($words_true, array_fill(0, count($words_true), true)), array_combine($words_false, array_fill(0, count($words_false), false)));

$test_case = array_merge(array_combine($words_true, array_fill(0, count($words_true), true)), array_combine($words_false, array_fill(0, count($words_false), false)));

//$test_length = [];
$first = [];
$cfirst = [];
$c = 0;
foreach ($test_case as $word => $answer) {
    $l = strlen($word);
    //if ($l < 2) {
    //    continue;
    //}
    $c++;

    // 1. при $i == 12 преломный момент, всё что больше 12 символов, ставим 0
/*    for ($i = 1; $i < 60; $i++) {
        if (($l > $i) == $answer) {
            $test_length[$i] = array_key_exists($i, $test_length) ? $test_length[$i]+1 : 1;
        }
    }*/

    // 2. на какие буквы больше начинается слов с $answer = true
    //$key = $word{0};
    //$key = $l;
    //$key = $word{1}; // второй символ
    //$key = $word{$l-1}; // последний символ
    //$key = $word{$l-2}; // предпоследний символ
    //$key = $word{(int)floor($l/2)}; // средний символ
    //$key = (int)round(10*($l-strlen(str_replace(str_split('aeiou'), '', $word)))/$l); // отношение кол-ва гласных букв к длине слова
    //$key = (int)round(10*max(array_map('strlen', explode(' ', str_replace(str_split('aeiou'), ' ', $word))))/$l); // кол-во подряд идущих согласных относительно длины слова в процентах

    // вместо среднего символа или подряд идущих согласных, первый и последний символы тоже можно заменить на вероятность над действием над всеми символами
    $key = array_sum(array_map(function($v){return ($v == "'") ? 28 : (ord($v)-96);}, str_split($word)));

    $first[$key] = array_key_exists($key, $first) ? $first[$key]+(int)$answer : (int)$answer;
    $cfirst[$key] = array_key_exists($key, $cfirst) ? $cfirst[$key]+1 : 1;
}
/*$test_length = array_map(function($v)use($c){return $v*100/$c;}, $test_length);
ksort($test_length);
print_r($test_length);*/

foreach ($first as $char => $f) {
    $first[$char] /= $cfirst[$char]/100;
}
//ksort($first);
arsort($first);
//print_r($first);
$s = array_sum($first);
$s1 = 0;
$s2 = $s;
foreach ($first as $char => $v) {
    $s1 += $v;
    echo "$char ".round($s1).' '.round($s2)."\n";
    if ($s1 > $s2) {
        break;
    }
    $s2 -= $v;
}
