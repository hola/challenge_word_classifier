function Bloom(size, functions) {
    var bits = Bits();
    
    function add(string) {
        for (var i = 0; i < functions.length; ++i)
            bits.set(functions[i](string) % size);
    }
    
    function test(string) {
        for (var i = 0; i < functions.length; ++i)
            if (!bits.test(functions[i](string) % size)) return false;
    
        return true;
    }

    function getBits(){
      return bits.getBits();
    }
        
    return {add: add, test: test, getBits: getBits};
}

function OptimalBloom(max_members, error_probability) {
    var size = 3171149;
    var count = 47;
    
    var startSeed = 30;
    var seedStep = 3;
 
    var functions = [];
    for (var i = 0; i < count; ++i){
      var seed = startSeed + seedStep * i;
      functions[i] = Hash(seed);
    }

    return Bloom(size, functions);
}

function Hash(seed){

    return function (string)    {
        var result = 1;
        for (var i = 0; i < string.length; ++i)
            result = (seed * result + string.charCodeAt(i)) & 0xFFFFFFFF;
        
    return result;
    };
}

function Bits(){
    var bits = [];
    function test(index) {
        return (bits[Math.floor(index / 32)] >>> (index % 32)) & 1;
    }
    
    function set(index){
        bits[Math.floor(index / 32)] |= 1 << (index % 32);
    }

    function getBits(){
	return bits;
    }
    return {test: test, set: set, getBits: getBits};
}

exports.add = (data) => {
    var wordsBloom = OptimalBloom(661686, 0.1);
    var words = data.split('\n');
    for (var i=0; i<words.length; i++){
	var word = words[i];
	if (word.length>0){
	    wordsBloom.add(word.toLowerCase());
	}
    }
    return wordsBloom.getBits();
}