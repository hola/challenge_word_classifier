<?php

// exit;
$trimmed = file('F:/PracticeOnProgramming/HolaCHalenge/words.txt');
$konsonanten = array('a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'
);
$konsonanten1 = $konsonanten;
$buchstaben;

$i = 0;
$y = 0;
$charCode;
$beginAT = microtime(true);

function createRegex (&$item, $key, $prefix)
{
    switch ($prefix) {
        case 0:
            $item = "^" . $item . '\w+$';
            break;
        case 1:
            $item = "^\w+" . $item . "$";
            break;
        case 2:
            $item = '/^' . substr($item, 0, 1) . '\w+' . substr($item, 1, 2) . '$/';
            break;
        case 3:
            $item = "^" . substr($item, 0, 1) . "\w+" . substr($item, 1, 2) . "'s$";
            break;
    }
}

function filterByLaeng4 ($item)
{
    return (strlen($item) >= 4);
}

function filterByLaeng5 ($item)
{
    return (strlen($item) == 5);
}

function filterByLaeng6 ($item)
{
    return (strlen($item) == 6);
}

function filterByLaeng7 ($item)
{
    return (strlen($item) == 7);
}

function filterByLaeng8 ($item)
{
    return (strlen($item) == 8);
}

function filterByLaeng9 ($item)
{
    return (strlen($item) == 9);
}

function filterByLaeng10 ($item)
{
    return (strlen($item) == 10);
}

function filterByLaeng11 ($item)
{
    return (strlen($item) == 11);
}

function filtern ($var)
{
    return count($var) > 150;
}

function filtern12 ($var)
{
    return $var > 200;
}

function toLow (&$word)
{
    $word = trim(strtolower($word));
}

function countAsci (&$item, $key)
{
    $chars = str_split($item);
    
    for ($z = 0; $z <= count($chars); $z ++) {
        $temp += (ord($chars[$z]));
    }
    
    $item = $temp;
}

function asciDifference (&$item, $key)
{
    $item = "";
    $temp = 0;
    echo $item . "<br>";
    $chars = str_split($item);
    for ($z = 0; $z <= count($chars); $z ++) {
        $temp -= (ord($chars[$z]));
        $tmp = $tmp . " " . $temp;
    }
    $item = $tmp;
}

array_walk($trimmed, "toLow");
echo "<pre>";

// var_dump($words5Chars);
$beginLoop = $zeitMitte - microtime(true);
echo "Zeit vergangen for Loop <pre>" . $beginLoop;

echo " dann war 6 chars words " . count($words6Chars) . "<br>";
$begin2char = array();
$beginEnd2 = array();
foreach ($konsonanten as $buchstabe) {
    
    foreach ($konsonanten1 as $buchstabe2) {
        $buchstabenkombi = $buchstabe . $buchstabe2;
        
        $suchmuster = '/^' . $buchstabenkombi . '\w+$/';
        
        $tmp = preg_grep($suchmuster, $trimmed);
        if (count($tmp) > 150) {
            $begin2char = array_merge($begin2char, $tmp);
        }
        
        $suchmuster = '/^\w+' . $buchstabenkombi . '$/';
        $tmp = preg_grep($suchmuster, $trimmed);
        if (count($tmp) > 150) {
            $beginEnd2 = array_merge($beginEnd2, $tmp);
        }
        
    }
}

$beginEnd2 = array_intersect($beginEnd2, $begin2char);

$z = 5;
$counterWords = 0;
echo "anzahl wörter nach regex filterung " . count($begin2char) . "<br>";
$zeitMitte = microtime(true);
$arrAllElems = array();

for ($arrId = 0; $arrId <= 6; $arrId ++) {
    $wordsArr[$arrId] = array_filter($beginEnd2, "filterByLaeng" . $z);
    $counterWords = 0;
    foreach ($wordsArr[$arrId] as $val) {
        $counterWords += count($val);

        $chars = str_split($val);
        $asciSum = 0;
        
        $charssize = sizeof($chars);
        $ascidiff12 = ord($chars[0]) - ord($chars[1]);
        $ascidiff34 = ord($chars[2]) - ord($chars[3]);
        
        $asciSum01 = (ord($chars[0]) - 100) * 2 + (ord($chars[1]) - 100) * 7;
        $asciSum12 = (ord($chars[1]) - 100) * 2 + (ord($chars[2]) - 100) * 7;
        $asciSum34 = (ord($chars[2]) - 100) * 2 + (ord($chars[3]) - 100) * 7;
        $asciSumlast2 = (ord($chars[$charssize - 1]) - 100) * 2 + (ord($chars[$charssize - 2]) - 100) * 7;
 
        if (strpos( $val,'\'') !==false){
            echo "das wort ".$val."summs: 1/2 -".$asciSum01." 2/3 ".$asciSum12." 3/4 ".$asciSum34." last ".$asciSumlast2."<br>";    
        }
        
        $erstesTeil = (ord($chars[$charssize - 1]) - 100) * 2;
        $zweitesTeil = (ord($chars[$charssize - 2]) - 100) * 7;
        
        $arrOfAsciSum[$z][0][$asciSum01] += 1;
        $arrOfAsciSum[$z][1][$asciSum12] += 1;
        $arrOfAsciSum[$z][2][$asciSum34] += 1;
        $arrOfAsciSum[$z][3][$asciSumlast2] += 1;
        
        $arrOfAsciDiff[$z][0][$ascidiff12] += 1;
        $arrOfAsciDiff[$z][1][$ascidiff34] += 1;
        $charNr = $arrId + 1;
    }
    
    // echo "anzahl woerter mit " . $z . " buchstaben ist " . $counterWords .
    // "<br>";
    // array_walk($words5Chars, "asciDifference");
    
    $inhaltSum .= "asciSum[" . $z . "][0] = [" . join(",", array_keys($arrOfAsciSum[$z][0])) . "]\n";
    $inhaltSum .= "asciSum[" . $z . "][1] = [" . join(",", array_keys($arrOfAsciSum[$z][1])) . "]\n";
    $inhaltSum .= "asciSum[" . $z . "][2] = [" . join(",", array_keys($arrOfAsciSum[$z][2])) . "]\n";
    if ($z >= 8) {
        $inhaltSum .= "asciSum[" . $z . "][3] = [" . join(",", array_keys($arrOfAsciSum[$z][3])) . "]\n";
    }
    
    $inhalt .= "ascidiff[" . $z . "][0] = [" . join(",", array_keys($arrOfAsciDiff[$z][0])) . "] \n";
    $inhalt .= "ascidiff[" . $z . "][1] = [" . join(",", array_keys($arrOfAsciDiff[$z][1])) . "] \n";
    
    echo "<br>";
    $z ++;
}
$compareWord = "";$counterAsci = 0;
foreach ($trimmed as $word){
    if (strpos($word, $compareWord) === true){
        $chars = str_split($val);
        $counterAsci = 0;
        foreach ($chars as $char)
        {
            $counterAsci .= ord($char);
            
        }
        $counterAsci .= "\n";
    }
}

$zeitMitte = microtime(true);
$beginLoop = $zeitMitte - $beginAT;

$fp = fopen('F:/PracticeOnProgramming/HolaCHalenge/AsciSummeAlle.txt', 'w');
fwrite($fp, $counterAsci);
fclose($fp);

$fp = fopen('F:/PracticeOnProgramming/HolaCHalenge/AsciDiff.txt', 'w');
fwrite($fp, $inhalt);
fclose($fp);


$beginENd = microtime(true) - $zeitMitte;
echo "Zeit vergangen gesamt " . $beginENd;

echo "<pre>";

$i = 0;

?>