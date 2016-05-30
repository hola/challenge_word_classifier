<?php


$prefixList = array();
$suffixList = array();

$file = fopen("words.txt", "r");
while(!feof($file)){
    $line = strtolower(trim(fgets($file))); 
    $wordPrefixSize = strlen($line);
    $line = preg_replace('#[aeiou\s]+#i', '', $line);
    $prefix = substr($line, 0, 2);

    $suffix = substr($line, -2, 2);
    if (!$suffixList[$suffix]) {
      $suffixList[$suffix] = array('count' => 1);
    } else {
      $suffixList[$suffix]['count']++;
    }
    if (!$prefixList[$prefix]) {
      $prefixList[$prefix] = array(
        'count' => 1,
        'suffixes' => array(),
        'max_len' => $wordPrefixSize
      );
    } else {
      $prefixList[$prefix]['count']++;
      if ($wordPrefixSize > $prefixList[$prefix]['max_len']) {
        $prefixList[$prefix]['max_len'] = $wordPrefixSize;
      }
    }
    if (!$prefixList[$prefix][$suffix]) {
      $prefixList[$prefix]['suffixes'][$suffix] = array();
    }
}

fclose($file);



uasort($suffixList, function ($a, $b) {
  return $b['count'] - $a['count'];
});

echo sizeof($suffixList);
$suffixList = array_slice($suffixList, 0, 180);


uasort($prefixList, function ($a, $b) {
  return $b['count'] - $a['count'];
});


$prefixList = array_slice($prefixList, 0, 220);

foreach ($prefixList as $k => $item) {
  $suf_list = $item['suffixes'];
  $suf_result = array();
  foreach ( $suf_list as $suffix => $data) {
    if (isset($suffixList[$suffix])) {
      $suf_result[] = $suffix;
    }
  }
  $prefixList[$k] = implode('', $suf_result) . "|" . $item['max_len'];
}


$data = json_encode($prefixList);

file_put_contents('prefix.txt', $data);


//check word

function checkWord($word) {
  global $prefixList;
  $wordLen = strlen($word);
  $word = preg_replace('#[aeiou\s]+#i', '', $word);
  $prefix = substr($word, 0, 2);
  $suffix = substr($word, -2, 2);
  var_dump($prefix);
  if (isset($prefixList[$prefix])) {
    $list = explode('|', $prefixList[$prefix]);
    $suffList = str_split($list[0], 2);
    $maxStrLen = $list[1];
    if (in_array($suffix, $suffList)) {
      if ($wordLen > $maxStrLen)
        return false;
      return true;
    }
  }
  return false;
}

//---------------data analys


$dataHola = file_get_contents('https://hola.org/challenges/word_classifier/testcase');
$dataHola = json_decode($dataHola, true);

$trueCount = 0;
foreach ($dataHola as $word => $isTrue) {
  $textResult = checkWord($word);
  if ($textResult == $isTrue) {
    $trueCount++;
  }
  echo $word . ' ' . $textResult . '-' . $isTrue . '<br>';
}

echo $trueCount . '<br>';


