module.exports = ht;
function ht(w, nw) {
    var chf = {};
    var total = 0;
    Object.keys(w).forEach(function (e) {
        for (var i = 0; i < e.length; i++) {
            var s = e.charCodeAt(i);
            if (chf[s] == null)
                chf[s] = w[e];
            else
                chf[s] += w[e];
            total += w[e];
        }
    })
    Object.keys(chf).forEach(function (e) {
        chf[e] = Math.round(9*total / chf[e])
    })
    function fv(s) {
        var m = [1, 1, 1, 1, 1,1]
        for (var i = 0; i < s.length; i++) {
            m.push(9/chf[s.charCodeAt(i)])
        }
        m.sort((a, b) => a - b)
        return m[0] * m[1] * m[2] * m[3] * m[4]*m[5]
    }

    var nk = Object.keys(nw);
    total = 0;
    var nwv = {}
    nk.forEach(function (e) {
        total += nw[e]
        nwv[e] = fv(e)
    })
    nk.sort(function (a, b) {
        return nwv[a] - nwv[b]
    });
    var mnt = 0;
    var threshold = 0;
    for (var j = 0; j < nk.length; j++) {
        mnt += nw[nk[j]];
        if (mnt > total * 0.0225) {
            threshold = nwv[nk[j]]
            break
        }
    }
    return {chf: chf, threshold: threshold}
}