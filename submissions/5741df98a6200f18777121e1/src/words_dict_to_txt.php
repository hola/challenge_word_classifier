<?php

$raw_words = array_filter(array_map('strtolower', array_map('trim', file(__DIR__ . '/words_orig.txt'))));
sort($raw_words);
$words = array_unique($raw_words);

$lefts = require __DIR__ . '/dict_lefts.php';
$rights = require __DIR__ . '/dict_rights.php';

/*$half_lefts = [];
$sum_lefts = array_sum($lefts)/2;
$sum = 0;
foreach ($lefts as $left => $c) {
    $sum += $c;
    if ($sum > $sum_lefts) {
        break;
    }
    $half_lefts[] = $left;
}
print_r($half_lefts);exit;

$half_rights = [];
$sum_rights = array_sum($rights)/2;
$sum = 0;
foreach ($rights as $right => $c) {
    $sum += $c;
    if ($sum > $sum_rights) {
        break;
    }
    $half_rights[] = $right;
}
print_r($half_rights);exit;*/

// TODO можно использовать 102 элемента для $lefts и 92 элемента для $rights, тогда 26 и 36 значений можно будет заюзать под ещё какие-нибудь фичи выделенные из слов

$lefts = array_keys(array_slice($lefts, 1, 128)); // один бит зарезервирован под то, что если что-то есть слева, но неизвестно что
$rights = array_keys(array_slice($rights, 1, 128)); // один бит зарезервирован под то, что если что-то есть справа, но неизвестно что

function length_sort($a, $b) {
    return strlen($b)-strlen($a);
}
usort($lefts, 'length_sort');
usort($rights, 'length_sort');
$lefts = array_values($lefts);
$rights = array_values($rights);

print_r($lefts); file_put_contents(__DIR__.'/dict_lefts.txt', implode("\n", $lefts));
print_r($rights); file_put_contents(__DIR__.'/dict_rights.txt', implode("\n", $rights));
