module.exports = {
	init: init, 
	test: test, 
};

var dict;
var boost;

var max_pooling = function (input, size, step) {
  var output = [];
  for (var i = 0; i + size <= input.length; i += step) {
    output.push([]);
  }
  for (var i = 0; i < input[0].length; i++) {
    var idx = 0;
    for (var j = 0; j + size <= input.length; j += step) {
      output[idx].push(input[j][i]);
      for (var k = 1; k < size; k++) {
        output[idx][i] = Math.max(output[idx][i], input[j + k][i]);
      }
      idx += 1;
    }
  }
  return output;
}

var linear = function () {
  var self = {};
  self.weights = [];
  self.in_n = 0;
  self.out_n = 0;
  self.bias = [];
  self.load = function (data, offset, in_n, out_n) {
    self.in_n = in_n;
    self.out_n = out_n;
    for (var i = 0; i < in_n ; i++) {
      self.weights.push([]);
      for (var j = 0; j < out_n; j++) {
        self.weights[i].push(data.readFloatLE(offset));
        offset += 4;
      }
    }
    for (var i = 0; i < out_n; i++) {
      self.bias.push(data.readFloatLE(offset));
      offset += 4;
    }
    return offset;
  }
  self.forward = function (input) {
    var output = [];
    for (var i = 0; i < self.out_n; i++) {
      output.push(self.bias[i]);
    }
    for (var i = 0; i < self.in_n; i++) {
      for (var j = 0; j < self.out_n; j++) {
        output[j] += input[i] * self.weights[i][j];
      }
    }
    return output;
  }
  return self;
}

var tanh = function (input) {
  var output = [];
  for (var i = 0; i < input.length; i++) {
    if (typeof input[i] == 'number') {
      output.push(Math.tanh(input[i]));
    } else {
      output.push([]);
      for (var j = 0; j < input[i].length; j++) {
        output[i].push(Math.tanh(input[i][j]));
      }
    }
  }
  return output;
}

var Filter = function () {
  var self = {};
  self.width = 0;
  self.depth = 0;
  self.bias = [];
  self.weights = [];
  self.build_weight = function (width, depth) {
    self.width = width;
    self.depth = depth;
    for (var i = 0; i < width; i++) {
      self.weights.push([]);
    }
  }
  self.load_weight = function (data, offset, i) {
    self.weights[i].push(data.readFloatLE(offset));
    offset += 4;
    return offset;
  }
  self.load_bias = function (data, offset) {
    self.bias.push(data.readFloatLE(offset));
    offset += 4;
    return offset;
  }
  self.forward = function (input) {
    var output = [];
    for (var i = 0; i < self.bias.length; i++) {
      var val = self.bias[i];
      for (var j = 0; j < self.width; j++) {
        for (var k = 0; k < self.depth; k++) {
          val += self.weights[j][k] * input[i + j][k];
        }
      }
      output.push(val);
    }
    return output;
  }
  return self;
}

var convolution = function () {
  var self = {};
  self.width = 0;
  self.depth = 0;
  self.filters = [];
  self.load = function(data, offset, width, depth, n, bw) {
    self.width = width;
    self.depth = depth;
    for (var i = 0; i < n; i++) {
      var filter = Filter();
      filter.build_weight(width, depth);
      self.filters.push(filter);
    }
    for (var i = 0; i < width; i++) {
      for (var j = 0; j < depth; j++) {
        for (var k = 0; k < n; k++) {
          offset = self.filters[k].load_weight(data, offset, i, j);
        }
      }
    }
    for (var i = 0; i < bw; i++) {
      for (var j = 0; j < n; j++) {
        offset = self.filters[j].load_bias(data, offset);
      }
    }
    return offset;
  }
  self.forward = function(input) {
    var output = []; //input.length - self.width + 1 x self.filters.length
    for (var i = 0; i < input.length - self.width + 1; i++) {
      output.push([]);
    }
    for (var i = 0; i < self.filters.length; i++) {
      var tmp = self.filters[i].forward(input);
      for (var j = 0; j < output.length; j++) {
        output[j].push(tmp[j]);
      }
    }
    return output;
  }
  return self;
}

var transform = function (word) {
  var output = [];
  for (var i = 0; i < 24; i++) {
    output.push([]);
    for (var j = 0; j < 27; j++) {
      output[i].push(0);
    }
  }
  for (var i = 0; i < word.length; i++) {
    var code = word.charCodeAt(i);
    if (code >= 97 && code <= 122) {
      output[i][code - 97] = 1;
    } else {
      output[i][26] = 1;
    }
  }
  return output;
}

var flatten = function (input) {
  var output = [];
  for (var i = 0; i < input.length; i++) {
    for (var j = 0; j < input[i].length; j++) {
      output.push(input[i][j]);
    }
  }
  return output;
}

function network() {
  var self = {};
  self.cnn1 = convolution();
  self.cnn2 = convolution();
  self.linear1 = linear();
  self.linear2 = linear();
  self.linear3 = linear();
  self.load = function (data, offset) {
    offset = self.cnn1.load(data, offset, 5, 27, 8, 20);
    offset = self.cnn2.load(data, offset, 3, 8, 8, 8);
    offset = self.linear1.load(data, offset, 32, 8);
    offset = self.linear2.load(data, offset, 8, 8);
    offset = self.linear3.load(data, offset, 8, 1);
    return offset;
  }
  self.forward = function(word) {
    var tmp = transform(word);
    tmp = self.cnn1.forward(tmp);
    tmp = tanh(max_pooling(tmp, 2, 2));
    tmp = self.cnn2.forward(tmp);
    tmp = tanh(max_pooling(tmp, 2, 2));
    tmp = tanh(self.linear1.forward(flatten(tmp)));
    tmp = tanh(self.linear2.forward(tmp));
    tmp = tanh(self.linear3.forward(tmp));
    return tmp[0];
  }
  return self;
}

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

function init(data)
{
  boost = booster();
  var offset = boost.load(data, 0);
  var ary = data.slice(offset, data.length).toString().split("\n");
  dict = {};
  for (var i=0; i<ary.length; i++)
  {
    if (ary[i].length > 0)
    {
      dict[ary[i]] = true;
    }
  }
}

function test(word)
{
  word = word.toLowerCase();
  if (word.length <= 2)
  {
    if (word.indexOf("'") >= 0)
    {
      return false;
    }
    return word.length == 1 || (word.length == 2 && (dict[word] ? false : true));
  }
  if (word.length <= 24) {
    return boost.predict(word);
  }
  return dict[word] ? true : false;
}

