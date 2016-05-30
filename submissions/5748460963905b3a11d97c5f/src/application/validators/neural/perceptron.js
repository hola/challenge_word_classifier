'use strict';

module.exports = function(options) {
  options || (options = {});

  var debug = 'debug' in options ? options.debug : false;
  var weights = 'weights' in options ? options.weights.slice() : [];
  var threshold = 'threshold' in options ? options.threshold : 1;

  var learningrate;
  if (!('learningrate' in options)) {
    learningrate = 0.1
  } else {
    learningrate = options.learningrate;
  }

  var data = [];

  var api = {
    weights: weights,
    retrain: function() {
      var length = data.length;
      var success = true;
      for (var i = 0; i < length; i++) {
        var training = data.shift();
        success = api.train(training.input, training.target) && success
      }
      return success
    },
    train: function(inputs, expected) {
      while (weights.length < inputs.length) {
        weights.push(Math.random())
      }
      // add a bias weight for the threshold
      if (weights.length == inputs.length) {
        weights.push('bias' in options ? options.bias : 1)
      }

      var result = api.perceive(inputs);
      data.push({input: inputs, target: expected, prev: result});

      if (debug) {
        console.log('> training %s, expecting: %s got: %s', inputs, expected, result)
      }

      if (result == expected) {
        return true
      }
      else {
        if (debug) {
          console.log('> adjusting weights...', weights, inputs);
        }
        for (var i = 0; i < weights.length; i++) {
          var input = (i == inputs.length) ? threshold : inputs[i];
          api.adjust(result, expected, input, i)
        }
        if (debug) {
          console.log(' -> weights:', weights)
        }
        return false
      }
    },

    adjust: function(result, expected, input, index) {
      var d = api.delta(result, expected, input, learningrate);
      weights[index] += d;
      if (isNaN(weights[index])) {
        throw new Error('weights[' + index + '] went to NaN!!')
      }
    },

    delta: function(actual, expected, input, learnrate) {
      return (expected - actual) * learnrate * input
    },

    perceive: function(inputs, net) {
      var result = 0;
      for (var i = 0; i < inputs.length; i++) {
        result += inputs[i] * weights[i]
      }
      result += threshold * weights[weights.length - 1];
      return net ? result : result > 0 ? 1 : 0
    }
  };

  return api;
};
