var mycode = require('./mycode.js');
var async= require('async');
//var addRes=mycode.add(3,4);
//console.log(addRes);

const zlib = require('zlib');
const fs = require('fs');

//Reading the compressed file which should be gzipped
var databuffer = fs.readFileSync('./wordsMini.txt.gz')
var extractedData = zlib.gunzipSync(databuffer).toString('utf8');

//init the mini dictionary with the data from the file
mycode.init(extractedData);

/*
//----Test specific word--------------
var tmpres=mycode.test('marseillaise');
console.log(tmpres);
*/


//-------run spcific test----------
/*
var testScore=runtestCase('1436458037.js');
console.log('testScore is: '+testScore);
*/

//------Run all tests------

var testsResultsPath='./TestResults.txt'

try {
    fs.unlinkSync(testsResultsPath);    
}
catch (e){
    
}
    
    
var x=8;  
var y=505;
var z=2;
var l=10;
var k=30;

var avg=0;
var validTestCases=0;;
var funcArr = [];
var completed = 0;
var bestAvg=0;
var bestCombo={};



runWithSpecificParams(8,505,2,10,function(){
    printObj(bestCombo);    
});


//run on specific x one after anoterh and create compObj object
/*
async.whilst(
    function () { return completed <= 30; },
    
    function (callback) {
        
        runWithSpecificParams(x,y,z,l,k,function () {
            x++;
            y++;
            z++;
            l++;
            k++;
            completed++;
            callback(null);
        }, 1000);
    },
    function (err, n) {
       console.log('all spefic x cases run. bestCombo is:');
       printObj(bestCombo);
       console.log('Which gives avg: '+bestAvg);
       
       
    }
);
*/

function runWithSpecificParams(x,y,z,l,k ,callback) {
  

    fs.readdir('./Tests', function (err, files) {
        files.forEach(runtestCase);
        //console.log('validTestCases is: '+validTestCases);
        avg = (avg / validTestCases);
        console.log('avg score for all test cases is: ' + avg);
        if (bestAvg<avg){
            bestAvg=avg;
            bestCombo.x=x;
            bestCombo.y=y;
            bestCombo.z=z;
            bestCombo.l=l;
        }
        avg = 0;
        validTestCases = 0;
        callback();
    }
    );
}

function runtestCase(testNum) {


    pathToJs = './Tests/' + testNum;
    var curStat = fs.lstatSync(pathToJs);
    if (!curStat.isFile()) {
        //console.log(pathToJs+ ' is not a file path. returning');
        return;
    }
    validTestCases++;
    testNum = testNum.substring(0, testNum.length - 3);
    //console.log('--------------Running tets case: '+testNum+'\n');
    fs.writeFileSync(testsResultsPath,'--------------Running tets case: '+testNum+'\n', { flag : 'a'});
    
    var actualResultsStr = require(pathToJs);
    var actualResultsObj = JSON.parse(JSON.stringify(actualResultsStr));
    var myResultsObj = {};
    for (var prop in actualResultsObj) {
        myResultsObj[prop] = mycode.test(prop);
    }

    //chcek how different you results are compare to the yesyObject
    var total = 0, correct = 0, msg;
    for (var prop in actualResultsObj) {
        total++;
        if (actualResultsObj[prop] == myResultsObj[prop]) {
            correct++;
        }
        else {
            msg=('Wrong answer: correct result for ' + prop + ' is: ' + actualResultsObj[prop] + ' your result ' + myResultsObj[prop]+'\n');
            fs.writeFileSync('./TestResults.txt',msg, { flag : 'a'});
        }
    }

    var testSuccessRate=(correct / total) * 100; 
    msg=('---------------Test case: '+testNum+ ' correct answers are: ' + correct + ' of total ' + total + ' words. which is ' +testSuccessRate + '%------\n');
    //console.log(msg);
    fs.writeFileSync(testsResultsPath,msg, { flag : 'a'});
    avg+=testSuccessRate;
    return testSuccessRate;
    
}



/**
 * gets an ojbects and prints it,
 * the function gets an argument wheter to print the values or just the 'keys'
 */
function printObj(myObject, includeValues) {
    //by deafutl include the values as well
    if (typeof includeValues == "undefined") {
        includeValues = true

    }

    console.log('\n\This object is:');
    for (var propertyName in myObject) {
        if (includeValues) {
            console.log(propertyName + ': ' + myObject[propertyName]);
        }
        else {
            console.log(propertyName);
        }

    }
}


