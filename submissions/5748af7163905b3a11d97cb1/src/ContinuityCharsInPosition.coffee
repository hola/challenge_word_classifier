path = require 'path'
fs = require 'fs'

tool = require './tool'

log = console.log
time = console.time
timeEnd = console.timeEnd

class ContinuityCharsInPosition
  constructor: (@words, conf = {}) ->
    @conf =
      Object.assign
        profiling: true
        maxCountChars: 2
        maxDistance: [0,0,5,2]
        showLogStatistic: true
        logStatisticToFile: true
        folder: '.cache/ccip'
        , conf

    unless @conf.profiling
      time = timeEnd = ->

    @comb = []
    do @searchComb

    @logStatistic @conf.logStatisticToFile if @conf.showLogStatistic


  searchComb: ->
    @comb = []
    pushComb = (countChars, comb, position) =>
      prefixTreeAndPosition = ((((@comb[countChars] ||= Object.create(null, {}))[comb[...-1]] ||= []))[position] ||= [])
      endChar = comb[-1..]

      prefixTreeAndPosition.push endChar unless prefixTreeAndPosition.includes endChar
      return
    getFileName = (maxDistance) =>
      "c#{@words.alphabet.length}-cc#{countChars}-md#{maxDistance}" +
      "-cmc#{@countMaxComb countChars, maxDistance}-mmwl#{@words.minWordLength}-#{@words.maxWordLength}"
    getGeneratorRgComb = (countChars, maxDistance, enableFilter) =>
      getRgComb = (comb, maxDistance, filterComb, rgComb, position, positionNotTest) ->
        unless rgComb
          positionNotTest = filterComb comb if filterComb
          rgComb = comb[0]
          comb = comb[1..]
          position = 0

        oldRgComb = rgComb
        # TODO position for 4 countChars
        for distance in [0..maxDistance]
          if positionNotTest and positionNotTest.has position
            if comb.length > 1 then position += maxDistance - distance + 1 else position++
            continue

          rgComb = oldRgComb + if distance then ".{#{distance}}#{comb[0]}" else comb[0]
          if comb.length > 1
            yield from getRgComb comb[1..], maxDistance - distance, null, rgComb, position, positionNotTest
            position += maxDistance - distance + 1
          else
            yield {rgComb, position: position++}

        return
      getFunctionFilterComb = (countChars, maxDistance) =>
        # Это не маштабируемая версия поддерживает только 3 символа в комбинации

        if countChars <= 2
          return -> false

        arrFilterComb = []
        for prefixComb, endCharWithPosition of @comb[countChars - 1]
          for endChar, iPosition in endCharWithPosition
            break if iPosition > maxDistance
            if endChar
              (arrFilterComb[iPosition] ||= '')
              arrFilterComb[iPosition] += "#{if arrFilterComb[iPosition].length then '|' else ''}(#{prefixComb}[#{endChar.join ''}])"
        for vFilterComb, iPosition in arrFilterComb
          arrFilterComb[iPosition] = new RegExp vFilterComb

        iPosition = 0
        bearingRow = [0]
        bearingRow.push (iPosition += intervalDistance for intervalDistance in [maxDistance + 1..2])...

        return (comb) ->
          positionNotTest = new Set()
          # a.{0}b.{0}c
          # a.{0}b.{1-maxDistance}c
          # a.{1-maxDistance}b.{0}c
          for distance in [0..maxDistance]
            for positionInComb in [0...countChars - 1]
              if arrFilterComb[distance].test comb[positionInComb...positionInComb + countChars - 1]
                # ab.?
                if positionInComb is 0
                  itemRow = bearingRow[distance]
                  arrPositionNotTest = (i for i in [itemRow..itemRow + maxDistance - distance])

                # .?ab
                else
                  arrPositionNotTest = (bearingRow[iItemRow] + distance for iItemRow in [0..maxDistance - distance])

                positionNotTest.add arrPositionNotTest...

          return unless positionNotTest.size then false else positionNotTest


      filterComb = getFunctionFilterComb countChars, maxDistance if enableFilter

      gComb = @words.getGeneratorComb countChars
      while not (obj = do gComb.next).done
        comb = obj.value
        filterComb = if enableFilter then getFunctionFilterComb countChars, maxDistance
        gRgComb = getRgComb comb, maxDistance, filterComb
        while not (obj = do gRgComb.next).done
          {rgComb, position} = obj.value

          yield {comb, rgComb, position}

      return
    checkComb = (countChars) =>
      # TODO

    for countChars in [2..@conf.maxCountChars]
      maxDistance = @conf.maxDistance[countChars]
      fileName = getFileName maxDistance
      # if rawComb = @readCombFromFile fileName, maxDistance
      #   # TODO rawComb
      #   continue
      time fileName
      log fileName
      gRgComb = getGeneratorRgComb countChars, maxDistance, countChars > 2
      while not (obj = do gRgComb.next).done
        {comb, rgComb, position} = obj.value

        pushComb countChars, comb, position if @words.cleanWords.search(rgComb) is -1

      timeEnd fileName
      # TODO
      checkComb countChars

      @saveCombToFile countChars, fileName

    return

  saveCombToFile: (countChars, fileName) ->
    bufferComb = Buffer.alloc(4)
    bufferTotal = Buffer.alloc(0)
    pit = Buffer.from([0xff])

    strComb = ''
    prefixTree = @comb[countChars]

    gComb = @words.getGeneratorComb countChars - 1
    while not (obj = do gComb.next).done
      prefix = obj.value
      if `prefix in prefixTree`
        for endChar, position in prefixTree[prefix]
          if endChar
            strComb += "#{position}#{endChar.join ''}"

            codeAlphabet = 0
            for vEndChar in endChar
              codeAlphabet |= 1 << @words.alphabet.indexOf(vEndChar)

            codeAlphabet |= position << 27
            bufferComb.writeInt32BE(codeAlphabet)
            bufferTotal = Buffer.concat [bufferTotal, bufferComb]

      strComb += ':'

      bufferTotal = Buffer.concat [bufferTotal, pit]

    fs.writeFileSync path.join(__dirname, @conf.folder, fileName), strComb
    fs.writeFileSync path.join(__dirname, @conf.folder, 'code/' + fileName), bufferTotal
    return
  readCombFromFile: (fileName) ->
    try
      return fs.readFileSync(path.join(__dirname, @conf.folder, fileName), encoding: 'utf-8')
    catch
      return false

  countMaxComb: (countChars, maxDistance) ->
    if countChars == 2
      count = @words.alphabet.length ** countChars * maxDistance + 1
    else
      count = @words.alphabet.length ** countChars * [maxDistance + 1..1].reduce (vPrev, vCurrent) -> vPrev + vCurrent

    return count

module.exports = ContinuityCharsInPosition