///**
// *
// * Copyright (c) 2016 Alan Adrian Campora.
// * All rights reserved.
// */
//

var aRegex = [];

exports.init = function (buffer) {


    var data = buffer.toString('utf8').split(',');

    for (var i = 0; i < data.length; i++) {

        var regex = data[i];

        //removing quotes
        var newRegex = regex.substr(1, regex.length - 2);

        if (i === 0) {
            newRegex = newRegex.substr(1, newRegex.length - 1);
        }
        if(i===data.length-1){
            newRegex = newRegex.substr(0, newRegex.length - 1);
        }

        aRegex.push(new RegExp("^" + newRegex + "$"));
    }

};

exports.test = function (word) {

    var founded = aRegex.map(function (regex) {
        return regex.test(word);
    });

    var results = founded.filter(function (result) {
        return result;
    });

    return results.length >= 1;
};
