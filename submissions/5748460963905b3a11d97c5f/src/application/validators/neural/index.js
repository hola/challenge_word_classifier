'use strict';

const Perceptron = require('./perceptron');

module.exports = function(options) {
  this.name = options.name;
  this.trainTimes = options.trainTimes;
  this.lengthThreshold = options.lengthThreshold;
  this.perceptron = new Perceptron(options.perceptron);

  this.abc = 'abcdefghijklmnopqrstuvwxyz';

  this.build = (dictionary, broken) => {
    this.log('Begin train network...');

    // train with broken words
    this.log('Train with broken words...');
    broken.forEach(string => {
      this.perceptron.train(this.binary(string), 0);
    });

    // train with dictionary
    this.log('Train with dictionary...');
    dictionary.forEach(word => {
      this.perceptron.train(this.binary(word), 1);
    });

    // train with broken words
    this.log('Train with broken words...');
    broken.forEach(string => {
      this.perceptron.train(this.binary(string), 0);
    });

    // retrain network
    if (this.trainTimes) {
      for (let i = 0; i < this.trainTimes; i++) {
        this.log(`Retrain (${i} of ${this.trainTimes})...`);
        this.perceptron.retrain();
      }
    }

    return this;
  };

  this.encode = () => {
    return this.perceptron.weights.join(';');
  };

  this.decode = raw => {
    // clear weights
    while (this.perceptron.weights.length) {
      this.perceptron.weights.pop();
    }

    // parse weights
    raw.split(';').forEach(weight=> {
      this.perceptron.weights.push(parseFloat(weight));
    });
  };

  this.validate = word => {
    console.log(word, this.perceptron.perceive(this.binary(word)));
    return this.perceptron.perceive(this.binary(word));
  };

  this.format = word => {
    return word;
  };

  this.binary = string => {
    let binary = [];
    for (let x = 0; x < this.lengthThreshold; x++) {
      for (let y = 0; y < this.abc.length; y++) {
        binary.push(string[x] === this.abc[y] ? 1 : 0);
      }
    }

    return binary;
  };

  this.log = message => {
    console.log(`[neural] ${message}`);
  };
};
