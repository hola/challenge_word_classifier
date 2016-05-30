module.exports = function (stop) {
    var mainArr = [];

    function recWhile() {
        var arr = arguments[0] || [];
        
        if (arr.length < stop) {
            for (var i = 0; i < 2; i++) {
                recWhile(arr.concat(i));
            }
        } else {
            mainArr.push(arr);

            arr = [];
        }
    }

    recWhile();
    
    return mainArr;
};