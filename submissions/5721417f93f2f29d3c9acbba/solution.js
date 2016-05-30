/*Bellavin Y. ds@inbox.ru */

var buf=[];

function init(Buffer) {
		buf = Buffer.toString('ascii').split(',');
		console.log('init length: '+ buf.length );
  		
}


function test (Word) {
	if ( Word.length > 10 ) Word = Word.substr(0,10);
 	for(i in buf) {
 		buf[i]= buf[i] +'\'s';
 		var n = buf[i].indexOf(Word, 0);
		if ( n >= 0 ) return true;
	}
	return  Math.random() > 0.87;
};


module.exports = {
	init:  init,
	test: test
}