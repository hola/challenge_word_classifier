Based on [this Wikipedia article](https://en.wikipedia.org/wiki/Language_model)

`trigram-generator.js` counts all trigram frequencies in the supplied dictionary and outputs it as a serialized JSON object.

`solution.js` `init(buffer)` function then reads these trigram frequencies from the data file and counts all possible trigram probabilities based on their frequencies.

The `test(word)` function takes a word and splits it into trigrams calculating the total probability of that word being a word from the dictionary.

![The total probability is simply a product of probabilities of all trigrams of the word](https://upload.wikimedia.org/math/7/9/a/79a57d887da25995b195c811ab63c431.png)

The resulting number is then compared to an empiric threshold to condclude whether it's a word from the dictionary or not.