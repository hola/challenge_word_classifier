# <img src=https://hola.org/img/logo.png alt="Hola!"> JS Challenge Spring 2016: Word Classifier

Welcome to Hola programming challenge! The prizes are record-high:

1. First prize: 3000 USD.
2. Second prize: 2000 USD.
3. Third prize: 1000 USD.
4. We might also decide to award up to two 400 USD special prizes for exceptionally creative solutions.
5. If you email the link to this page to someone, with challengejs@hola.org in CC, and that someone enters the competition and wins a prize, you will receive half the amount they get (only the first referrer per participant).

See also the [Russian version](https://habrahabr.ru/company/hola/blog/282624/) of this page.

## Rules

For a change, this challenge is not about writing the fastest code! Read on.

* Submit your solution to our [form](https://hola.org/challenges/word_classifier). Do not send solutions by e-mail!
* Submission deadline: **May 27, 2016**, 23:59:59 UTC.
* Preliminary results will be published on **June 3, 2016**, and final results on **June 10, 2016**.
* You may submit more than once. Only your latest submission, as long as it's still before the deadline, will be evaluated.
* We will use **Node.js v6.0.0** (current at the time of this publication) for testing. You can use any language features supported by the interpreter in its default configuration.
* Your code must all be in a **single JS file**.
* Your submission must be in JS. If you prefer CoffeeScript or similar, translate to JS before submitting.
* It is **not allowed to require any JS modules**, not even the standard ones built into Node.js.
* Your JS file **must not be larger than 64 KiB**.
* You are allowed to supply one additional data file, see below. If you choose to do so, the size of this file counts towards the 64 KiB quota.
* If your JS file or the extra data file are generated, minified and/or compiled from a different language like CoffeeScript, please submit an archive with the complete sources, and possibly a description of your approach. We will publish it, but won't test it.
* We need to know your full name, but we can publish your solution under a pseudonym instead, if you prefer. We will not publish your email address.
* Do not publish your solution before the submission deadline, or you will be disqualified.
* Questions about the problem statement? Send them to challengejs@hola.org.

## Problem Statement

For the purposes of this problem, we define **an English word** as a word from the list included here as [words.txt](words.txt). (If you're interested, it's the [SCOWL](http://wordlist.aspell.net/) “insane” dictionary with flattened diacritics.) Membership in the dictionary is case-insensitive. You have to write a program that can answer whether a given word is English. This would be easy — you'd just need to look the word up in the dictionary — but there is an important restriction: your program must not be larger than 64 KiB.

We don't think it's possible to write a program that fits in 64 KiB and always gives correct answers. But we don't require 100% correctness. For every program we will measure how often it answers correctly, and the most precise solution shall win.

### API

Your JS file has to be a Node.js module that exports two functions:

```javascript
init(data)
```

This export is optional. If supplied, it will be called once to initialize your module. The `data` argument will contain your extra data file (see below) as a `Buffer`, or `undefined` if you don't supply a data file.

```javascript
test(word)
```

This function should take a word an return `true` if it classifies the `word` as English, otherwise `false`. The function can be called repeatedly with different words.

You can submit an extra data file along with your JS code. If you do, this file will be read into a `Buffer` by the testing system and passed as the `data` argument to the `init` function. The data file shares the 64 KiB quota with the JS file. Optionally, you can specify with a checkbox when submitting your solution that your data file is gzip-compressed; in this case, the testing system will pass the file content through `zlib.gunzipSync` before giving it to your program. This option can save you the trouble of encoding binary data for representation in the JS source, and of writing a decompression algorithm. If you choose this, it is the compressed data size that must fit the quota; after decompression, the data might well exceed 64 KiB in size.

### Testing

We are going to test with large numbers of words, some of them chosen from the English dictionary, and some generated nonwords with varying degrees of similarity to English, ranging from noise like *dknwertwi* to almost-words like *sonicative*. The testcases will only be ASCII strings limited to lowercase Latin letters as well as `'` character (apostrophe).

You can use our public testcase generator: https://hola.org/challenges/word_classifier/testcase — to test your code. Every time it's invoked, this redirects to a URL with a randomly chosen number embedded in it. That number is the pseudorandom seed. You can use it to obtain repeatable results from the testcase generator. For any given seed, the testcase generator returns a JSON object with 100 words as keys. For each key, the Boolean value contains the correct answer for this word: whether or not it belongs to the English dictionary (although you could have checked that yourself). You can use the testcase generator to see how well your program is doing, and to compare between different versions of your solution. We reserve the right to limit the frequency at which you make requests to the testcase generator.

Our test system will load your module once. Then, if the module exports an `init` function, the test system will call it. If an extra data file was supplied, it is loaded as a `Buffer`, decompressed if needed, and supplied as the `data` argument to the `init` function. After that, the `test` function will be called many times with different words, and the test system will count how many correct answers are given. Any return value will be converted to Boolean.

We will use the same testcase generator that we made public. A number of 100-word blocks will be generated, and the same tests will be given to all competing solutions. We'll use as many 100-word blocks as needed to distinguish reliably between the winning solutions. In case of a very close tie, we reserve the right to share prizes between two or more contestants. Along with the final standings, we'll publish the pseudorandom seeds that we used to test the solutions, as well as the source code of the testcase generator.

For your convenience, we are publishing the test program that we are going to use to test your solution: [tests/test.js](tests/test.js). Run it without arguments to see the usage text.

### Submitting your solution

Please submit your solutions using [this form](https://hola.org/challenges/word_classifier). We don't accept submissions by email.

We expect that many solutions will contain code or data that is generated, minified, compressed etc, and therefore we require that the source code be submitted as well. If the code or data is generated, please include the generator. If it's minified/compressed, include the original version, and the compressor if it's not a public module. If it's compiled from a different language such as CoffeeScript, include the original code. We also appreciate if you include a brief README file with some explanation of your approach (in English). Don't include a copy of the original wordlist, though. Please submit the above as a tar.gz or zip archive. It won't count towards the size quota. The contents of this archive will be published, but won't be tested. Also, it will help us decide who should receive the special prizes for exceptionally creative solutions.

If you have trouble submitting your solution, please contact challengejs@hola.org.

### FAQ

* How can I read `words.txt` if I'm not allowed to load the `fs` module? Can I download it from the internet instead? Can I use `process.binding`?

  Your program cannot have access to `words.txt`. That's the point. If you could just read `words.txt`, the task would be trivial. You can't download anything because that would require modules like `http` or `net`. You can't include the dictionary it in your submission, either, because it wouldn't fit in the size limit.

  This means it is probably impossible to write a solution that always answers correctly. However, it's possible to write a solution that makes a correct guess some of the times, and that's what you're competing for: whoever writes the most precise “guesser”, wins.

* The dictionary contains some words with uppercase letters. Will they appear in the tests?

  Yes, they can, but they will be converted to lowercase.

* What exactly does 64 KiB mean?

  64*1024 = 65536 bytes.

* If my data file is gzip-compressed, is it the size before or after compression that must fit in 64 KiB together with the JS file?

  It's the compressed size that matters.

* This is not an English dictionary! The file contains a lot of very strange “words”.

  Yes, we know that. This is the biggest English dictionary for spellcheckers that includes all sorts of abbreviations, loanwords, rare words, dialectisms, and sometimes outright impossible word forms. This is what we chose to use, so in this problem, an “English word” is one that is found in exactly that dictionary.

* How large is the set of nonwords that the test generator uses?

  The test generator does not have any particular set of nonwords. It generates random nonwords similar to English on the fly using an algorithm that we will publish after the submission deadline.

* How will your test system treat duplicates (words that appear in more than one of the 100-word blocks)?

  They will count separately. See the [test program](tests/test.js) for the exact method we will use.

* What if two people send the link to someone who eventually wins?

  The one who sent the link first will get the referrer bonus.

### Typical mistakes

Based on a number of solutions we already have received, here is a list of typical mistakes that can prevent your program from working:

* Not exporting the `test` and `init` functions properly. Just declaring functions with these names is not enough. Check your solution with the [test program](tests/test.js) if you are unsure.
* Treating the `data` argument to the `init` function as a string. The problem statement says explicitly that it will be a `Buffer`.
* Forgetting to supply a data file when your program relies on it.
* Supplying a gzip-compressed data file and forgetting to check the “Apply gzip decompression to the extra data before giving it to my program”.
* Supplying a zip archive instead of gzip-compressed data and relying on our test system unpacking it. A zip archive is not the same as gzip.
* Using `require` or `process.binding`. You cannot use these.

**Good luck to all the participants!**
