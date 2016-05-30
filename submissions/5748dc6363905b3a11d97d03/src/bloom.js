module.exports = bloom;
function bloom(w, nonwords, h, d) {
    var nw = {}
    var b = 0;
    Object.keys(nonwords).forEach(function (e) {
        if (nonwords[e] >= 3) {
            if (nw[e] == null) {
                nw[e] = nonwords[e];
            } else {
                nw[e] += nonwords[e];
            }
        } else {
            b += nonwords[e];
        }
    })
    b /= d;
    var a = {}
    Object.keys(w).forEach(function (wk) {
        var hc = h(wk) % d;
        if (a[hc] == null) {
            a[hc] = w[wk] - b
        } else {
            a[hc] += w[wk];
        }
    })
    Object.keys(nw).forEach(function (nk) {
        var hc = h(nk) % d;
        if (a[hc] != null) {
            a[hc] -= nw[nk];
        }
    })
    var buffer=Buffer.alloc(Math.ceil(d/8)).fill(0)
    Object.keys(a).forEach(function (ak) {
        if (a[ak] > 0) {
            var hash = parseInt(ak)
            buffer[hash>>>3] |= 1 << hash % 8
        }
    })
    return buffer
}

