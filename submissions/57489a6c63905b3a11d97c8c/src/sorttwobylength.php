<?php 

$words = [];

$dictionnary = fopen('words.txt', "r") or die("Unable to open file!");

while(!feof($dictionnary)) {
	$words[] = strtolower(trim(fgets($dictionnary)));
}

fclose($dictionnary);

$validCharsArray = ["'","a","s","i","e","c","h","g","r","v","d","u","n","m","l","b","o","p","y","t","q","k","f","w","z","j","x"];

$file = fopen('impossibleTwoCharsByWordLen.js', "w") or die("Unable to open file!");

for($a=3;$a<61;$a++){

	echo "\nstarting ".$a;

	$allTwoLetterCombos = [];

	$count = 27*27;
	$index = 0;

	for($i=0;$i<count($validCharsArray);$i++){
		for($j=0;$j<count($validCharsArray);$j++){
			$combo = $validCharsArray[$i].$validCharsArray[$j];
			if(preg_match("/(''|'q|'z|'j|'x|vq|qz|qj|qx|zx|jq|jz|jx|xj)/i",$combo) !== 1){
				$allTwoLetterCombos[] = $combo;
			}
		}
	}

	echo "begin list of words";

	for($k = 0; $k<count($words); $k++){
		if(strlen($words[$k]) === $a ){
			for( $l = 0; $l < ($a-1) ; $l++ ) {
				$twoChars = substr( $words[$k], $l, 2 );
				$pos = array_search($twoChars, $allTwoLetterCombos);
				if($pos !== false){
					unset($allTwoLetterCombos[$pos]);
				}
			}
		}
	}

	$allTwoLetterCombos = array_values($allTwoLetterCombos);


	fwrite($file,"if(word.length === ".$a." && word.match(/(");
	for($i = 0; $i < count($allTwoLetterCombos); $i++){
		fwrite($file,$allTwoLetterCombos[$i]);
		if($i !== (count($allTwoLetterCombos)-1)){
			fwrite($file,"|");
		}
	}
	fwrite($file,")/gi)){\nreturn false;\n}\n");
}

fclose($file);