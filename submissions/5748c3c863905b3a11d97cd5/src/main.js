/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var fs = require('fs');
var array = fs.readFileSync('words_35.txt').toString().split("\n");
var matches = [];
var table = [];
var wwords = {};
var doubles = [];

console.log(array.length);

for(var i in array){
    array[i] = array[i].toLowerCase();    
}

for(var i = array.length - 1; i >= 0; i--){
    if(array[i].indexOf('\'s') !== -1){
        doubles.push(array.splice(i, 1));
        //i--;        
    }
    if(array[i].indexOf('\'d') !== -1){
        array.splice(i, 1);
    }
}
console.log(array.length);
console.log(doubles.length);
for(var i in array){
    if(i % 1000 === 0) console.log("Procress", i);
    var word = {};

    word.word = array[i];
    if(array[i].length >= 4){
        word.matches = {};
        word.matches = matchCount(array[i]);
    }
    matches.push(word);
}

function matchCount(word){
    var result = {
        include : [],
        define : []
    };
    for(var j in table){
        if(word.indexOf(table[j]) !== -1){
            result.include.push(table[j].toString());
        }
    }
    var done = false;
    for(var k in array){        
        if(array[k] === word) continue;
        if(array[k].indexOf(word) !== -1){
            result.define.push(array[k].toString());
            if(done === false){
                table.push(word);
                done = true;
            }
            
        }
    }
    return result;
}
/*
matches.sort(function(a,b){
    if(a.count < b.count) return -1;
    if(a.count > b.count) return 1;
    return 0;
});*/
var output = {
    table:table,
    matches:matches,
    doubles:doubles
};
fs.writeFileSync("data_35.dat" , JSON.stringify(output));

console.log(matches);