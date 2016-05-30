const mongoose = require('mongoose');

var BookWord = new mongoose.Schema({
	word: { type: String, required: true },
});

BookWord.index({ word: 1 }, { unique: true });

module.exports = mongoose.model('BookWord', BookWord, 'BookWord');
