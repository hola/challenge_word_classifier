/*
	Hola Dictionary Competition
	Main test file
	(c) Andrey Gershun, 2016
*/
const fs = require('fs');
const htest = require('./htest');

var buf; 

// Step 1: Generate dictionary
if(false) {
	buf = require('./gen03').generate();
	fs.writeFileSync('data.dat',buf);
}

// Step 2: Run tests
if(true) {
	// Test the solution
	var solution = require('./msol06');
	fs.readFile('data.dat',function(err,buf){
		console.log('all.length',buf.length+1903);
		solution.init(buf);
		htest.test(solution.test);
	});
}


