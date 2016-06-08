Sorry to keep you waiting! Alexey Feldgendler here on behalf of Hola, explaining what's going on.

## 312 solutions to test

First of all, thanks to everyone who participated! We have received an overwhelming response: 603 submissions from 312 unique participants. Because we only test the latest submission from each participant, we now have 312 solutions to test. I hope this partly explains why it's taking so long.

The solutions are published in the [submissions](../submissions) directory. Each subdirectory is named with the unique ID assigned to the particular submission. Participants received unique IDs for their solutions by e-mail after submitting. Names or pseudonyms of the authors behind the solutions will be published together with the final results.

Each directory contains `solution.js`, the main JS program, and, optionally, `data` or `data.gz` (if gzip-compressed). This layout is compatible with what the test scripts expect. The `src` subdirectory within a submission directory contains what was in the sources archive submitted by the author. The test scripts don't look there.

Obviously you cannot change your solutions after the deadline, but there is one exception: you can amend the stuff in your `src` directory, and you're welcome to do so if you haven't done this already. For example, you can add or expand your README file. This won't affect your test score; however, giving us an opportunity to understand your solution might improve your chances of winning a special prize for originality. Write to challengejs@hola.org if you'd like to amend your `src` directory.

## Testcase generator

As promised, we are publishing the [testcase generator](../tests/generate.js). It is a command-line version of the [same code](../tests/generator.js) that we've been running as a web service, guaranteed to produce the same results for the same seed values. Run it with `--help` for usage information.

The generator first analyzes the wordlist and builds [Markov chain](https://en.wikipedia.org/wiki/Markov_chain) models of different orders (this is why initialization takes so long). Then, it uses a deterministic pseudo-random number generator to produce the testcases. With probability 0.5, a word is picked randomly from the wordlist. Otherwise, the word is generated from a model chosen randomly from 9 models: Markov chains of orders 1 through 8, and a white noise generator. The latter generates completely random strings of letters; the Markov chain models produce words of varying similarity to English. If a generated word happens to be present in the dictionary, it is discarded, and a new one is generated. Note that because high-order models produce more accidental clashes with real words, they are somewhat underrepresented among nonwords in the testcases compared to low-order models. Please refer to the [source](../tests/generator.js) of the generator for details of the algorithm.

For large-scale testing, a series of 100-word blocks is needed. To generate that, we use a “seed string” which initializes the master pseudo-random sequence. The same seed string always produces the same sequence of blocks; the sequence can be continued for as long as desired.

In a few days, the online testcase generator will be shut down. Please use the generator script instead; it will produce exactly the same results on your computer.

## Heavy-duty test harness

For mass testing of solutions, we developed a [heavy-duty version](../tests/test2.js) of the test script we published earlier. Run it with `--help` for usage information.

The new test harness is functionally equivalent to the one we published originally. It will produce the same results for the same solutions and testcases. Here are the ways it is different, though:

* It can run several solutions in parallel. Just list them one after another on the command line. (Just like with the first test script, you mention solution directories rather than file paths.)

* Solutions are run in separate child processes that receive test words from the master process and send answers back.

* Instead of reading thousands of testcase JSON files, the test program generates testcases on the fly using the same testcase generation code initialized by a “seed string”. This is deterministic and fully repeatable.

* The new script produces a lot more stats than just the correctness rate. During testing, the new script displays live stats on the console. Machine-readable test results can be written into a JSON output file.

* The test program can optionally restart and re-initialize the solution each time a previously-seen word appears in a testcase. This can be used to isolate and measure the effect of learning at runtime, as some solutions do.

* An optional “unsafe” mode loads solutions as ordinary Node.js modules without a sandbox. This can be used with care if the Node.js VM is suspected to affect the outcome. In unsafe mode, the solution is still run in a slave process, though.

While testing, the live stats include the following. In the top row: `Total` (the total number of words tested so far), `W` (number of dictionary words), `NW` (number of nonwords), `NW[0]` through `NW[8]` (number of nonwords per model). Model 0 is the white-noise generator, and models 1 through 8 are Markov chains of the corresponding orders. For each solution being tested: `Correct` (overall correctness rate, this is what the competition is about), `F-` (false negative rate: percentage of dictionary words classified as nonwords), `F+` (false positive rate: percentage of nonwords classified as words), `F+[0]` through `F+[8]` (false positive rates per model), `ms/100w` (average time in milliseconds the solution takes to answer one 100-word block). If a solution is being tested in restart mode, `(R)` is displayed to the left of its name. The JSON output file includes the same data in a self-explanatory format.

## The official testcase sequence

We looked at Twitter account [@ladygaga](https://twitter.com/ladygaga) :-) and took the first tweet after the submission deadline. The text of this tweet became the official seed string for our testing. If you want to generate the official testcase sequence, use the following option to the `generate.js` and `test2.js` scripts:

```
--text 'Lady Gaga has accompanied Mario Andretti in a two-seater race car at #Indy500 today!'
```

(Update: the tweet seems to have disappeared, but it survives as [this retweet](https://twitter.com/GidleighGrounde/status/737344029868843008). However, because our testing is aready underway, the string above remains the official seed string.)

The sequence begins with the following testcase seeds: 416943456, 1130928813, 1690493249, 1560679505, 1146154276, 403245362, 1509995579, 2138666856, 1841363379, 1083285606.

## Number of blocks and runtime learning

First, we ran all solutions on a small number of blocks just to see which ones have a hope of making the leader pack. Then, we took 8 best solutions and ran them on a very large number of blocks and observed how adding more blocks affected the outcome. With a few different seed strings, the three prize-winning places would stabilize within the first 1,500 blocks or sooner. Further blocks improved the precision but did not cause any surprise reorderings. To be on the safe side, we decided to test all solutions on **10,000 blocks**, which is a million words.

A minority of solutions use an original approach: they record every word ever tested, and learn from the duplicates they see. There are only under 700k words in the dictionary, while nonwords are generated randomly and are much more varied. Therefore, any word that re-occurs is more likely to be a dictionary word rather than a nonword. Solutions that make use of this effect, improve their correctness rates as they learn. Theoretically, on very large test sets, the precision of such a solution is unlimited.

While this idea is interesting, it poses a problem for the contest because, theoretically, a learning solution has the potential to beat any non-learning solution on a sufficiently large set. This would not only make the simplistic learning algorithm a “silver bullet” that wins over anything else, but also make it impossible to judge *among* the different learning solutions. Had we thought about this at the start of the contest, we could easily have prevented it by saying that the test system is allowed to restart and re-initialize the solution at any given time. However, we had specifically promised that the solution will be initialized only once.

We decided to stick with 10,000 blocks and run each solution both with and without restarts, to isolate the effect of learning. This is enough time for the ranking among the non-learning solutions to stabilize. Learning does give some solutions a boost (so far, it seems to bring one solution into the top 10 which wouldn't be there without the opportunity to learn). Of course, the learning solutions would have performed even better had we used far more blocks, but this would be unfair to the authors of non-learning solutions that show good precision right from the start.

To summarize: as promised, we will allow learning solutions to have the benefit of learning. However, we won't use so many blocks as for this benefit to become overpowering.

## Current status

As of this writing, we are still running the tests on some of the solutions.

We did not specify a limit on how slow the solution can be, because that would require exact specification of what the test machine is like, repeated performance measurements, etc. Last time, we even had to revisit the test results because the Node.js VM introduced distortion into the performance measurements. We wanted to get away from the performance issues this time. As a result of our not specifying a time limit, we got some solutions that are extremely slow.

So far, a few solutions are still being tested. For some of the slowest ones, we'll probably have to cut the testing short and use the results obtained from the partial testing. It seems, though, that none of the extremely slow ones have a chance of making the top 10 by precision. Also, at least one solution seems to be hanging. We'll investigate whether it's a problem introduced by Node.js VM, or a genuine bug in the solution.

We expect to present the results in a few days when the last slow solutions have been tested. If you want to see how you did, you don't have to wait: you can use the test program on your own solution and get the exact same result we got (unless your solution uses `Math.random`, in which case the result will be slightly different). Just make sure to use the seed string shown above for the official testcase sequence, and to run with 10,000 blocks. So far, the best result we saw on 10,000 blocks is an impressive **83.67%**.

Thanks for your patience. Stay tuned for the results!
