'use strict'

const generate_all_trigrams          = require('./solution').generate_all_trigrams
const generate_trigrams              = require('./solution').generate_trigrams
const alphabet                       = require('./solution').alphabet

const fs   = require('fs')
const zlib = require('zlib')

// Get the list of words
let words = fs.readFileSync('./words.txt', 'utf8').split('\n')

// Lowercase
words = words.map(word => word.toLowerCase())

// Remove "'s"es
words = words.map(word =>
{
	// Drop everything after apostrophes
	// and allow apostrophes only in "'s" cases

	const apostrophe_index = word.indexOf("'")
	if (apostrophe_index >= 0)
	{
		// Allow apostrophes only in "'s" cases
		if (word.substring(apostrophe_index) !== "'s")
		{
			return ''
		}

		// Drop everything after apostrophe (including the apostrophe)
		word = word.substring(0, apostrophe_index)
	}

	return word
})

// Filter out blank words
words = words.filter(word => word)

// Trigram occurence count (across the whole dictionary)
const trigram_frequency = generate_all_trigrams().reduce((stats, trigram) =>
{
	stats[trigram] = 0
	return stats
},
{})

// Count trigram frequency

// For each word
for (let word of words)
{
	// For each trigram of the word
	for (let trigram of generate_trigrams(word))
	{
		// Increment frequency for this trigram
		trigram_frequency[trigram] = trigram_frequency[trigram] + 1
	}
}

const trigram_count = Object.keys(trigram_frequency).length

// Javascript numbers are always 64-bit doubles
const buffer = Buffer.alloc(trigram_count * 8)

let offset = 0
for (let trigram of generate_all_trigrams())
{
	buffer.writeUInt32LE(trigram_frequency[trigram], offset)
	offset += 2
}

// Write trigram frequency file to disk
fs.writeFileSync('./solution/data', buffer)
fs.writeFileSync('./solution/data.gz', zlib.gzipSync(buffer))

console.log('Trigram frequency dump file size:', fs.statSync('./solution/data').size / 1024, 'KiB')
console.log('Gzipped:', fs.statSync('./solution/data.gz').size / 1024, 'KiB')