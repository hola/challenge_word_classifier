var _ = require('underscore');
var BloomFilter = require('bloom-filter');
var fs = require("fs")
var zlib = require('zlib')
const logic = require('./logic.js');
/*
var nr = {}
var positive = fs.readFileSync('utrueWords.txt').toString().toLowerCase().split('\r\n');
var negative = fs.readFileSync('ufalseWords.txt').toString().toLowerCase().split('\r\n');

var network = JSON.parse(fs.readFileSync('networkbig.json').toString())

var maxJ = new Array(33).fill(0.0)
_.each(positive, function(w) {
	var input1 = logic.calcf(w)
	for(var i = 0; i < input1.length; ++i)
	{
		if(maxJ[i] < input1[i]) 
			maxJ[i] = input1[i];
	}
})

for(var i = 0; i < maxJ.length; ++i)
	maxJ[i] = Math.round(1000*maxJ[i])/1000.0

nr.maxJ = maxJ

delete network.InputsCount
var cleanN = function(n) {
	_.each(n.Layers, function(layer) {
		for (var index = 0; index < layer.Neurons.length; ++index)
		{
			var neuron = layer.Neurons[index]
			delete neuron.InputsCount
			delete neuron.ActivationFunction
			delete neuron.Output
			neuron.Threshold = Math.round(1000*neuron.Threshold)/1000.0
      		for (var index2 = 0; index2 < neuron.Weights.length; ++index2)
      		{
      			neuron.Weights[index2] = Math.round(1000*neuron.Weights[index2])/1000.0
        	}
		}
	})
	return n
}

var calc = function(w, n) {
	var input1 = logic.calcf(w)
	for(var i = 0; i < input1.length; ++i)
		input1[i] /= nr.maxJ[i]
	_.each(n.Layers, function(layer) {
		var numArray = []
		for (var index = 0; index < layer.Neurons.length; ++index)
		{
			var neuron = layer.Neurons[index]
			delete neuron.InputsCount
			delete neuron.ActivationFunction
			delete neuron.Output
			neuron.Threshold = Math.round(1000*neuron.Threshold)/1000.0
			var num1 = 0.0;
      		for (var index2 = 0; index2 < neuron.Weights.length; ++index2)
      		{
      			neuron.Weights[index2] = Math.round(1000*neuron.Weights[index2])/1000.0
        		num1 += neuron.Weights[index2] * input1[index2];
        	}
      		var	num2 = 2.0 / (1.0 + Math.exp(-2.0 * (num1 + neuron.Threshold))) - 1.0		
        	numArray.push(num2);
		}
		input1 = numArray
	})
	return input1[0];
}

nr.nt = cleanN(network)

var foundT = 0;
var foundF = 0;
_.each(positive, function(w) {
	var res = calc(w, nr)
	if(res < 0.21) foundT++;
})
_.each(negative, function(w) {
	var res = calc(w, nr)
	if(res >= 0.21) foundF++;
})

console.log("Found " + foundT*1.0/positive.length + " " + foundF*1.0/negative.length + " = " + (foundT*1.0/positive.length + foundF*1.0/negative.length)/2.0)

var ser = JSON.stringify(nr)
fs.writeFileSync("net.json", ser);
fs.writeFileSync("net.zip", zlib.gzipSync(ser)); 

exit()
*/
var getTree = function() {
	var t1 = fs.readFileSync('tree8.txt').toString();
	var t2 = t1.split('\t').join('').split("If (feature ").join("x").split("Else (feature ").join("y").split("Predict: ").join("z").split("not in").join("w").split("in").join("v").split("<=").join('<').split(".0,").join(',').split(".0\r\n").join('\r\n').split(".0\n").join('\n').split(".0}").join('}')
	var t3 = _.reduce(t2.split('\r\n'), function(i, n) { return i.trim() + n.trim() + '\n';}, "")

	var vals = _.range(28);
	var t4 = _.reduce(t3.split('\n'), function(memo, line) { 
		line = line.trim()
		var n = line
		if(line.indexOf("x") === 0 || line.indexOf("y") === 0) {
	      var s = line.split(" ");
	      var values = s[2];
	      var op = s[1]
	      if (s[1] === "v" || s[1] === "w") {
	       		values = JSON.parse("[" + values.trim().replace("{","").replace("}","").replace(")","") + "]");
	       		var notValues = _.filter(vals, function(v) { return !_.contains(values, v)});
	       		if(values.length > notValues.length)
	       		{
	       			if(op === "v") 
	       				op = "w" 
	       			else 
	       				op = "v"
	       			n = s[0] + " " + op + " {" + notValues.join(',') + "})"
	       		}
	   		}
	      if (s[1] === "<" || s[1] === ">") {
	      	values = s[2]
	      	n = s[0] + " " + s[1] + " " + Math.round(parseFloat(values.trim().replace(")", "")) * 1000) / 1000 + ")"
	      }
		}
		return memo + n + '\n';
	}, "")	
	return t4;
}

var tree = getTree()
var minCode = 'function Filter(i){this.vData=i.vData,this.nHashFuncs=i.nHashFuncs,this.nTweak=i.nTweak||0,this.nFlags=i.nFlags}function MurmurHash3(i,t){function n(i,t){return(65535&i)*t+(((i>>>16)*t&65535)<<16)&4294967295}for(var e,r=i,a=0;a+4<=t.length;a+=4)e=t[a]|t[a+1]<<8|t[a+2]<<16|t[a+3]<<24,e=n(e,3432918353),e=e<<15|e>>>17,e=n(e,461845907),r^=e,r=r<<13|r>>>19,r=n(r,5),r=(65535&r)+27492+(((r>>>16)+1801774676&65535)<<16)&4294967295;switch(e=0,3&t.length){case 3:e^=t[a+2]<<16;case 2:e^=t[a+1]<<8;case 1:e^=t[a],e=n(e,3432918353),e=n(e<<15|e>>>17,461845907),r^=e}return r^=t.length,r=n(r^r>>>16,2246822507),r=n(r^r>>>13,3266489909),(r^r>>>16)>>>0}var bt=function(i,t){var n=t.split("x").join("If (feature ").split("y").join("Else (feature ").split("z").join("Predict: ").split("v").join("in").split("w").join("not in").split("\\n");at(i,n)},at=function(i,t){if(t&&0!=t.length){var n=t.shift().trim();if(0===n.indexOf("If ")||0===n.indexOf("Else")){0===n.indexOf("If ")?i.Tp="If":i.Tp="Else";var e=n.split(" ");i.Ft=e[2],i.Op=e[3];var r=e[4];"not"===e[3]&&(i.Op=i.Op+" "+e[4],r=e[5]),i.Values="in"==e[3]||"in"==e[4]?JSON.parse("["+r.trim().replace("{","").replace("}","").replace(")","")+"]"):[parseFloat(r.trim().replace(")",""))],i.LeftChild={},at(i.LeftChild,t),0===n.indexOf("If ")&&(i.RightChild={},at(i.RightChild,t))}0===n.indexOf("Predict:")&&(i.Tp="Prediction",i.Pr=n.split(" ")[1])}},pt=function(i,t){if("Prediction"===i.Tp)return i.Pr;if("If"===i.Tp||"Else"===i.Tp){var n=t[i.Ft],e=i.Values[0];if("<"===i.Op&&e>=n||">"===i.Op&&n>e)return pt(i.LeftChild,t);if(("in"===i.Op||"not in"==i.Op)&&((n=-1!=i.Values.indexOf(n))&&"in"==i.Op||!n&&"not in"==i.Op))return pt(i.LeftChild,t);if(null!=i.RightChild)return pt(i.RightChild,t)}return""},vw="aeiouy".split(""),nvw="bcdfghjklmnpqrstvwxz".split(""),fq=[.084,.018,.0397,.03,.1027,.01,.022,.026,.08,.0018,.009,.052,.029,.068,.0674,.029,.0016,.067,.097,.061,.033,.0091,.007,.0027,.018,.0031,.0233,0],q=[2.4499999999999997,1,1.6500000000000001,1.45,2.3499999999999996,1,1.05,1,2,1.05,1.45,1.2999999999999998,1.5,1.3499999999999999,1.95,1.3499999999999999,1.05,1.5,1.3499999999999999,1.4,2.1499999999999995,1.05,1.05,1,1.55,1.1,.9,-.10000000000000002],maxl=function(t,n){var e=0,r=0;for(i=0;i<t.length;++i)r=-1!=n.indexOf(t[i])?r+1:0,r>e&&(e=r);return e},cf=function(t){var n=t.split(""),e=0;for(i=0;i<n.length;++i)-1!=vw.indexOf(n[i])&&(e+=1);var r=0;for(i=0;i<n.length;++i)-1===vw.indexOf(n[i])&&(r+=1);var n=[n.length,e,r,r>0?1*e/r:1],e=[-1,27,0,-1,-1,-1],r=0,a=[],h=[],s=t.length;for(10>s&&(s=10),i=0;i<s;++i){var l=i>=t.length?27:t.charCodeAt(i)-97;i<t.length&&-58===l&&(l=26,0==i?e[0]=27:-1===e[0]&&(e[0]=a[i-1]),e[2]++,-1===e[3]&&(e[3]=i),0<=e[3]&&(e[4]=t.length-e[3]-1),-1!=e[3]&&(e[5]=(e[3]+1)/t.length)),a.push(l),12>i&&(r+=fq[l]),l=i<t.length-1?t.charCodeAt(i+1)-97:27,-58===l&&(l=26),h[i]=(q[0<i?a[i-1]:27]+q[a[i]]+q[l])/3}for(-1==e[0]&&(e[0]=27),-1!=e[3]&&e[3]<t.length-1&&(e[1]=a[e[3]+1]),i=0;10>i;++i)n.push(a[i]);for(i=0;6>i;++i)n.push(e[i]);for(n.push(maxl(t,vw)),n.push(maxl(t,nvw)),n.push(r/t.length),i=0;10>i;++i)n.push(h[i]);return n};Filter.prototype.hash=function(i,t){return MurmurHash3(4221880213*i+this.nTweak&4294967295,t)%(8*this.vData.length)},Filter.prototype.insert=function(i){for(var t=0;t<this.nHashFuncs;t++){var n=this.hash(t,i);this.vData[n>>3]|=1<<(7&n)}return this},Filter.prototype.contains=function(i){if(!this.vData.length)return!1;for(var t=0;t<this.nHashFuncs;t++){var n=this.hash(t,i);if(!(this.vData[n>>3]&1<<(7&n)))return!1}return!0};'

var learn = function(pos, neg) {
	bl = BloomFilter.create(190000, 0.2645);
	eval(minCode)

  	var decTree = {}
    bt(decTree, tree)

	_.each(pos, function(w) { 
      var p = pt(decTree, cf(w))
      if(p === "0") return;

	 w = w.substring(0,6)

	    bl.insert(new Buffer(w))
	});
	var m = new Buffer(bl.vData).toString('base64')
	console.log("Length: " + m.length/1024);

	return { vDataBuf : m, nHashFuncs: bl.nHashFuncs, nTweak : bl.nTweak, nFlags : bl.nFlags }
}

var positive = fs.readFileSync('utrueWords.txt').toString().toLowerCase().split('\r\n');
var negative = fs.readFileSync('ufalseWords.txt').toString().toLowerCase().split('\r\n');

var positiveFound = 0;
var negativeFound = 0;

var data = learn(positive, negative);

data.tree = tree

data.minCode = minCode

//console.log(data.tree)

var ser = JSON.stringify(data)
console.log("Learn data size: " + ser.length)
fs.writeFileSync("res.txt", ser);

fs.writeFileSync("r.zip", zlib.gzipSync(ser)); 

var zzz = fs.readFileSync('r.zip'); // optional
zzz = zlib.gunzipSync(zzz); 

//logic.init(new Buffer(deser));
logic.init(zzz);

var predictions = [[],[],[],[]];
_.each(positive, function(word) {
	if(logic.test(word)) positiveFound = positiveFound + 1;
	else predictions[1].push(word)
})

_.each(negative, function(word) {
	if(!logic.test(word)) {negativeFound = negativeFound + 1; predictions[2].push(word);}
	else { predictions[3].push(word)}
})

/*
_.each(fts, function(s) {
	var r = s.replace("(","").replace(")","").split(",")
	var a = r
	var w = a.shift()

	var cls = a.shift()
	var pred = a.shift()
	var b = logic.calcf(w)

	if(logic.test(w) != (pred === 1.0))
	{
		for(var i = 0; i < a.length; ++i)
		{
			var af = parseFloat(a[i])
			if(af != b[i])
			{
				console.log(w + " " + i + " " + a[i] + " " + b[i])
			}
		}
	}
	

	for(var i = 0; i < a.length; ++i)
	{
		var af = parseFloat(a[i])
		if(Math.round(10000*af)/10000.0 != Math.round(10000*b[i])/10000.0)
		{
			console.log(w + " " + i + " " + a[i] + " " + b[i])
			exit()
		}
	}
	
})
*/

console.log("True Positive: " + (positiveFound*100)/positive.length + "%");
console.log("True Negative: " + (negativeFound*100)/negative.length + "%");

var s1 = fs.statSync("r.zip")
var s2 = fs.statSync("logic-call-min.js")
var s3 = s1["size"] + s2["size"]
console.log(s1)
console.log(s2)
console.log(s3)
var score = (positiveFound*50)/positive.length + (negativeFound*50)/negative.length
console.log("Score: " + score + "%, size: " + s3 + ", left: " + (64*1024 - s3))

fs.writeFileSync("tN.txt", predictions[1]);
fs.writeFileSync("fP.txt", predictions[2]);
fs.writeFileSync("fN.txt", predictions[3]);
