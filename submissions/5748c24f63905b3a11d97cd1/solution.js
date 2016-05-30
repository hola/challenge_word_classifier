var tD = ""; var rD = ""; exports.init = function init(d) { tD = d.toString('utf-8'); rD = tD2A(tD); }
function tD2A(_t) {
    var _d = []; var w = ""; for (c in _t) { switch (_t[c]) { case '.': _d.push(w); break; case '-': w = w.substr(0, w.length - 1); break; default: w += _t[c]; } }
    return _d.sort();
}
function pPI(w) { w = w.toString().toLowerCase(); if (w.length > 2 && w.substr(w.length - 2, 2).indexOf("'s") == 0) w = w.substr(0, w.length - 1); return w; }
function tH(_w) {
    var o = 'a'.charCodeAt(0) - 1; var p = ("'" == _w[0] ? 0 : _w.charCodeAt(0) - o); var _r = p; for (c in _w) {
        if (0 == c) { continue; }
        var cr = ("'" == _w[c] ? 0 : _w.charCodeAt(c) - o); _r += ((1 + p) * (1 + cr)); p = cr;
    }
    _r %= 27; _r = (0 == _r ? "'" : String.fromCharCode(o + _r)); return _r;
}
module.exports.test = function test(_w) {
    _w = pPI(_w); var wl = _w.length; if (wl < 1) { return false; }
    if (1 == wl) { return true; }
    for (i in rD) { var lI = rD[i].length; if (lI > wl) continue; var cL = Math.min(lI, wl) - 1; if (_w.substr(0, cL) == rD[i].substr(0, cL) && rD[i][cL] == tH(_w.substr(cL, wl - cL))) { return true; } }
    return false;
}