SEED1=0x811ca051;
SEED2=0x811caf5c;
BLOOMLEN=520288+8*60;

function prebloom(word){
    CLEANUP=/^(hyper|pre|non|photo|over|under|fore|anti|post|arch|out|multi|trans|sub|semi|super|counter|pseudo|up|micro|un|electr)*/;
    CLEANUPE=/(ville|men|less|ed|iest|ingly|lenesses|ship|ing|man|like|leness|ier|cally|isation|edness|ful|ily|age|se|ings)*$/;
    word = word.replace(/('s)*$/,'')
        .replace(CLEANUP,'')
        .replace(CLEANUPE,'')
        .replace(/s$/,'')
        .replace(CLEANUPE,'')
        ;

    if(word.length>14 ||
        word.replace(/[aeiouy]/g,'').length>8 || 
        word.indexOf("'")>=0 ||
        word.match(/[^aeiouy]{4}$/g,'') ||
        word.match(/[^aeiouy]{5}/g,''))  return false;
    return word;
}

function hashFnv32a(str, seed) {
    var i, l,
        hval = seed;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    return (hval >>> 0) % BLOOMLEN;
}
exports.test=function(word){
    //if(word in exports.words) return true;
    //exports.words[word]=true;
    
    word = prebloom(word);
    if(word===false) return false;
   
    var pos1 = hashFnv32a( word.substring(0,6), SEED1 );
    var pos2 = hashFnv32a( word.substring(0,9), SEED2 );
    if ( 
        d[(pos1/8)|0]&(1<<(pos1%8)) 
        && d[(pos2/8)|0]&(1<<(pos2%8)) 
    ){
        return true;
    }
    return false;
}
