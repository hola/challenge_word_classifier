<?php

$dir = "F:/PracticeOnProgramming/HolaCHalenge";
$files1 = scandir($dir);
$newId = 0;
foreach ($files1 as $file){
    if(strpos($file, "Hola") !== false){
        $lastIndex = substr($file, strlen($file)-4,1);   
       
        $newId = (intval($lastIndex) > $newId) ? intval($lastIndex) :   $newId;   
    }
}
$newId = $newId + 1;
$caseNr = 17763615335 + $newId;

$json = file_get_contents('https://hola.org/challenges/word_classifier/testcase/67324478');

$anwsers = json_decode($json);

$fp = fopen('F:/PracticeOnProgramming/HolaCHalenge/Hola'.$newId.'.js', 'w');
$inhalt = "const square = require('./regexTeil.js')
exports.test = function(word) {
var rightArr = new Array;
var words = new Array;\n";
foreach ($anwsers as $word => $antwort){
    $inhalt .= "words.push(\"".$word."\");\n";
    $bool = ($antwort == '1')? ("true") : ("false");
    $inhalt .= "rightArr.push(".$bool.");\n";
}
$inhalt .=" console.log('Hola $newId');console.log('casenr $caseNr');
var mySquare = square.test(words, rightArr);
return ;}";
fwrite($fp, $inhalt);
fclose($fp);
echo "<pre>";
var_dump($anwsers);
?>