var exports = module.exports = {};

//returns true iff classifies the given word as a word in the dictionary
exports.test = function(word){
	if (word.length>20){ 
		return false;
	}
	var word_cors = translate(word);
	word_cors = polyFeatures(word_cors, 2);
	var theta = trainedTheta();
		//console.log(vecMultiply(word_cors, theta))
		//console.log(word_cors);
	return vecMultiply(word_cors, theta)>=0;
}


function translate(str){
   var out = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
   for (var i=0; i<str.length; ++i){
      out[i]=str.charCodeAt(i)-'a'.charCodeAt(0)+2;
      if (out[i]<0){
         out[i] += 'a'.charCodeAt(0) -"'".charCodeAt(0)-1;
      }
   }
   return out;
}

//returns the polynomial combinations of the elements
//
//in - an array to be polynomialized
//degree - the max degreee the polynomial combinations should reach
//
//out - an array whose elements are
//each polynomial combination of 'in''s elements, from 0-degree (an element equals 1)
//to the 'degree'-degree polynomial of the last element raised to 'degree' power.
function polyFeatures(inp, degree){
	var out = [1];
	if (degree==0){
		return out;
	}
	var deg;
	for (deg=1; deg<=degree; ++deg){
		out = out.concat(powerFeatures(inp, deg)); 
	}
	return out;
}

function powerFeatures(inp, degree){
    if (degree==0){
        return [1];
    } else {
        var power_lower = powerFeatures(inp, degree-1);
        //each element in power_lower should be multiplied by an element from
        //in. Each such multiplication is an answer for the right degree for
        //this function
        var vars = inp.length;
        var out = [];
        for (var elem=0; elem<vars; ++elem){
            num_relevant_lower_inds = num_of_products(vars-elem, degree-1);
			for (var j=power_lower.length-num_relevant_lower_inds; j< power_lower.length; ++j){
				out.push(power_lower[j]*inp[elem]);
				if (isNaN(power_lower[j]*inp[elem])){
					console.log("power_lower="+power_lower+"  ; inp="+inp+"  ; j="+j+"   ; elem="+(elem));
				}
			}
        }
        return out;
    }
}

function num_of_products(vars, degree){
//returns the number of possible products of degree 'degree' with 'vars' number of variables
    if (degree==0){
        return 1;
    } else {
        var num = 0;
        for (var i=0; i<vars; ++i){
            num = num + num_of_products(vars-i, degree-1); 
        }
    }
	return num;
}

//returns the dot-product of two same-length vectors given as arrays
function vecMultiply(arr1, arr2){
	var sum=0;
	for (var i=0; i<arr1.length; ++i){
		sum += arr1[i]*arr2[i];
	}
	return sum;
}

//returns the trained theta (trained for features of 20, raised to 2nd degree polynomials, 10 iterations)
function trainedTheta(){
	return [0.2102,
    0.1018,
    0.1106,
    0.1585,
    0.1028,
    0.1136,
    0.0661,
    0.0286,
   -0.0081,
   -0.0347,
   -0.0571,
   -0.0750,
   -0.0910,
   -0.0951,
   -0.1021,
   -0.0908,
   -0.0893,
   -0.0676,
   -0.0487,
    0.0277,
    0.0781,
   -0.0034,
   -0.0001,
   -0.0012,
   -0.0001,
   -0.0004,
    0.0000,
   -0.0001,
    0.0000,
    0.0000,
   -0.0001,
    0.0001,
    0.0001,
    0.0001,
    0.0003,
   -0.0000,
    0.0002,
   -0.0002,
    0.0001,
   -0.0006,
   -0.0008,
   -0.0043,
   -0.0017,
    0.0004,
    0.0001,
   -0.0001,
    0.0001,
    0.0002,
    0.0001,
    0.0001,
    0.0002,
    0.0002,
    0.0002,
    0.0003,
    0.0004,
    0.0003,
    0.0002,
    0.0006,
   -0.0002,
   -0.0002,
   -0.0045,
   -0.0007,
   -0.0002,
    0.0001,
   -0.0000,
   -0.0001,
   -0.0000,
    0.0002,
    0.0000,
   -0.0001,
    0.0000,
    0.0002,
    0.0001,
   -0.0000,
   -0.0000,
   -0.0002,
    0.0002,
   -0.0009,
   -0.0042,
   -0.0014,
    0.0002,
    0.0003,
    0.0001,
    0.0003,
    0.0002,
    0.0002,
    0.0001,
   -0.0001,
    0.0000,
   -0.0002,
    0.0001,
    0.0001,
    0.0003,
   -0.0002,
    0.0000,
   -0.0046,
   -0.0009,
    0.0007,
    0.0007,
    0.0002,
    0.0003,
    0.0001,
    0.0004,
   -0.0001,
    0.0001,
    0.0002,
    0.0003,
    0.0005,
    0.0003,
   -0.0001,
   -0.0009,
   -0.0039,
   -0.0006,
    0.0014,
    0.0008,
    0.0002,
    0.0003,
    0.0001,
    0.0004,
   -0.0002,
    0.0000,
    0.0002,
    0.0000,
    0.0001,
   -0.0002,
   -0.0000,
   -0.0031,
   -0.0006,
    0.0017,
    0.0009,
   -0.0000,
    0.0003,
    0.0001,
    0.0006,
   -0.0004,
    0.0001,
    0.0002,
    0.0002,
    0.0002,
    0.0001,
   -0.0026,
   -0.0005,
    0.0021,
    0.0011,
   -0.0003,
    0.0003,
   -0.0001,
    0.0007,
   -0.0006,
    0.0001,
    0.0002,
    0.0002,
    0.0000,
   -0.0020,
   -0.0006,
    0.0024,
    0.0009,
   -0.0005,
    0.0004,
   -0.0001,
    0.0007,
   -0.0006,
    0.0002,
    0.0001,
    0.0010,
   -0.0013,
   -0.0008,
    0.0023,
    0.0010,
   -0.0010,
    0.0005,
   -0.0001,
    0.0008,
   -0.0003,
    0.0001,
    0.0002,
   -0.0005,
   -0.0009,
    0.0022,
    0.0010,
   -0.0016,
    0.0007,
   -0.0001,
    0.0009,
   -0.0012,
    0.0006,
    0.0005,
   -0.0010,
    0.0020,
    0.0010,
   -0.0020,
    0.0009,
   -0.0002,
    0.0009,
   -0.0007,
    0.0012,
   -0.0012,
    0.0018,
    0.0010,
   -0.0023,
    0.0008,
    0.0001,
    0.0013,
    0.0019,
   -0.0017,
    0.0017,
    0.0010,
   -0.0023,
    0.0013,
    0.0002,
    0.0026,
   -0.0020,
    0.0016,
    0.0009,
   -0.0027,
    0.0010,
    0.0028,
   -0.0022,
    0.0014,
    0.0004,
   -0.0024,
    0.0025,
   -0.0026,
    0.0012,
    0.0001,
    0.0019,
   -0.0031,
    0.0010,
    0.0013,
   -0.0035,
    0.0000,
         0];
}