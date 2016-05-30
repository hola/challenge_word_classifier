var fileSize = function(fileName) {
    var fs = require("fs");
    var stats = fs.statSync(fileName);
    var fileSizeInBytes = stats["size"];
    return fileSizeInBytes;
};
var baseSize = fileSize('./base.min.js');

while (true) {
    require('child_process').execSync('node hash_generator.js');
    if (baseSize + fileSize('./out.zip') < 65536) {
        break;
    }
}