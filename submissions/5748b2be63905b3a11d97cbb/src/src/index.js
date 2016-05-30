exports.init = function (data) {
  exports.test = new Function(`${data.slice(0, __SEP__)} return tester`)()(data.buffer.slice(__SEP__));
};
