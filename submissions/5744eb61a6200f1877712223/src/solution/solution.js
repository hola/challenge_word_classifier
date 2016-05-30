'use strict'

const alphabet = 'abcdefghijklmnopqrstuvwxyz'

exports.alphabet = alphabet

let trigram_probability

const trigram_probability_threshold = 0.01
const word_probability_threshold = 0.002

exports.init = function(buffer)
{
	const trigrams = generate_all_trigrams()
	const trigram_frequency = {}

	let offset = 0
	while (offset < buffer.length)
	{
		trigram_frequency[trigrams.shift()] = buffer.readUInt16LE(offset)
		offset += 2
	}

	// Generate trigram probabilities from frequencies
	trigram_probability = generate_trigram_probabilities(trigram_frequency)
}

// Generates trigram probabilities from frequencies
function generate_trigram_probabilities(trigram_frequency)
{
	const trigram_probability = {}

	for (let a of ' ' + alphabet)
	{
		let second_letter_alphabet = alphabet

		if (a === ' ')
		{
			second_letter_alphabet += ' '
		}

		for (let b of second_letter_alphabet)
		{
			let bigram_count = 0

			let third_letter_alphabet = alphabet

			if (b !== ' ')
			{
				third_letter_alphabet += ' '
			}

			for (let c of third_letter_alphabet)
			{
				const trigram = a + b + c

				// if (trigram_frequency[trigram])
				// {
					bigram_count += trigram_frequency[trigram]
				// }
			}

			for (let c of third_letter_alphabet)
			{
				const trigram = a + b + c

				if (bigram_count)
				{
					trigram_probability[trigram] = trigram_frequency[trigram] / bigram_count
				}
				else
				{
					trigram_probability[trigram] = 0
				}
			}
		}
	}

	return trigram_probability
}

exports.test = function(word)
{
	// Lowercase
	word = word.toLowerCase()

	// Drop everything after apostrophes
	// and allow apostrophes only in "'s" cases

	const apostrophe_index = word.indexOf("'")
	if (apostrophe_index >= 0)
	{
		// Allow apostrophes only in "'s" cases
		// and in special cases of apstrophe word exceptions
		if (word.substring(apostrophe_index) !== "'s")
		{
			return false
		}

		// Drop everything after apostrophe (including the apostrophe)
		word = word.substring(0, apostrophe_index)
	}

	// Ignore empty words
	if (!word)
	{
		return false
	}

	return calculate_probability(word) >= word_probability_threshold
}

// Calculates probability for a word being from the dictionary
// (normalized, may be greater than 1)
function calculate_probability(word)
{
	let probability = 1

	for (let trigram of generate_trigrams(word))
	{
		if (trigram_probability[trigram] < trigram_probability_threshold)
		{
			probability *= trigram_probability[trigram]
		}
	}

	return probability
}

// Generates trigrams for a given word
// https://en.wikipedia.org/wiki/Language_model#Example
function generate_trigrams(word)
{
	const trigrams = []

	let pre_previous_letter = ' '
	let previous_letter     = ' '

	for (let letter of word + ' ')
	{
		trigrams.push(pre_previous_letter + previous_letter + letter)

		pre_previous_letter = previous_letter
		previous_letter     = letter
	}

	return trigrams
}

exports.generate_trigrams = generate_trigrams

function generate_all_trigrams()
{
	const trigrams = []

	for (let a of ' ' + alphabet)
	{
		let second_letter_alphabet = alphabet

		if (a === ' ')
		{
			second_letter_alphabet += ' '
		}

		for (let b of second_letter_alphabet)
		{
			let bigram_count = 0

			let third_letter_alphabet = alphabet

			if (b !== ' ')
			{
				third_letter_alphabet += ' '
			}

			for (let c of third_letter_alphabet)
			{
				const trigram = a + b + c

				trigrams.push(trigram)
			}
		}
	}

	return trigrams
}

exports.generate_all_trigrams = generate_all_trigrams