
function init(data) {

}

function test(word) {
    word = word.toLowerCase();
	var len = word.length;
	switch(len) {
		case 0:
			return false;
		case 45:
			return 
				((word == "pneumonoultramicroscopicsilicovolcanoconioses") ||
				 (word == "pneumonoultramicroscopicsilicovolcanoconiosis"));

		case 58:
			return (word == "llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch");
		case 60:
			return (word == "llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch's");
		default:
			if (len > 34) {
				return false;
			}

			// TODO: !!!MATCH!!!!
	}
}

