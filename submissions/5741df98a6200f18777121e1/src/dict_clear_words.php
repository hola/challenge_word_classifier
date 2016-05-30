<?php

$raw_words = array_filter(array_map('strtolower', array_map('trim', file(__DIR__ . '/words_orig.txt'))));
sort($raw_words);
$words_true = array_unique($raw_words);

$raw_words = array_filter(array_map('strtolower', array_map('trim', file(__DIR__ . '/words_orig_false.txt'))));
sort($raw_words);
$words_false = array_unique($raw_words);

$lefts = explode("\n", file_get_contents(__DIR__ . '/dict_lefts.txt'));
$rights = explode("\n", file_get_contents(__DIR__ . '/dict_rights.txt'));

$lefts_patterns = array_map(function($v){return "/^$v/";}, $lefts);
$rights_patterns = array_map(function($v){return "/$v\$/";}, $rights);
$patterns = array_merge($lefts_patterns, $rights_patterns);

$words_clear_true = array_values(array_unique(array_map(function($w)use($patterns){return preg_replace($patterns,'',$w);}, $words_true)));
$words_clear_false = array_values(array_unique(array_map(function($w)use($patterns){return preg_replace($patterns,'',$w);}, $words_false)));

sort($words_clear_true);
sort($words_clear_false);

file_put_contents(__DIR__ . '/words_clear_true.txt', implode("\n", $words_clear_true));
file_put_contents(__DIR__ . '/words_clear_false.txt', implode("\n", $words_clear_false));
// ...
