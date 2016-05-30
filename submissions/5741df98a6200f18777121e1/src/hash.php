<?php

$lefts = explode("\n", file_get_contents(__DIR__ . '/dict_lefts.txt'));
$rights = explode("\n", file_get_contents(__DIR__ . '/dict_rights.txt'));

function wordhash($word) {
    global $lefts, $rights;
    $lefts[128] = '';
    $rights[128] = '';

    $l = strlen($word);
    // $l >= 2

    $left = 128;
    $right = 128;
    $clear_word = $word;
    foreach ($lefts as $i => $pattern) {
        if (strlen($pattern) && (strpos($word, $pattern) === 0)) {
            // начинается с шаблона
            $left = $i;
            $clear_word = substr($clear_word, strlen($pattern));
            break;
        }
    }
    foreach ($rights as $i => $pattern) {
        if (strlen($pattern) && (strpos(strrev($word), strrev($pattern)) === 0)) {
            $right = $i;
            $clear_word = substr($clear_word, 0, -strlen($pattern));
            break;
        }
    }
    //print_r($clear_word);
    //$clear_word = strtolower(metaphone($clear_word));
    // 7+7 bit (можно попробовать наложить их друг на друга по логическому или, типа как блум фильтр)
    $hash = $left;
    $hash |= $right << 7; // 7+7 можно ужать, скомбинировав так, чтобы меньше бит использовать, но добавится % к ошибке

    //$ll = $l - (strlen($lefts[$left]) + strlen($rights[$right]));
    $ll = strlen($clear_word);
    $hash |= (int)in_array($ll,[5,6,7,4]) << 14;

    if ($ll) {
        $key = (int)round(10*($ll-strlen(str_replace(str_split('aeiou'), '', $clear_word)))/$ll); // отношение кол-ва гласных букв к длине слова
        $bin = (int)(in_array($key,[6,7,8])); // если отношение в процентах такое как в списке значений, то ставим 1 (60-80%)
        $hash |= $bin << 15;

        $key = (int)round(10*max(array_map('strlen', explode(' ', str_replace(str_split('aeiou'), ' ', $clear_word))))/$ll); // кол-во подряд идущих согласных относительно длины слова в процентах
        //echo $clear_word.' '.max(array_map('strlen', explode(' ', str_replace(str_split('aeiou'), ' ', $clear_word)))) . ' ' . $ll .' '. $key."\n";exit;
        $bin = (int)(in_array($key,[2,3,4,5])); // если отношение как в списке то ставим 1
        $hash |= $bin << 16;

        $bin = (int)(strpos('eaiuohlyrn', $clear_word{0}) !== false); // если слово начинается с определённых букв, то ставим 1, остальные буквы встречаются реже
        $hash |= $bin << 17;

        //echo $clear_word{$ll-1}."\n";

        $bin = (int)(strpos('loidaesun', $clear_word{$ll-1}) !== false); // если последний символ такой, то 1
        $hash |= $bin << 18;

        $bin = (int)(strpos('ohrsaelntp', $clear_word{(int)floor($ll/2)}) !== false); // если средний символ такой, то 1
        $hash |= $bin << 19;
    }

    //return sprintf("%020s", decbin($hash));
    return $hash;
}

/*$test_case = require __DIR__ . '/testdata_short.php';

foreach ($test_case as $word => $answer) {
    echo str_pad($word, 60, ' ', STR_PAD_LEFT).' '.wordhash($word).' '.(int)$answer."\n";
}*/
// ...
