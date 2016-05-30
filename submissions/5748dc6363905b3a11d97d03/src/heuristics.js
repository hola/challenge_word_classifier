var charCodeAt = (s, i) => {preventInlining(); return s.charCodeAt(i)}
var length = s => {preventInlining(); return s.length}

function he(w) {
    var m = [1, 1, 1, 1, 1, 1]
    var c = 0
    var s = m
    for (var i = 0; i < length(w); i++) {
        if (s[0] == charCodeAt(w, i))
            s.push(1)
        else
            s = [charCodeAt(w, i)]
        c = 'aeoiuyj'.indexOf(w.charAt(i)) < 0 ? c + 1 : 0
        if (s[0] == 39 || length(w) > 12 || length(s) > 2 || c > 4)
            return false
        m.push(9 / chf[charCodeAt(w, i)])
    }
    m.sort((a, b) => a - b)
    return m[0] * m[1] * m[2] * m[3] * m[4] * m[5] > threshold
}