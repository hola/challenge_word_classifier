long_words = ["llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch",
              "llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch's",
              "pneumonoultramicroscopicsilicovolcanoconioses",
              "pneumonoultramicroscopicsilicovolcanoconiosis"]


export.test = function(word) { 
	if (word.length() >= 35) {
		if (long_words.indexOf(word) >= 0)
			return false;
	}

	return Math.random() > 0.5; 
}

