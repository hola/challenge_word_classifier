<?php

$raw_words = array_filter(array_map('strtolower', array_map('trim', file(__DIR__ . '/words_orig.txt'))));
//$raw_words = array_filter(array_map('strtolower', array_map('trim', file(__DIR__ . '/words_orig_false.txt'))));
sort($raw_words);
$words = array_unique($raw_words);

include __DIR__ . '/hash.php';

/*$hashes = [];
foreach ($words as $i => $word) {
    $hash = wordhash($word);
    $hashes[$hash] = array_key_exists($hash, $hashes) ? $hashes[$hash]+1 : 1;
    if ($i%1000 == 0) {
        echo "$i $word $hash\n";
    }
}
arsort($hashes);*/
//print_r(array_slice($hashes, 0, 100));
//echo count(array_keys($hashes)); exit;// 255226
//soundex

/*$fwords = [];
foreach ($words as $word) {
    $l = strlen($word);
    if ($l < 2 || $l > 16) {
        continue; // пропускаем односимвольные слова и слова длиннее 16 букв
    }
    $fwords[] = $word;
}
file_put_contents(__DIR__ . '/words_filtered.txt', implode("\n", $fwords));
exit;*/

$hashes_stat = [];
foreach ($words as $word) {
    $l = strlen($word);
    if ($l < 2) {
        continue; // пропускаем сразу то что ранее решил отсекать
    }
    $hashes_stat[] = wordhash($word);
}
$hs = array_count_values($hashes_stat);
arsort($hs);
file_put_contents(__DIR__ . '/hashes_true_stat.php', "<?php\nreturn ".var_export($hs, true).';');
exit;


//$hashes = explode("\n", file_get_contents(__DIR__ . '/metaphones.txt'));
//$hashes = require __DIR__ . '/hashes_true_false_data.php';

//$hashes_stat = [];

/*function test($word) {
    global $hashes;
    $l = strlen($word);
    if ($l == 1 && $word != "'") {
        return true;
    }
    if ($l > 16 || $l <= 1) {
        return false;
    }
    if ((strpos($word, "'") !== false) && (strpos($word, "'s") === false || $word{$l-2} != "'")) {
        return false;
    }
    $hash = metahash($word);
    if (array_key_exists($hash, $hashes)) {
        return ($hashes[$hash] > 0); // если больше нуля, то true (слово есть в солваре), иначе false (слова нет в словаре)
    }
    return false; // тут на основе статистики длины слов выдать генератором вероятностным true или false
}

$success = 0;
$tests = 0;
$negatives = 0;
$positives = 0;
//$test_case = require __DIR__ . '/testdata_short.php';
//$test_case = require __DIR__ . '/testdata.php';
$test_case = require __DIR__ . '/testdata_big.php';
//$bad_words = [];
$i = 0;
//foreach ($test_case as $word => $answer) {
//    $i++;
foreach ($words as $i => $word) {
    $l = strlen($word);
    $answer = true;
    $res = test($word);
//    echo $word . ' ' . (int)$res . ' ' . (int)$answer. "\n";
    $tests++;
    $success += (int)($res == $answer);
    $negatives += ($res < $answer) ? 1 : 0;
    $positives += ($res > $answer) ? 1 : 0;
//    if ($res > $answer) { // если хеш есть но слово не из словаря
        //$bad_words[] = $word;
//        file_put_contents(__DIR__ . '/bad_words.txt', $word."\n", FILE_APPEND); // ошибки когда слова нет в словаре, а функция говорит что есть
//    }
    if ($i%100 == 0) {
        echo "$i\n";
    }
}

echo 'success: ' . (round($success * 10000 / $tests)/100) . "%\n";
echo "negatives: " . (round($negatives * 10000 / ($tests-$success))/100) . "%\n";
echo "positives: " . (round($positives * 10000 / ($tests-$success))/100) . "%\n";

//file_put_contents(__DIR__ . '/bad_words.txt', implode("\n", $bad_words));

arsort($hashes_stat);
$hs = array_count_values($hashes_stat);
arsort($hs);
file_put_contents(__DIR__ . '/hashes_stat.php', "<?php\nreturn ".var_export($hs, true).';');
*/
