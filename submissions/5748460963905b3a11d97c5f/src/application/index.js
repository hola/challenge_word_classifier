'use strict';

const validators = {
  apostrophe: require('./validators/apostrophe'),
  grams: require('./validators/grams'),
  forest: require('./validators/forest'),
  length: require('./validators/length'),
  sounds: require('./validators/sounds'),
  tag: require('./validators/tag')
};

const Validator = require('./validator');

module.exports = new Validator([

  new validators.apostrophe({
    name: 'apostrophe'
  }),

  new validators.tag({
    name: 'tag'
  }),

  new validators.length({
    name: 'length',
    min: 3,
    max: 15
  }),

  new validators.sounds({
    name: 'sounds',
    vowelsThreshold: 4,
    consonantsThreshold: 4
  }),

  new validators.grams({
    name: 'grams',
    lengthInner: 3,
    lengthBegin: 3,
    lengthEnd: 2
  }),

  new validators.forest({
    name: 'forest',
    trees: [
      {positions: [0, 1, 2, 3]}
    ]
  })
]);
