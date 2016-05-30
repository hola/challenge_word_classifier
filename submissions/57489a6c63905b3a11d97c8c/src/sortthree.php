<?php 

$words = [];

$dictionnary = fopen('words.txt', "r") or die("Unable to open file!");

while(!feof($dictionnary)) {
	$words[] = strtolower(trim(fgets($dictionnary)));
}

fclose($dictionnary);

$validCharsArray = ["'","a","s","i","e","c","h","g","r","v","d","u","n","m","l","b","o","p","y","t","q","k","f","w","z","j","x"];

$allThreeLetterCombos = [];

$count = 27*27*27;
$index = 0;

for($i=0;$i<count($validCharsArray);$i++){
	for($j=0;$j<count($validCharsArray);$j++){
		$comboStart = $validCharsArray[$i].$validCharsArray[$j];
		if(preg_match("/(''|'q|'z|'j|'x|vq|qz|qj|qx|zx|jq|jz|jx|xj)/i",$comboStart) === 1){
			echo $comboStart." matches, skip!\n";
		} else {
			for($x=0;$x<count($validCharsArray);$x++){
				$combo = $validCharsArray[$i].$validCharsArray[$j].$validCharsArray[$x];
				if(preg_match("/(''|'q|'z|'j|'x|vq|qz|qj|qx|zx|jq|jz|jx|xj)/i",$combo) === 1){
					echo $combo." matches, skip!\n";
				} else {
					$allThreeLetterCombos[] = $combo;
				}
			}
		}
	}
}

$possibleThreeLetterCombos = [];

echo "begin list of words";

for($k = 0; $k<count($words); $k++){
	echo "checking word ".$words[$k]."\n";
	for( $l = 0; $l <= strlen($words[$k])-2; $l++ ) {
		$threeChars = substr( $words[$k], $l, 3 );
		if(!in_array($threeChars,$possibleThreeLetterCombos)){
			$possibleThreeLetterCombos[] = $threeChars;
		}
	}
}

echo "end of list of words";

$impossibleThreeLetterCombos =[];

for($i=0;$i <= count($allThreeLetterCombos);$i++){
	echo "checking : ".number_format($i/count($allThreeLetterCombos)*100)." % \n";
	if(!in_array($allThreeLetterCombos[$i],$possibleThreeLetterCombos)){
		$impossibleThreeLetterCombos[] = $allThreeLetterCombos[$i];
	}
}


$threeChars = fopen('threechars3.txt', "w") or die("Unable to open file!");
for($i = 0; $i< count($impossibleThreeLetterCombos); $i++){
	fwrite($threeChars,$impossibleThreeLetterCombos[$i]);
	fwrite($threeChars,"\n");
}

fclose($threeChars);