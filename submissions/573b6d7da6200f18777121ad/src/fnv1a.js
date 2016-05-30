module.exports = function fnv1a(str) {
  var h = 0x811c9dc5;

  for (var i = 0, l = str.length; i < l; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }

  return h >>> 0;
}
