path = require 'path'
fs = require 'fs'

tool = require './tool'

log = console.log
time = console.time
timeEnd = console.timeEnd

class Words

  constructor: (pathToFile, conf) ->
    @conf =
      Object.assign
        showLog: false
        minPercentFrequencyCountCharsInWord: 0.01
        addApostrofInAlphabet: true
        , conf

    @alphabet = (String.fromCharCode char for char in [97..122])
    @alphabet.push '\'' if @conf.addApostrofInAlphabet

    @words = fs.readFileSync path.join(__dirname, pathToFile), encoding: 'utf-8'
    @words = @words.toLowerCase()
    @arrWords = @words.split('\n')


    @totalCountWords = @arrWords.length

    do @scanFrequencyChar
    do @scanFrequencyCountCharsInWord
    do @setMinMaxWordLength

    @cleanWords = @wordFilterCountChars[@minWordLength..@maxWordLength].reduce (sumArrWords, arrWords) ->
      sumArrWords.concat arrWords
    @cleanWords = @cleanWords.join '\n'


  setMinMaxWordLength: () ->
    searchMaxOrMinWordLength = (start, end) =>
      for countCharsInWord in [start..end]
        frequencyCountCharsInWord = @frequencyCountCharsInWord[countCharsInWord]
        continue unless frequencyCountCharsInWord

        if tool.percent(frequencyCountCharsInWord, @totalCountChars) > @conf.minPercentFrequencyCountCharsInWord
          return countCharsInWord

    @maxWordLength = @frequencyCountCharsInWord.length - 1
    @minWordLength = 2
    @minWordLength = searchMaxOrMinWordLength(@minWordLength, @maxWordLength)
    @maxWordLength = searchMaxOrMinWordLength(@maxWordLength, @minWordLength)

    unless +@maxWordLength or +@minWordLength
      throw new Error "Нет слов с таким количеством символов которое бы удовлетворяло условию
      мин. процента частоты символов в слове #{@conf.minPercentFrequencyCountCharsInWord}"

    return

  scanFrequencyChar: () ->
    @frequencyChar = []
    @totalCountChars = 0

    for char in @words
      indexChar = @alphabet.indexOf char
      unless indexChar == -1
        @totalCountChars++
        if @frequencyChar[indexChar]
          @frequencyChar[indexChar] += 1
        else
          @frequencyChar[indexChar] = 1

    if @conf.showLog
      frequencyChar = @frequencyChar
      loop
        maxFrequencyChar = Math.max.apply null, frequencyChar
        unless maxFrequencyChar == 0
          indexChar = @frequencyChar.indexOf maxFrequencyChar
          log "#{@alphabet[indexChar]} #{maxFrequencyChar} #{tool.percent maxFrequencyChar, @totalCountChars} %"
          frequencyChar[indexChar] = 0
        else
          break
      log "Total count chars #{@totalCountChars}"

    return
  scanFrequencyCountCharsInWord: () ->
    @wordFilterCountChars = []
    @frequencyCountCharsInWord = []
    for word in @arrWords
      countCharsInWord = word.length

      (@wordFilterCountChars[countCharsInWord] ||= []).push word


      @frequencyCountCharsInWord[countCharsInWord] ||= 0
      @frequencyCountCharsInWord[countCharsInWord] += 1

    if @conf.showLog
      for countCharsInWord, frequencyCountCharsInWord of @frequencyCountCharsInWord
        log "#{countCharsInWord}  #{frequencyCountCharsInWord}
        #{tool.percent frequencyCountCharsInWord, @totalCountWords} %"
      log "Total count words  #{@totalCountWords}"

  getGeneratorComb: (countChars, recursive, comb = '') ->
    oldComb = comb
    countChars -= 1

    for char in @alphabet
      comb = oldComb + char
      if recursive
        yield comb if comb.length > countChars
      else
        yield comb if countChars is 0

      yield from @getGeneratorComb(countChars, recursive, comb) if countChars isnt 0

    return

module.exports = Words