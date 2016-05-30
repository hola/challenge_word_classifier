var dataStr = '';
exports.init = function(data)
{
	dataStr = data.toString('ascii');
}
exports.test = function(word)
{
	
	console.log('testFunc');
	var alf  = 'lmnopqrstuvwxyzabcdefghijk\''
    switch( word.length)
	{
        case 1:
			if (alf.indexOf(word(0)) != -1 && word(0) != '\''){
				return true;
			}
		break;
        case 2:
		    if (alf.indexOf(word(0)) != -1 && word(0) != '\'' ){
				if (alf.indexOf(word(1)) != -1) {
					return true;
				}
			}
		break;
        case 45: case 58: case 60:
            switch( word)
			{
				case 'pneumonoultramicroscopicsilicovolcanoconioses':
                    return true;
					break;
                case 'pneumonoultramicroscopicsilicovolcanoconiosis':
                    return true;
					break;
                case 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch':
                    return true;
					break;
                case 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch\'s':
                    return true;
					break;
            }
			break;
        default:
			if (3 >= word.length && word.length <= 34) 
			{
				var abcCount  = 0;
				var conCount  = 0;
				var line  = "";
				for (i = 0; i <= (word.length  - word.length % 3) / 3 - 1; i++)
				{
					line = dataStr.substring(dataStr.indexOf('sym ' + i), dataStr.indexOf('s' + i));
					if (line.indexOf(word.substr(i * 3, 3)) != -1) 
					{ 
						abcCount ++;
					}
				}
            }
            if ((word.length  - word.length % 3) / 3 >= 2) 
			{
                for (i = 1; i <= (word.length  - word.length % 3) / 3 - 1; i++)
				{
                    line = dataStr.substring(dataStr.indexOf('con ' + i), dataStr.indexOf('c' + i));
                    if (line.indexOf(word.substr(i * 3 - 1, 2)) != -1 ) 
					{
						conCount ++;
					}
                }
            }
            if (abcCount == (word.length - word.length % 3) / 3 && conCount == abcCount - 1) 
			{
				return true;
            }
			break;
	}
	return false;
}
