<?php 

$words = [];

$dictionnary = fopen('words.txt', "r") or die("Unable to open file!");

while(!feof($dictionnary)) {
	$words[] = strtolower(trim(fgets($dictionnary)));
}

fclose($dictionnary);

$validCharsArray = ["'","a","s","i","e","c","h","g","r","v","d","u","n","m","l","b","o","p","y","t","q","k","f","w","z","j","x"];

$file = fopen('possibleWordsByCharLength.js', "w") or die("Unable to open file!");

for($a=3;$a<61;$a++){

	echo "\nstarting ".$a;

	$count = 0;

	for($k = 0; $k<count($words); $k++){
		if(strlen($words[$k]) === $a ){
			$count++;
		}
	}

	$wordList = [];

	if($count <= 10){
		for($k = 0; $k<count($words); $k++){
			if(strlen($words[$k]) === $a ){
				$wordList[] = $words[$k];
			}
		}


		fwrite($file,"if(word.length === ".$a." && !word.match(/(");
		for($i = 0; $i < count($wordList); $i++){
			fwrite($file,$wordList[$i]);
			if($i !== (count($wordList)-1)){
				fwrite($file,"|");
			}
		}
		fwrite($file,")/gi)){\nreturn false;\n}\n");
	
	}
}

fclose($file);