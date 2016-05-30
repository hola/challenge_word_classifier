<?php

//$raw_words = array_filter(array_map('strtolower', array_map('trim', file(__DIR__ . '/words.txt'))));
//sort($raw_words);
//$words = array_unique($raw_words);

include __DIR__ . '/hash.php';

/*$hashes = [];
foreach ($words as $i => $word) {
    $hash = metahash($word);
    $hashes[$hash] = array_key_exists($hash, $hashes) ? $hashes[$hash]+1 : 1;
    //if ($i%1000 == 0) {
    //    echo "$i $word $hash\n";
    //}
}*/
//arsort($hashes);
//print_r(array_slice($hashes, 0, 100));
//echo count(array_keys($hashes)); exit;// 255226
//soundex

//$hashes = explode("\n", file_get_contents(__DIR__ . '/metaphones_filtered.txt'));
//$hashes = require __DIR__ . '/hashes_true_false_data.php'; // пока что не запакованные использую чтобы хотя бы порядок ошибки проверить

$compressed = file_get_contents(__DIR__ . '/compressed_output.txt');

$lefts = array_slice(explode("\n", $compressed), 0, 128);
//echo implode("\n",$lefts)."\n";
$rights = array_slice(explode("\n", $compressed), 128, 128);
//echo implode("\n",$rights)."\n";

$chars = implode("\n",array_slice(explode("\n", $compressed), 256));
//echo ord($chars{0})."\n";
//echo strlen($chars)."\n";
//echo strlen($compressed)."\n";exit;

//echo wordhash('gownmen');exit;

$hashes = [];
$p = pow(2, 20); // кол-во всех возможных значений 20 битного хеша
for ($hash = 0; $hash < $p; $hash++) {
    $i = $hash >> 3; // целочисленное деление на 8, т.е. получаем номер символа в котором хранится бит для текущего хеша
    $j = $hash % 8; // остаток от деления на 8, т.е. получаем номер бита, который соответствует текущему хешу (будем использовать как маску для получения значения бита)
    //echo $i.' '.$j."\n";
    //echo $i.' '.ord($chars{$i}).' '.$j.' '.(ord($chars{$i}) & (1 << $j))."\n";
    if ((ord($chars{$i}) & (1 << $j)) > 0) {
        // console.log(i+' '+String(chars[i]).charCodeAt(0)+' '+j+' '+(String(chars[i]).charCodeAt(0) & (1 < j)));
        //echo $i.' '.ord($chars{$i}).' '.$j.' '.(ord($chars{$i}) & (1 << $j))."\n";exit;
        $hashes[] = $hash;
    }
}

$compressed_three = file_get_contents(__DIR__ . '/compressed_three.txt');
$three = [];
for ($hash = 0; $hash < 17576/* 26*26*26 */; $hash++) {

    $i = $hash >> 3;
    $j = $hash % 8;

    $c3 = chr(97+$hash % 26);
    $c2 = chr(97+floor($hash/26) % 26);
    $c1 = chr(97+floor($hash/676));

    $three[$c1.$c2.$c3] = (int)((ord($compressed_three{$i}) & (1 << $j)) > 0);
}

//print_r(array_slice($three, 0, 50));exit;
//echo count($hashes);exit;

function test($word) {
    global $hashes, $three;
    $l = strlen($word);
    if ($l == 1 && $word != "'") {
        return true;
    }
    if ($l > 17 || $l <= 1) {
        return false;
    }
    if ((strpos($word, "'") !== false) && (strpos($word, "'s") === false || $word{$l-2} != "'")) {
        return false;
    }
    if ($l >= 3) {
        for ($i = 0; $i <= $l-3; $i++) {
            $key = $word{$i}.$word{$i+1}.$word{$i+2};
            if (strpos($key, "'") !== false) {
                continue;
            }
            if ($three[$key]) {
                //echo "$key = false !\n";
                return false; // если в слове встречается комбинация из 3 символов, которая помечена как не существующая в словаре, то сразу возвращаем false
            }
        }
    }
    $hash = wordhash($word);
    if (in_array($hash, $hashes)) {
        return true; // если больше нуля, то true (слово есть в солваре), иначе false (слова нет в словаре)
    }
    return false; // тут на основе статистики длины слов выдать генератором вероятностным true или false
}

//echo wordhash("aba");exit;
//var_dump(test("aba"));exit;
//var_dump(test("aaj"));exit;
/*var_dump(test('a'));
var_dump(test('zzz'));
var_dump(test('imeritian'));
var_dump(test("fetta's"));
var_dump(test("fractivity's"));
var_dump(test("gownmen"));
var_dump(test("aba"));
var_dump(test("abats"));
var_dump(test("oqr"));
var_dump(test("aaj"));
var_dump(test("abaddon"));
exit;*/


$success = 0;
$tests = 0;
$negatives = 0;
$positives = 0;
//$test_case = require __DIR__ . '/testdata_short.php';
//$test_case = require __DIR__ . '/testdata.php';
$test_case = require __DIR__ . '/testdata_big.php';
foreach ($test_case as $word => $answer) {
    $res = test($word);
    //echo $word . ' ' . (int)$res . ' ' . (int)$answer. "\n";
    $tests++;
    $success += (int)($res == $answer);
    $negatives += ($res < $answer) ? 1 : 0;
    $positives += ($res > $answer) ? 1 : 0;
}

// TODO подумать как сделать чтобы не было переполнений и отображать не до сотых долей, а до тысячных и более... точность повысить в общем
echo 'success: ' . (($success * 10000 / $tests)/100) . "%\n";
echo "negatives: " . (($negatives * 10000 / ($tests-$success))/100) . "%\n";
echo "positives: " . (($positives * 10000 / ($tests-$success))/100) . "%\n";

