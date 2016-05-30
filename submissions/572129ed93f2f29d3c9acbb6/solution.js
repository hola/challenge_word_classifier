var f;

function init(buf) {
    f = buf.toString()
        .split(",")
        .map(x => x.split(":"))
        .map(x => [x[0], x[1], x[2].split("|")])
        .sort((a, b) => b[1] - a[1])
        .filter(x => x[1] > 300);
}

function test(word) {
     var result = true;
     var failed = [];

for (var j = 0; j < word.length - 2; j++) {
    var triplet = word.slice(j, j+3).toLowerCase();
    if (!f.find(x => x[0] === triplet)) {
        result = false;
        failed.push(false);
    } else {
        var found = f.find(x => x[0] === triplet);
        if (found[2].indexOf(j.toString()) === -1) {
            result = false;
            failed.push(false);
        }
    }
  }

  if (failed.length < 3) {
    result = true;
  }

  return result;
}

module.exports = {
    init,
    test
}