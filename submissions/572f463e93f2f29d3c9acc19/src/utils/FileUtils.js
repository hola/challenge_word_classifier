var appConfig = require("../app.config.js").appConfig;
var INT_SIZE = appConfig.INT_SIZE;

exports.arrayToBuffer = function (arr) {
    var buffer = Buffer.allocUnsafe(INT_SIZE * arr.length);
    buffer.fill(0);
    for (var i = 0; i < arr.length; i++) {
        buffer.writeIntBE(arr[i], i * INT_SIZE, INT_SIZE);
    }
    return buffer;
}

exports.bufferToArray = function (buffer) {
    var arr = [];
    var len = 0;
    while (len < buffer.length) {
        arr.push(buffer.readIntBE(len, INT_SIZE));
        len += INT_SIZE;
    }
    return arr;
}
