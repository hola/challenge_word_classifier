fs = require 'fs'

Test = require './Test'
ContinuityCharsInPosition = require './ContinuityCharsInPosition'
Words = require './Words'
ccip = require './CCIP'

conf =
  continuityCharsInPosition:
    maxDistance: [0,0,1,1]
    maxCountChars: 3
  words:
    minPercentFrequencyCountCharsInWord: 0.01
  test:
    pathToFolderTest: 'words/test'
    pathToFolderData: '.cache/ccip/code/'
    pathToData: 'data.gz'
    zip: true


testing = new Test null, conf.test
testing.add ccip
testing.testWords 1

# words = new Words 'words/true_words.txt', conf.words
# combInPosition = new ContinuityCharsInPosition words, conf.continuityCharsInPosition