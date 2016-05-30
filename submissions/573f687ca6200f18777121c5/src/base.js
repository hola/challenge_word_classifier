var e = eval;
module.exports.test = function(word) {
    return _test(word);
};
module.exports.init = function(data) {
    var data = data.toString().split('~~');
    e(data[0]);
    _init(data);
};
