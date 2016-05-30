exports.test = function (w) {
    try {
        var s = stem.of(w)
        var hash = h(s) % div
        return he(s) && ((d[hash >>> 3] & (1 << (hash % 8))) != 0)
    } catch (e) {
        return false
    }
}
