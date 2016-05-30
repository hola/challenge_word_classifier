
exports.set = function (buffer, offset) {
    var oldByte = buffer[bitloc(offset)[0]];
    var newByte = (0x1 << bitloc(offset)[1]) | oldByte;
    buffer.writeUInt8(newByte, bitloc(offset)[0]);
}

exports.test = function (buffer, offset) {
    var byte = buffer[bitloc(offset)[0]];
    return byte & (0x1 << bitloc(offset)[1]);
}

exports.countTrue = function (buf) {
    var count = 0;
    for (var i=0;i<buf.length;i++){
        for (var j=0;j<8;j++) {
            count += ((buf[i] & (0x1 << j))>>j) 
        }
    }
    return count
}

function bitloc(offset) {
    return [Math.floor(offset/8), offset % 8];
}