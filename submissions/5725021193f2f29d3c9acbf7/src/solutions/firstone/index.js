'use strict';

exports.init = () => {
  // Do something
};

exports.test = word => {
  const sum = word.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return sum % 3 === 0;
};
