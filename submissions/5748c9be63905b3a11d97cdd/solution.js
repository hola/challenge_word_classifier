var buckets = 7;
var wordlen = 7;
var dictcnt = 1;

var data;

exports.init = function(idata) {
  data = idata;
}

exports.test = function(word) {
  if (word.length > 15) {
    return false;
  }

  var tc = word.replace(/[aeiouy]/g, '0').replace(/[^0aeiouy]/g, '1');
  if (tc.indexOf('11111') > -1) {
    return false;
  }

  if ((word.indexOf('\'') > -1) && !word.endsWith('\'s')) {
    return false;
  }

  var block_start = 0;
  for (var k = 0; k < dictcnt; k++) {
    var i, j;
    var tw = [];
    for (i = 0, j = 0; i < wordlen;) {
      var cc = word.charCodeAt(j++) - 96;
      cc = cc ? (cc < 0) ? 0 : cc : 27;
      if (data[block_start + cc]) {
        tw[i++] = data[block_start + cc] - 1;
      }
    }

    block_start += 28;
    var block_offset = 0;
    var block_size = buckets;

    for (i = 0; i < wordlen; i++) {
      var pos = block_offset + tw[i];
      if (!data[block_start + pos]) {
        return false;
      }

      var cnt_one = 0;
      for (j = 0; j < block_size; j++) {
        if (j == pos) {
          block_offset = cnt_one * buckets;
        }

        if (data[block_start + j]) {
          cnt_one++;
        }
      }
      block_start += block_size;
      block_size = cnt_one * buckets;
    }
  }
  return true;
}
