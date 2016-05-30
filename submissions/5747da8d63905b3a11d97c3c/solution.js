var alphabets = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
var jsonData = {};

export.init = function(data){
	jsonData = JSON.parse(data);
};

export.test = function(word){
	word = word.toLowerCase();
	letters = word.split("");
	word_length = word.length;
	if (word_length < 20){
		db = {};
		first_alphabet_index = alphabets.indexOf(letters[0]) + 1;
		end_index = 20*first_alphabet_index - 19;
		start_index = end_index - 19;
		counter = 0;
		for (var key in jsonData) {
			if(key.indexOf(letters[0]) > -1){
				if (jsonData.hasOwnProperty(key)) {
					var val = jsonData[key];
					counter++;
					db[key] = val;
					if(counter == 20){
						break;
					}
				}
			}
		}
		freq = [-1];
		min_length = [-1];
		max_length = [-1];
		average_length = [-1];
		for(var i = 1 ; i <word_length; i++){
			letter = letters[i];
			myVal = db[letters[0]+i.toString()];
			index = myVal.indexOf(letter);
			if(index == -1){
				return false;
			}
			else{
				letter_detail = myVal.substr(index).split(".")[0];
				letter_detail_arr = letter_detail.split("_");
				freq.push(letter_detail_arr[1]);
				min_length.push(letter_detail_arr[2]);
				max_length.push(letter_detail_arr[3]);
				average_length.push(letter_detail_arr[4]);
			}
		}

		freq.shift();
		minVal = Math.min.apply(null, freq);
		indexOfTarget = freq.indexOf(minVal.toString()) + 1;
		minLength = min_length[indexOfTarget] - 1;
		maxLength = max_length[indexOfTarget] + 1;
		averageLength = average_length[indexOfTarget];
		if (word_length > maxLength || word_length < minLength){
			return false;
		}
		else{
			minThreshold = averageLength - 1;
			maxThreshold = averageLength + 1;
			if(word_length >=minThreshold && word_length <= maxThreshold){
				return true;
			}
			else{
				return false;
			}
		}
	}	
	else{
		return false;
	}
};