<?php

$words = [];
$impossibleCharList = [];
$possibleCombos = [];


$validCharsArrayStart = ["a","s","i","e","c","h","g","r","v","d","u","n","m","l","b","o","p","y","t","q","k","f","w","z","j","x"];


for($i=0;$i<count($validCharsArrayStart);$i++){
	$words[$validCharsArrayStart[$i]] = [];
	$impossibleCharList[$validCharsArrayStart[$i]] = [];
	$possibleCombos[$validCharsArrayStart[$i]] = [];
}

$dictionnary = fopen('uniqueWords.txt', "r") or die("Unable to open file!");

$currentFirstLetter = "a";
echo "starting ".$currentFirstLetter;

while(!feof($dictionnary)) {
	$currentWord = strtolower(trim(fgets($dictionnary)));
	$firstLetter = substr( $currentWord, 0 , 1 );
	$words[$firstLetter][] = $currentWord;
}

echo "end dictionnary parse";

fclose($dictionnary);

$validCharsArray = ["'","a","s","i","e","c","h","g","r","v","d","u","n","m","l","b","o","p","y","t","q","k","f","w","z","j","x"];


for($i=0;$i<count($validCharsArray);$i++){
	for($j=0;$j<count($validCharsArray);$j++){
		$combo = $validCharsArray[$i].$validCharsArray[$j];
		if(preg_match("/(''|'q|'z|'j|'x|vq|qz|qj|qx|zx|jq|jz|jx|xj)/i",$combo) !== 1){
			for($k=0;$k<count($validCharsArrayStart);$k++){
				$possibleCombos[$validCharsArrayStart[$k]][] = $combo;
			}
		}
	}
}

echo "end combo generation";

for($k=0;$k<count($validCharsArrayStart);$k++){
	echo $validCharsArrayStart[$k]."\n";
	for($i=0;$i<count($words[$validCharsArrayStart[$k]]);$i++){
		if(strlen($words[$validCharsArrayStart[$k]][$i]) > 2){
			for( $l = 0; $l < strlen($words[$validCharsArrayStart[$k]][$i]) - 1; $l++ ) {
				$twoChars = substr( $words[$validCharsArrayStart[$k]][$i], $l, 2 );
				$pos = array_search($twoChars,$possibleCombos[$validCharsArrayStart[$k]]);

				if($words[$validCharsArrayStart[$k]][$i] === "throat's" || $words[$validCharsArrayStart[$k]][$i] === "antisexism's" || $words[$validCharsArrayStart[$k]][$i] === "instillation's"){
					echo $words[$validCharsArrayStart[$k]][$i]."\n";
					echo $twoChars."\n";
					echo $pos."\n";
				}

				if($pos !== false){
					unset($possibleCombos[$validCharsArrayStart[$k]][$pos]);
				}
			}
		}
	}
}

$impossibleCombos = [];

for($k=0;$k<count($validCharsArrayStart);$k++){
	$impossibleCombos[$validCharsArrayStart[$k]] = [];
	$impossibleCombos[$validCharsArrayStart[$k]] = array_values($possibleCombos[$validCharsArrayStart[$k]]);
}

echo "start to write js";

$file = fopen('twoLetterCombosPerStartingLetter.js',"w");
fwrite($file,"if(word.length > 2){\n" );

for($k=0;$k<count($validCharsArrayStart);$k++){
	fwrite($file,"    if(word.substring(0, 1) === '".$validCharsArrayStart[$k]."' && word.match(/(");
	for($i=0;$i<count($impossibleCombos[$validCharsArrayStart[$k]]);$i++){
		fwrite($file,$impossibleCombos[$validCharsArrayStart[$k]][$i]);
		if(($i+1)<count($impossibleCombos[$validCharsArrayStart[$k]])){
			fwrite($file,"|");	
		}
	}
	fwrite($file,")/gi)){\n");
	fwrite($file,"        return false;");
	fwrite($file, "    }\n" );
}

fwrite($file,"}\n" );
fclose($file);
