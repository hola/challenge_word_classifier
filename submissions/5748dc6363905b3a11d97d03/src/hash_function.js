function h(key) {
    var h = 2166136261;
    for (var i = length(key) - 1; i >= 0; i--) {
        h = (16777619 * h) ^ charCodeAt(key, i)
    }
    return h&((1<<31)-1)
}