var table;

function hash(w){
  var h = 7
  for (var i = 0; i < w.length; i++) {
    var n = w.charCodeAt(i)
    h = (31 * h + n) % 500001
  }
  return h
}

function endsWith(w, s){return w.indexOf(s, w.length - s.length) !== -1}
function substr(w, l){return w.substring(0, w.length - l)}

function getTabVal(i){
  var c = Math.floor(i / 4)
  var r = i - 4 * c
  var cha = table[c]
  var bin = parseInt(cha, 16).toString(2)
  bin = ("0000" + bin).substr(-4,4)
  return bin[r] == 0 ? false : true
}

function init(data){table = data.toString('hex');}

function test(w){
  if (w.length == 1)
    return true

  w = w.toLowerCase().trim()
  var words = [w]
  var base

  if (endsWith(w, "'s") && !endsWith(w, "'s's")) {
    base = substr(w, 2)
    words.push(base + "+")
    words.push(base + "=")
  } else if (endsWith(w, "ses")) {
    base = substr(w, 2)
    words.push(base + "=")
  } else if (endsWith(w, "s")) {
    base = substr(w, 1)
    words.push(base)
    words.push(base + "=")
  } else {
    var suffix = ['ed', 'ing', 'ingly', 'es', 'ion', 'ional', 'ionally', 'ions']
    for (var i = suffix.length - 1; i >= 0; i--) {
      var s = suffix[i]
      if (endsWith(w, s)) {
        base = substr(w, s.length)
        words.push(base)
        words.push(base + "e")
      }
    }
  }

  for (var i = words.length - 1; i >= 0; i--) {
    var w = words[i]
    if (getTabVal(hash(w))) {
      return true
    }
  }

  return false
}

exports.init = init
exports.test = test
