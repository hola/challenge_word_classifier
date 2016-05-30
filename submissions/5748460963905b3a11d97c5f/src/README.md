# Hola JS Challenge Spring 2016: Word Classifier
This package contains my decision for this contest.

## Description
I use webpack assets bundler for assets building. Also I use filters logic, for example, word length filter or apostrophe filter.

You can see all allowed filters in ./application/validators folder. All input validators settings defined in ./application/index.js.

## Structure

* application - core folder, which contains application logic.
* * helpers - helpers folder, for example: random generator which used in data build process.
* * validators - filters for words which can validate word and return true or false.
* * index.js - core application script.
* * solution.js - wrapper for index.js which returns module.exports for hola.org tests (./tests/test.js) compatibility.
* * validator.js - validator model, which used in index.js.
* build - webpack output folder.
* * data.gz - compressed data file.
* * solution.js - compressed solution.
* data
* * cases - cases folder.
* * * test - test cases folder.
* * * train - data for perceptron neural network.
* * * data - uncompressed data file.
* tests - hola.org tests.
* trainer - development helpers
* * build.js - data builder.
* * cases.js - cases fetcher via hola.org api.
* * test.js - hola.org tests without vm wrapper.
* webpack.config.js - webpack configuration file.
* words.txt - hola.org dictionary.

## Work with this package
Load one more case via hola.org api:
```bash
npm run trainer:cases
 ```

Build data file:
```bash
npm run trainer:build
 ```

Run tests with modified hola.org tests:
```bash
npm run trainer:test
 ```

Build project with webpack assets bundler:
```bash
npm run build
 ```

Run hola.org tests for build:
```bash
npm run test
 ```

## Copyrights
Kondratenko Pavel
Linkedin: https://ru.linkedin.com/in/kondratenkopa
Contact with me: gate@webulla.ru
