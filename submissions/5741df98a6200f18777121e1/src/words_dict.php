<?php

$raw_words = array_filter(array_map('strtolower', array_map('trim', file(__DIR__ . '/words_orig.txt'))));
sort($raw_words);
$words = array_unique($raw_words);

$dict = array_filter(array_map('strtolower', array_map('trim', file(__DIR__ . '/words_dict.txt'))));

$f = __DIR__ . '/words.txt';

$lefts = [];
$rights = [];
foreach ($dict as $i => $dict_word) {
    if (strlen($dict_word) < 3) {
        continue;
    }
    $found_words = array_map(function($w)use($dict_word) {
        //return explode($dict_word, $w);
        $pos = strpos($w, $dict_word);
        $left = ($pos > 0) ? substr($w, 0, $pos) : '';
        $rpos = $pos+strlen($dict_word);
        $right = ($rpos < strlen($w)) ? substr($w, $rpos) : '';
        return [$left, $right];
    }, explode("\n", `cat $f | grep $dict_word`));
    //print_r($found_words)."\n";exit;
    foreach ($found_words as $found_word) {
        // FIXME более качественно проверять на начало и концовку слов и распределять !!!
        $lefts[$found_word[0]] = array_key_exists($found_word[0], $lefts) ? $lefts[$found_word[0]]+1 : 1;
        $rights[$found_word[1]] = array_key_exists($found_word[1], $rights) ? $rights[$found_word[1]]+1 : 1;
    }

    if ($i%10 == 0) {
        echo "$i\n";
    }
    //exit;
    // ...
}
arsort($lefts);
arsort($rights);

file_put_contents(__DIR__ . '/dict_lefts.php', "<?php\nreturn ".var_export($lefts, true).';');
file_put_contents(__DIR__ . '/dict_rights.php', "<?php\nreturn ".var_export($rights, true).';');
// ...
//...

