# Hola JS Challenge Spring 2016: Word Classifier

[English](https://github.com/hola/challenge_word_classifier)
[Русский](https://habrahabr.ru/company/hola/blog/282624/)

## Usage

```
node solution/trigram-generator.js
node test solution test-case
```

## Description

The contest isn't over yet, but it's already known that this isn't the solution, because it gives about 63.5% result while solutions based on Bloom filter give 75.5% results. I tried this trigram approach first, but that would only filter out non-words and wouldn't filter quasi-english words. I'm publishing this solution just to finalize my attempts to solve this test case. I'm confident that it's not gonna be even close to the top results when the contest is finished.

[About trigrams](https://github.com/halt-hammerzeit/hola-word-classifier/solution/README.md)