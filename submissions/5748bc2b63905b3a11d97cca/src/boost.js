module.exports = {
  booster: booster,
}

var network = require('./layers.js').network;

function booster() {
  var self = {};
  self.n = 5;
  self.weights = [];
  self.classifiers = [];
  self.predict = function(word) {
    var val = 0.0;
    for (var i = 0; i < self.n; i++) {
      val += self.weights[i] * self.classifiers[i].forward(word);
    }
    return val >= 0.0;
  }
  self.load = function(data, offset) {
    for (var i = 0; i < self.n; i++) {
      self.weights.push(data.readFloatLE(offset));
      offset += 4;
    }
    for (var i = 0; i < self.n; i++) {
      var net = network();
      offset = net.load(data, offset);
      self.classifiers.push(net);
    }
    return offset;
  }
  return self;
}
