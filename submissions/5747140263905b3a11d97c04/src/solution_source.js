var VOWELS = 'aeiouy';
var ENDINGS = ["ness", "ing", "ly", "s"];

var _data = null;

var _uint32 = new Uint32Array(2);

function init(data)
{
	_data = data;
}

function correctApostrof(word)
{
	var apostrof = word.indexOf("'");
	
	if (apostrof != -1)
	{
		if (word.indexOf("'s") == word.length - 2)
		{
			word = word.substr(0, apostrof);
		}
		else
		{
			word = null;
		}
	}
	
	return word;
}

function isNormalWord(word)
{
	var vowels = 0;
	var consonants = 0;
	var similar = 0;
	
	var last = ' ';
	
	for (var i = 0; i < word.length; i++)
	{
		var current = word[i];
		
		if (VOWELS.indexOf(current) != -1)
		{
			vowels++;
			consonants = 0;
		}
		else
		{
			vowels = 0;
			consonants++;
		}
		
		if (current == last)
		{
			similar++;
		}
		else
		{
			similar = 0;
		}
		
		if (vowels > 3 || consonants > 4 || similar > 1)
		{
			return false;
		}
		
		last = current;
	}
	
	return true;
}

function getTableValue(word)
{
	var hash = HashFAQ6(word);
	
	var num = hash % (_data.length * 8);
	
	var index = Math.floor(num / 8);
	
	var offset = num % 8;
	
	var value = _data[index];
	
	return getBit(offset, value);
}

function HashFAQ6(word)
{
	_uint32[0] = 0;
	_uint32[1] = 0;
	
	for (var i = 0; i < word.length; i++)
	{
		_uint32[0] += word.charCodeAt(i);
		
		_uint32[1] = _uint32[0] << 10;
		_uint32[0] += _uint32[1];
		
		_uint32[1] = _uint32[0] >>> 6;
		_uint32[0] ^= _uint32[1];
	}
	
	_uint32[1] = _uint32[0] << 3;
	_uint32[0] += _uint32[1];
	
	_uint32[1] = _uint32[0] >>> 11;
	_uint32[0] ^= _uint32[1];
	
	_uint32[1] = _uint32[0] << 15;
	_uint32[0] += _uint32[1];
	
	return _uint32[0];
}

function getBit(bitNum, value)
{
	return (value & (1 << bitNum)) != 0;
}

function removeEnding(word)
{
	for (var i in ENDINGS)
	{
		var end = ENDINGS[i];
		
		var wordLength = word.length;
		var endLength = end.length;
		
		if (wordLength > endLength && word.indexOf(end) == wordLength - endLength)
		{
			word = word.substr(0, wordLength - endLength);
			break;
		}
	}
	
	if (8 < word.length)
	{
		word = word.substr(0, 8);
	}
	
	return word;
}

function test(word)
{
	word = correctApostrof(word.toLowerCase());
	
	if (word != null)
	{
		var length = word.length;
		
		if (length <= 2)
		{
			return true;
		}
		else if (length <= 15 && isNormalWord(word))
		{
			word = removeEnding(word);
				
			return getTableValue(word);
		}
	}

	return false;
}

exports.init = init;
exports.test = test;