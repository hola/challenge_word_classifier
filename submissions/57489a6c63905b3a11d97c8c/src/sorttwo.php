<?php 




$words = [];

$dictionnary = fopen('words.txt', "r") or die("Unable to open file!");

while(!feof($dictionnary)) {
	$words[] = strtolower(trim(fgets($dictionnary)));
}

fclose($dictionnary);

$validCharsArray = ["'","a","s","i","e","c","h","g","r","v","d","u","n","m","l","b","o","p","y","t","q","k","f","w","z","j","x"];

$impossibleTwoLetterCombos = [];

$count = 27*27;
$index = 0;

for($i=0;$i<count($validCharsArray);$i++){
	for($j=0;$j<count($validCharsArray);$j++){
		$combo = $validCharsArray[$i].$validCharsArray[$j];
		$found = false;
		$index++;
		echo "checking ".$combo." - progress : ".number_format($index/$count,2)."\n";
		for($k = 0; $k<count($words); $k++){
			if(strlen($words[$k]) >= 4){
				for( $l = 0; $l <= strlen($words[$k])-1; $l++ ) {
					$twoChars = substr( $words[$k], $l, 2 );
					if($combo === $twoChars){
						$found = true;
					}
				}
				if($found){
					echo "found!!\n";
					break;
				}
			}
		}
		if(!$found){
			$impossibleTwoLetterCombos[] = $combo;
		}
	}
}

var_dump($impossibleTwoLetterCombos);


$twoChars = fopen('twochars2.txt', "w") or die("Unable to open file!");
for($i = 0; $i< count($impossibleTwoLetterCombos); $i++){
	fwrite($twoChars,$impossibleTwoLetterCombos[$i]);
	fwrite($twoChars,"\n");
}

fclose($twoChars);


echo "\n Done";

?>