var d = {};

exports.test = function (w) {
	for (var i = 1; i < w.length; i++) {
		if (!this.d[w[i-1]].hasOwnProperty(w[i])) {
			return false;
		}
		if (i + 1 >= w.length) {
			if (w[i-1] == "'") {
				if (this.d[w[i-2]]['end'].hasOwnProperty(w[0]) && this.d[w[i-2]]['length'].hasOwnProperty(w.length - 2)) {
					return true;
				} else {
					return false;
				}
			}

			if (this.d[w[i]]['end'].hasOwnProperty(w[0]) && this.d[w[i]]['length'].hasOwnProperty(w.length)) {
				return true;
			} else {
				return false;
			}
		}
	}
	return false;
};

exports.init = function (dd) {
	this.d = JSON.parse(dd);
};
