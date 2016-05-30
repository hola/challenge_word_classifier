exports.init = function (data) {
  exports.test = new Function(`${data.slice(0, 4665)} return tester`)()(data.buffer.slice(4665));
};
