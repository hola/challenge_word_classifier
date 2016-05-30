const zlib = require('zlib');
const fs = require('fs');
const needle = require('needle');
/*
var tc=[
	require('./tc569010221.js').words,
	require('./tc1031160166.js').words
	];
*/

function randomInt (low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function getTestCase(tcn,cb) {
	//https://hola.org/challenges/word_classifier/testcase/787535822
	//https://hola.org/challenges/word_classifier/testcase
	if (tcn==0) tcn=randomInt(100000000,999999999);
	needle.get('https://hola.org/challenges/word_classifier/testcase/'+tcn,{'parse_response' :false}, function(error, response) {
	if (!error && response.statusCode == 200)
		console.log(tcn);
		var rb=response.body;
	    console.log(rb);
	    var fn='./tc' + tcn + '.js';
		fs.writeFile(fn , 'exports.words=' + rb,{encoding:'utf8'}, function (err){
			console.log(fn + "  saved.");
			var tcWords=require(fn).words;
			cb(tcWords,tcn);
		});

	});

}

var solver=require('./solver.js');
var solverV2=require('./solverV2.js');

//'./LG8.z'
function readSupportBuffer(fn) {
	var zbuf=fs.readFileSync(fn);
	var buf=zlib.gunzipSync(zbuf);
	console.log(fn + " zbuf.length:",zbuf.length, " =UZ> ",buf.length + " expanded.");
	return buf;
}

function runTC(tc,solver,verbose){
	var score={trueNegative:{count:0,words:[]},
			   truePositive:{count:0,words:[]},
			   falseNegative:{count:0,words:[]},
			   falsePositive:{count:0,words:[]}}

	for (var tcw in tc) {
		if (tc.hasOwnProperty(tcw)) {
			if (verbose) console.log('Testing ' + tcw);
			var r=solver.test(tcw);
			if (!r && !tc[tcw]) {score.trueNegative.count++; score.trueNegative.words.push(tcw);}
			if (r  && !tc[tcw]) {score.falsePositive.count++;score.falsePositive.words.push(tcw);}
			if (!r && tc[tcw]) {score.falseNegative.count++;score.falseNegative.words.push(tcw);}
			if (r && tc[tcw]) {score.truePositive.count++;score.truePositive.words.push(tcw);}
		}
	}
	return score;
}

function printscore(score) {
	for (var rt in score) {
		console.log(rt+" " + JSON.stringify(score[rt].count));	
	}

	for (var rt in score) {
		if (rt[0]=="f") {
			console.log(rt+" " + JSON.stringify(score[rt].words) + '\n');	
		}
	}

	console.log("Quality: " + JSON.stringify((score.truePositive.count + score.trueNegative.count) / (score.truePositive.count + score.trueNegative.count + score.falsePositive.count + score.falseNegative.count)));	

}

function runIthTestOfN(solver,solver2,tcn,i,N) {
	if (i>N) return;
	getTestCase(tcn,function(test_case_words,tcn){
		console.log(tcn);
		printscore(runTC(test_case_words,solver,false));
		printscore(runTC(test_case_words,solver2,false));
		console.log('---------------------');
		runIthTestOfN(solver,solver2,tcn+1,i+1,N);
	})
	
}

var supportBuff=readSupportBuffer('./L1.z');
//var supportBuffV2=readSupportBuffer('./L1V2.z');
console.log('Initialzing solver');
solver.init(supportBuff);
//solverV2.init(supportBuffV2);

runIthTestOfN(solver,solver,123456789,1,10);
/*
printscore(runTC(tc[0],solver,false));
printscore(runTC(tc[1],solver,false));
*/