var mod;
module.exports = {
	init: function(data) {
		eval(data.toString('utf8').split('qqqqq')[1]);
		mod.init(data);
	},
	test: function(word) {
		return mod.test(word);
	}
};