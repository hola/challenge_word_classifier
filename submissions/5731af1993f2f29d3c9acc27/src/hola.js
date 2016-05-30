"use strict"
module.exports = {
    data: null,

    init: function (buf) {
        this.data = buf.toString('ascii').split('\n');
    },

    test: function (word) {
        var bits = this.data;
        var size = 742592;
        var seed = Math.floor(0.1 * 64) + 64;
        var result = 1;
        word = word.toLowerCase();
        if (word.indexOf("'") !== -1) {
            if ((word.length - word.indexOf("'")) > 2) {
                return false;
            }
            word = word.substring(word.indexOf("'"));
        }
        for (var i = 0; i < word.length; ++i) {
            result = (seed * result + word.charCodeAt(i)) & 0xFFFFFFFF;
        }
        if(result<0){
            result=Math.pow(result,2)
		}
        result = result % size ;
        return Boolean(((bits[Math.floor(result / 64)]) >>> (result % 64)) & 1);
    }
};
