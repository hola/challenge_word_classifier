maxCharsInWord = 19
maxDistance3Chars = 4
minCountChars = 2
maxCountChars = 3
class CCIP
  init: (data) ->
    getGeneratorComb = (countChars, comb = '') ->
      oldComb = comb
      countChars -= 1

      for char in alphabet
        comb = oldComb + char

        yield comb if countChars is 0
        yield from getGeneratorComb(countChars, comb) if countChars isnt 0

      return
    setRgForTest = =>
      @rgForTest = ''
      decodePosition = []
      for distance in [0..maxDistance3Chars]
        for secondDistance in [0..maxDistance3Chars - distance]
          decodePosition.push [distance, secondDistance]

      for prefix, endChar of prefixTree
        for chars, position in endChar
          if chars
            if prefix.length is 1
              @rgForTest += "|#{prefix}#{if position then '.{' + position + '}' else ''}[#{chars.join ''}]"
            else
              distance = decodePosition[position]
              @rgForTest += "|#{prefix[0]}#{if distance[0] then '.{' + distance[0] + '}' else ''}#{prefix[1]}#{if distance[1] then '.{' + distance[1] + '}' else ''}[#{chars.join ''}]"


      @rgForTest = new RegExp @rgForTest[1..]
      return
    alphabet = (String.fromCharCode char for char in [97..122])
    alphabet.push '\''

    pit = 0xFF

    prefixTree = {}

    positionInBuff = 0
    for countChars in [minCountChars..maxCountChars]

      gComb = getGeneratorComb countChars - 1
      while not (obj = do gComb.next).done
        endChar = []

        loop
          code = data[positionInBuff...positionInBuff + 4]

          # 0xFF - значит что по данному префиксу нет комбинаций
          if code[0] == pit
            positionInBuff++
            break

          positionInBuff += 4
          position = code[0] >>> 3

          codeAlphabet = code.readInt32BE()
          for iChar in [0...alphabet.length]
            if codeAlphabet >>> iChar & 0x00000001
              (endChar[position] ||= []).push alphabet[iChar]

        if endChar.length
          prefix = obj.value
          prefixTree[prefix] = endChar

    setRgForTest()
    return
  test: (word) ->
    # ???
    # if 2 <= word.length <= maxCharsInWord
    return not @rgForTest.test word
    # else
    return true

module.exports = new CCIP()