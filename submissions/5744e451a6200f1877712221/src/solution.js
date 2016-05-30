var dictionary = {};
var count = 0;

exports.test = function(word) {
    count++;
    if (!dictionary[word]) dictionary[word] = 1;
    else dictionary[word]++;
    return dictionary[word] > count / 2 / 661686 / 1.75;
};