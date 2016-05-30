var appConfig = require('../app.config.js').appConfig;
// var powerOfP = [];
// powerOfP.push(1);
//
// for (var i=1;i<32;i++){
//     powerOfP.push(powerOfP[i-1] * P);
// }

function hash(s){
    var P = 31;
    var MODULO = 1000000009;
    var h = 0;
    for (var i=0;i<s.length;i++)
    {
        var c = s[i].toUpperCase();
        if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(c) === -1) continue;
        h = (h * P + (c.charCodeAt(0) - 'A'.charCodeAt(0))) % MODULO;
    }
    // console.log(s, h);
    return h;
}

module.exports = hash;
