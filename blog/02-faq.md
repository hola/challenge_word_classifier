*[Previous post](01-rules.md)* | *[Next post](03-testing-progress.md)*

A few updates to the ongoing Word Classifier challenge.

For your convenience, we are publishing the test program that we are going to use to test your solution: [tests/test.js](../tests/test.js). Run it without arguments to see the usage text.

See also the [Russian version](https://habrahabr.ru/company/hola/blog/301314/) of this page.

### FAQ

* How can I read `words.txt` if I'm not allowed to load the `fs` module? Can I download it from the internet instead? Can I use `process.binding`?

  Your program cannot have access to `words.txt`. That's the point. If you could just read `words.txt`, the task would be trivial. You can't download anything because that would require modules like `http` or `net`. You can't include the dictionary it in your submission, either, because it wouldn't fit in the size limit.

  This means it is probably impossible to write a solution that always answers correctly. However, it's possible to write a solution that makes a correct guess some of the times, and that's what you're competing at: whoever writes the most precise “guesser”, wins.

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

  They will count separately. See the [test program](../tests/test.js) for the exact method we will use.

* What if two people send the link to someone who eventually wins?

  The one who sent the link first will get the referrer bonus.

### Typical mistakes

Based on a number of solutions we already have received, here is a list of typical mistakes that can prevent your program from working:

* Not exporting the `test` and `init` functions properly. Just declaring functions with these names is not enough. Check your solution with the [test program](../tests/test.js) if you are unsure.
* Treating the `data` argument to the `init` function as a string. The problem statement says explicitly that it will be a `Buffer`.
* Forgetting to supply a data file when your program relies on it.
* Supplying a gzip-compressed data file and forgetting to check the “Apply gzip decompression to the extra data before giving it to my program”.
* Supplying a zip archive instead of gzip-compressed data and relying on our test system unpacking it. A zip archive is not the same as gzip.
* Using `require` or `process.binding`. You cannot use these.
