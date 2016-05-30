var base3 = [];
var base4 = [];
var base7 = [];

exports.init = function (buffer){
    var data = buffer.toString('utf8');
    data = JSON.parse(data);
    base3 = data['bd3'].split(';');
    var header;
    data['bd4'].split(';').forEach(function(entry) {
        header = entry.substr(0,2);
        for (var i = 2, len = entry.length; i < len; i = i + 2) {
            base4.push(header + entry.substr(i, 2));
        }
    });
    data['bd7'].split(';').forEach(function(entry) {
        header = entry.substr(0,4);
        for (var i = 4, len = entry.length; i < len; i = i + 3) {
            base7.push(header + entry.substr(i, 3));
        }
    });
};
exports.test = function (word){
    if(word.indexOf("'") != -1) {
        if(word.indexOf("'") < word.length-2 || word.indexOf("'s") == -1){
            return false;
        } else {
            word = word.substr(0, word.indexOf("'s"));   
        }
    }
    if(word.length > 19){
        return false;
    } else {
        if(word.length > 10){
            word = word.substr(word.length - 7, 7);
            for (var val of base7) {
                if(word.indexOf(val) == 0) {
                    return true;
                }
            }
        } else {
            if(word.length > 3) {
                /*base4.find(function(val){
                    return (word.indexOf(val)==0);
                });*/
                for (var val of base4) {
                    if(word.indexOf(val) == 0) {
                        return true;
                    }
                }
            } else {
                for (var val of base3) {
                    if(word.indexOf(val) == 0) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
};