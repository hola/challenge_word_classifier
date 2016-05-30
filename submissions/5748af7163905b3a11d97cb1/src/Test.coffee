fs = require 'fs'
path = require 'path'
zlib = require 'zlib'

tool = require './tool'

log = console.log
time = console.time
timeEnd = console.timeEnd

class Test
  constructor: (objForTest, @conf = {}) ->
    @objForTest = []
    @add objForTest
    @data = fs.readFileSync path.join __dirname, @conf.pathToFolderData, @conf.pathToData
    if @conf.zip
      @data = zlib.gunzipSync @data


  add: (objForTest) ->
    return unless objForTest?
    if Array.isArray objForTest
      @objForTest = @objForTest.concat objForTest
      arrObjForTest = objForTest
    else
      @objForTest.push objForTest
      (arrObjForTest = []).push objForTest

    for objForTest in arrObjForTest
      if objForTest.init
        objForTest.init @data

    return @
  testWords: (verbose) ->
    @wordsForTest = []
    nameFiles = fs.readdirSync path.join __dirname, @conf.pathToFolderTest
    for nameFile in nameFiles
      @wordsForTest.push require path.join __dirname, @conf.pathToFolderTest, nameFile


    if not @wordsForTest.length
      log 'Array words of test is empty'
      return

    @resultTestAllWords = []
    @resultTestIsNotWords = []

    for objForTest, iObjForTest in @objForTest
      @resultTestAllWords[iObjForTest] = []
      @resultTestIsNotWords[iObjForTest] = []

      for wordsForTest in @wordsForTest
        right = notRight = 0
        testRight = testNotRight = 0
        countWords = 0


        for word, isWord of wordsForTest
          countWords++
          isWordResult = objForTest.test word
          if isWord == isWordResult
            testRight++
          else
            testNotRight++
          if isWord
            right++
          else
            notRight++

          log "#{if isWord == isWordResult then '+' else '-'} #{if isWord then '' else '!'} #{word}" if verbose is 2

        @resultTestAllWords[iObjForTest].push tool.percent testRight, countWords
        @resultTestIsNotWords[iObjForTest].push tool.percent testRight - right, notRight
        if verbose
          log "#{testRight}(#{right})/#{testNotRight}(#{notRight})  _#{testRight - right}_
            #{@resultTestAllWords[iObjForTest][@resultTestAllWords[iObjForTest].length - 1]} %
            #{@resultTestIsNotWords[iObjForTest][@resultTestIsNotWords[iObjForTest].length - 1]} %"

      log "#{if objForTest.info then objForTest.info() else @conf.pathToData} Total
      #{+(@resultTestAllWords[iObjForTest].reduce((sum, value) -> sum + value) / @resultTestAllWords[iObjForTest].length).toFixed 2} %
      #{+(@resultTestIsNotWords[iObjForTest].reduce((sum, value) -> sum + value) / @resultTestIsNotWords[iObjForTest].length).toFixed 2} %"

    return @

module.exports = Test