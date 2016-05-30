var d

exports.init = function(data) {
  d = JSON.parse(data)
}

exports.test = function(w) {
  var word = w.toLowerCase()
  for (var i = 0; i < word.length-1; i++) {
    if (!d.pos[i].a) {
      return false
    }
    var found = h(word.substring(i, i+2), d.pos[i].a)
    if (found !== (i >= d.switch)) {
      return false
    }
    if (i > d.switch+1) {
      var sample = word.substring(i-2, i+2)
      var f = false
      for (var j = 0; j < d.pos[i].b.length; j++) {
        var s = d.pos[i].b[j]
        var template = d.pos[i-2].a.substring(s.x, s.x+2) + d.pos[i].a.substring(s.y, s.y+2)
        if (template === sample) {
          f = true
          break
        }
      }
      if (!f) {
        return false
      }
    }
  }
  return true
}

function h(w, s) {
  for (var j = 0; j < s.length; j+=2) {
    if (w[0]===s[j] && w[1]===s[j+1]) {
       return true
    }
  }
  return false
}

