const mongoose = require('mongoose');

var TestWord = new mongoose.Schema({
	word: { type: String, required: true },
	page: { type: Number, required: true },
	idx: { type: Number, required: true },
	isBook: { type: Boolean, required: true },
});

TestWord.index({ page: 1, idx: 1 }, { unique: true });

module.exports = mongoose.model('TestWord', TestWord, 'TestWord');
