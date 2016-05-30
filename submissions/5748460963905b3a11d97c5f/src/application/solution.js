'use strict';

const application = require('./index');

module.exports = {

  application: application,

  init(raw) {
    application.decode(raw.toString());
  },

  test(word) {
    return application.validate(word);
  }
};
