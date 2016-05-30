
var jsonFile  = null;

var init = function(data) {
	jsonFile = JSON.parse(data.toString()); 

};


function levenshtein(s1, s2, costs) {
    var i, j, l1, l2, flip, ch, chl, ii, ii2, cost, cutHalf;
    l1 = s1.length;
    l2 = s2.length;

    costs = costs || {};
    var cr = costs.replace || 1;
    var cri = costs.replaceCase || costs.replace || 1;
    var ci = costs.insert || 1;
    var cd = costs.remove || 1;

    cutHalf = flip = Math.max(l1, l2);

    var minCost = Math.min(cd, ci, cr);
    var minD = Math.max(minCost, (l1 - l2) * cd);
    var minI = Math.max(minCost, (l2 - l1) * ci);
    var buf = new Array((cutHalf * 2) - 1);

    for (i = 0; i <= l2; ++i) {
        buf[i] = i * minD;
    }

    for (i = 0; i < l1; ++i, flip = cutHalf - flip) {
        ch = s1[i];
        chl = ch.toLowerCase();

        buf[flip] = (i + 1) * minI;

        ii = flip;
        ii2 = cutHalf - flip;

        for (j = 0; j < l2; ++j, ++ii, ++ii2) {
            cost = (ch === s2[j] ? 0 : (chl === s2[j].toLowerCase()) ? cri : cr);
            buf[ii + 1] = Math.min(buf[ii2 + 1] + cd, buf[ii] + ci, buf[ii2] + cost);
        }
    }
    return buf[l2 + cutHalf - flip];
}

var isFakeWord = function(word) {
	var gl = 'euioa';
	var count = 0;
	for(i=0;i<word.length ;i++){
		if(gl.indexOf(word[i]) == -1){
			count += 1;
		} else {
			if(count  < 5) {
				count = 0;
			}
		}
	}
	return count > 4
}

var soundex = function (s) {
     var a = s.toLowerCase().split(''),
         f = a.shift(),
         r = '',
         codes = {
             a: '', e: '', i: '', o: '', u: '',
             b: 1, f: 1, p: 1, v: 1,
             c: 2, g: 2, j: 2, k: 2, q: 2, s: 2, x: 2, z: 2,
             d: 3, t: 3,
             l: 4,
             m: 5, n: 5,
             r: 6
         };
 
     r = f +
         a
         .map(function (v, i, a) { return codes[v] })
         .filter(function (v, i, a) {
             return ((i === 0) ? v !== codes[f] : v !== a[i - 1]);
         })
         .join('');
 
     return (r + '000').slice(0, 4).toUpperCase();
};

var test = function(word) {

	if(word.indexOf("'") > -1 && word.indexOf("'") < word.length - 2 ) {
		return false;
	}

	if(isFakeWord(word)) {
		return false;
	}

	word = word.replace("'","")
	var soundexIndex  = soundex(word);

	var soundexFronJson = jsonFile[soundexIndex];
	//console.log(jsonFile)
	if(typeof  soundexFronJson == 'undefined'){
		return false;
	}
	var percent = 0;
	var coef = Math.round(100/soundexFronJson.length);

	


	// _.each(soundexFronJson, function(key, content){
	// 	if(word.indexOf(key) !== -1) {
	// 		percent += coef/(content + 1)
	// 		//console.log(Math.log(content + 2))
	// 		//console.log(key,content)	
	// 	}
		
	// })
	var sum  = 0;
	// if(soundexFronJson.length > word.length){
	// 	var from = word;
	// 	var to = soundexFronJson;
	// }
		var from = soundexFronJson;
		var to = word;

	for(i=0;i<from.length - 1;i++){
		if(to.indexOf(from[i]) !== -1){
			sum += 1;
		}
	}
	//console.log(sum)
	var k = (sum/(soundexFronJson.length + word.length ));
	var k2 = ((sum/2)*(1/soundexFronJson.length + 1/word.length ));

	//console.log(k , k2 , (k2 - k), levenshtein(soundexFronJson, word))
	//console.log(soundexFronJson);
	//console.log(word);
	if( levenshtein(soundexFronJson, word) > 10) {
		if(word.length >= 5 && word.length <= 7) return true;
		return false;
	}
	return   (k2 - k) <= 0.4;
} 

exports.init = init;
exports.test = test;