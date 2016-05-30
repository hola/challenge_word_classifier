<?php 




$words = [];

$dictionnary = fopen('words.txt', "r") or die("Unable to open file!");

while(!feof($dictionnary)) {
	$words[] = strtolower(trim(fgets($dictionnary)));
}

fclose($dictionnary);

$validCharsArray = ["'","a","s","i","e","c","h","g","r","v","d","u","n","m","l","b","o","p","y","t","q","k","f","w","z","j","x"];

$allTwoLetterCombos = [];

$count = 27*27;
$index = 0;

for($i=0;$i<count($validCharsArray);$i++){
	for($j=0;$j<count($validCharsArray);$j++){
		$combo = $validCharsArray[$i].$validCharsArray[$j];
		if( preg_match("/(''|'q|'z|'j|'x|vq|qz|qj|qx|zx|jq|jz|jx|xj)/i",$combo) !== 1){
			$allTwoLetterCombos[] = $combo;
		}
	}
}

$total = count($words);

for($k = 0; $k<count($words); $k++){
	echo "words : ".number_format($k/$total*100)."\n";
	if(strlen($words[$k]) > 3){
		for( $l = 0; $l <= strlen($words[$k]) ; $l++ ) {
			$twoChars = substr( $words[$k], 0 ,2 );
			$pos = array_search($twoChars,$allTwoLetterCombos);
			if($pos !== false){
				unset($allTwoLetterCombos[$pos]);
			}
		}
	}
}

var_dump($allTwoLetterCombos);

$allTwoLetterCombos = array_values($allTwoLetterCombos);

$twoChars = fopen('twocharsnotstartwordgreaterthan3letters.txt', "w") or die("Unable to open file!");
for($i = 0; $i < count($allTwoLetterCombos); $i++){
	echo "writing : ".$allTwoLetterCombos[$i]."\n";
	fwrite($twoChars,$allTwoLetterCombos[$i]);
	fwrite($twoChars,"\n");
}

fclose($twoChars);


echo "\n Done";