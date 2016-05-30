var Node = function () {
  var self = {};
  self.mode = 0;
  self.submode = 0;
  self.str = '';
  self.expected = 0;
  self.pos = 0;
  self.minPos = 0;
  self.maxPos = 0;
  self.load = function(data, offset) {
    var header = data[offset];
    offset++;
    self.mode = header % 4;
    header >>= 2;
    self.submode = header % 4;
    header >>= 2;
    self.expected = header;
    self.pos = header;
    if (self.submode == 3) {
      if (self.pos == 1) {
        self.minPos = 0.0;
        self.maxPos = 0.4;
      } else if (self.pos == 2) {
        self.minPos = 0.25;
        self.maxPos = 0.75;
      } else if (self.pos == 3) {
        self.minPos = 0.6;
        self.maxPos = 1.0;
      } else {
        throw 'undefined submode';
      }
    }
    while (data[offset] != 0) {
      self.str = self.str.concat(String.fromCharCode(data[offset]));
      offset++;
    }
    offset++;
    return offset;
  }
  self.predict = function(word) {
    if(self.mode == 2) {
      if (self.submode == 1) {
        return word.slice(self.pos, self.pos + self.str.length) === self.str;
      } else if (self.submode == 2) {
        return word.slice(self.pos, self.pos - self.str.length) === self.str;
      } else if (self.submode == 3) {
        for (var i = 0; i < word.length; i++) {
          var myPos = i / (word.length - self.str.length + 1);
          if (myPos >= self.minPos && myPos < self.maxPos && word.slice(i, i + self.str.length) === self.str) {
            return true;
          }
        }
        return false;
      }
      throw 'undefined submode';
    } else if(self.mode == 1) {
      var cnt = 0;
      for (var i = 0; i < word.length; i++) {
        if (word.slice(i, i + self.str.length) === self.str) {
          cnt += 1;
        }
      }
      return cnt === self.expected;
    }
    throw 'undefined mode';
  }
  return self;
}
var DecisionTree = function() {
  var self = {};
  self.depth = 3;
  self.predicts = [];
  self.nodes = {};
  self.load = function(data, offset, prediction_packmode) {
    for (var i = 1; i < 8; i++) {
      var node = new Node();
      offset = node.load(data, offset);
      self.nodes[i] = node;
    }
    if (prediction_packmode == 0) {
      //bit mode
      var val = data[offset];
      offset++;
      for (var i = 7; i >= 0; i--) {
        self.predicts.push((val % 2) === 1 ? 1.0 : -1.0);
        val >>= 1;
      }
    } else {
      for (var i = 0; i < 8; i++) {
        self.predicts.push(data.readFloatLE(offset));
        offset += 4;
      }
    }
    return offset;
  }
  self.predict = function(word) {
    var curNode = 1;
    var curPred = 0;
    for (var i = 0; i < self.depth; i++) {
      if (self.nodes[i].predict(word)) {
        curNode = curNode * 2 + 1;
        curPred = curPred * 2 + 1;
      } else {
        curNode = curNode * 2;
        curPred = curPred * 2;
      }
    }
    return self.predicts[curPred];
  }
  return self;
}

var dt = DecisionTree();
console.log('done');
