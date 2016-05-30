const CHARS = 'abcdefghijklmnopqrstuvwxyz\''
const VOWELS_REGEX = new RegExp('[aeiou]', 'gi')
const LETTER_OCCURRENCE_COUNT = [170, 153, 204, 170, 170, 153, 153, 127, 153, 102, 170, 153, 153, 153, 170, 153, 102, 153, 170, 153, 170, 127, 153, 102, 127, 153, 95]
const MIN_WORD_LENGTH = 2
const MAX_WORD_LENGTH = 14
const MIN_VOWEL_RATIO = 0.10
const MAX_VOWEL_RATIO = 0.85

// [type of data | number of letters]
const DATA_MAPPING = [
  'S|2',
  'S|3',
  // 'S|4',
  'E|2',
  'E|3',
  // 'E|4',
  'G|2',
  'G|3',
  'G|4'
]
const DATA_SEPARATOR = 124 // ascii code of |
const DATA_FAULT_TOLERANCE = 0

let MAP = []

const initMap = data => {
  MAP = DATA_MAPPING.map(() => [])
  setMap(data)
}

const setMap = data => {
  let counter = 0
  let separatorCounter = 0

  data.forEach((b,i) => {

    if (b == DATA_SEPARATOR) {
      separatorCounter++
      counter = 0

    } else {

      let dataMapItem = DATA_MAPPING[separatorCounter].split('|')
      let numberOfLetters = parseInt(dataMapItem[1])

      if (counter % numberOfLetters == 0) {
        var block = ''

        for (let j = 0; j < numberOfLetters; j++)
          block += CHARS[data[i + j]]

        MAP[separatorCounter].push(block)
      }
      counter++
    }
  })
}

const testByData = word => {
  let faultCounter = 0

  DATA_MAPPING.forEach((data, index) => {

    if(faultCounter > DATA_FAULT_TOLERANCE)
      return

    data = data.split('|')
    let typeOfData = data[0]
    let numberOfLetters = parseInt(data[1])

    if (typeOfData == 'S') {
      let block = word.substr(0, numberOfLetters)

      if (MAP[index].indexOf(block) != -1)
        faultCounter++

    } else if (typeOfData == 'E') {
      let block = word.substr(-numberOfLetters)

      if (MAP[index].indexOf(block) != -1)
        faultCounter++

    } else if (typeOfData == 'G') {
      for (let i = 0; i < word.length - (numberOfLetters - 1); i++) {
        let block = word.substr(i, numberOfLetters)

        if (MAP[index].indexOf(block) != -1)
          faultCounter++
      }
    }
  })

  return faultCounter <= DATA_FAULT_TOLERANCE
}

const testByLength = word => {
  return word.length <= MAX_WORD_LENGTH && word.length >= MIN_WORD_LENGTH
}

const testByVowelRatio = word => {
  let noOfVowels = word.match(VOWELS_REGEX)
  let ratio = noOfVowels ? noOfVowels.length / word.length : 0
  return ratio >= MIN_VOWEL_RATIO && ratio <= MAX_VOWEL_RATIO
}

const testByOccurrence = word => {
  const letters = {}

  for (let i = 0; i < word.length; i++)
    letters[word[i]] = letters[word[i]] ? letters[word[i]] + 1 : 1

  return !Object.keys(letters)
                .filter(letter => {
                  let normalizedRatio = Math.floor((letters[letter] / word.length) * 255)
                  let limitedRatio = LETTER_OCCURRENCE_COUNT[CHARS.indexOf(letter)]
                  return normalizedRatio > limitedRatio
                }).length

}

const testWord = word => word &&
                         testByLength(word) &&
                         testByVowelRatio(word) &&
                         testByOccurrence(word) &&
                         testByData(word)

module.exports = {
  init: initMap,
  test: testWord
}
