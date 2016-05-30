'use strict';

module.exports = function(validators) {

  this.validators = {};
  validators.forEach(validator => {
    this.validators[validator.name] = validator;
  });

  this.build = (dictionary, broken) => {
    console.log(`I have ${dictionary.length} words from dictionary and ${broken.length} broken words from cases.`);
    console.log('');

    validators.forEach(validator => {
      if (validator.build) {
        console.log(`Build data for ${validator.name} validator...`);
        validator.build(dictionary, broken);
        console.log('');
      }
    });

    console.log('Complete!');
    return this;
  };

  this.encode = () => {
    let data = {};
    validators.forEach(validator => {
      if (validator.encode) {
        data[validator.name] = validator.encode();
      }
    });

    return JSON.stringify(data);
  };

  this.decode = raw => {
    let data = JSON.parse(raw);
    validators.forEach(validator => {
      if (validator.decode && data[validator.name]) {
        validator.decode(data[validator.name]);
      }
    });
  };

  this.validate = word => {
    return validators.every(validator => {
      if (validator.validate(word)) {
        word = validator.format(word);
        return true;
      } else {
        return false;
      }
    });
  };

  this.format = raw => {
    return validators.reduce((word, validator) => {
      return validator.format(word);
    }, raw);
  };
};
