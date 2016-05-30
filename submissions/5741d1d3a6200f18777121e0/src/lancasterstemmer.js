// Copyright (c) 2011, 2012 Chris Umbel, Rob Ellis, Russell Mull
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

const ruleTable = require('./lancasterstemmer_rules')

let stopwords = [
  'about', 'above', 'after', 'again', 'all', 'also', 'am', 'an', 'and', 'another',
  'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below',
  'between', 'both', 'but', 'by', 'came', 'can', 'cannot', 'come', 'could', 'did',
  'do', 'does', 'doing', 'during', 'each', 'few', 'for', 'from', 'further', 'get',
  'got', 'has', 'had', 'he', 'have', 'her', 'here', 'him', 'himself', 'his', 'how',
  'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'like', 'make', 'many', 'me',
  'might', 'more', 'most', 'much', 'must', 'my', 'myself', 'never', 'now', 'of', 'on',
  'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'said', 'same', 'see', 'should', 'since', 'so', 'some', 'still', 'such', 'take', 'than',
  'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was',
  'way', 'we', 'well', 'were', 'what', 'where', 'when', 'which', 'while', 'who',
  'whom', 'with', 'would', 'why', 'you', 'your', 'yours', 'yourself',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
  'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '$', '1',
  '2', '3', '4', '5', '6', '7', '8', '9', '0', '_'
]

class Tokenizer {
  trim(array) {
    while (array[array.length - 1] == '')
    array.pop();

    while (array[0] == '')
    array.shift();

    return array;
  }

  attach() {
    String.prototype.tokenize = () => this.tokenize(this)
  }

  tokenize(text) {
    return this.trim(text.split(/\W+/))
  }
}

class Stemmer {
  stem (token) {
    return this.applyRuleSection(token.toLowerCase(), true)
  }

  addStopWord (stopWord) {
    stopwords.push(stopWord);
  }

  addStopWords (moreStopWords) {
    stopwords = stopwords.concat(moreStopWords);
  }

  removeStopWord (stopWord) {
    this.removeStopWords([stopWord])
  }

  removeStopWords (moreStopWords) {
    moreStopWords.forEach(function(stopWord){
      var idx = stopwords.indexOf(stopWord);
      if (idx >= 0) {
        stopwords.splice(idx, 1);
      }
    });
  }

  tokenizeAndStem (text, keepStops) {
    var stemmedTokens = [];
    var lowercaseText = text.toLowerCase();
    var tokens = new Tokenizer().tokenize(lowercaseText);

    if (keepStops) {
      tokens.forEach(function(token) {
        stemmedTokens.push(this.stem(token));
      });
    }

    else {
      tokens.forEach(function(token) {
        if (stopwords.indexOf(token) == -1)
        stemmedTokens.push(this.stem(token));
      });
    }

    return stemmedTokens;
  }

  attach () {
    String.prototype.stem = () => this.stem(this)
    String.prototype.tokenizeAndStem = (keepStops) => this.tokenizeAndStem(this, keepStops)
  }

  acceptable(candidate) {
    if (candidate.match(/^[aeiou]/))
    return (candidate.length > 1);
    else
    return (candidate.length > 2 && candidate.match(/[aeiouy]/));
  }

  applyRuleSection(token, intact) {
    var section = token.substr( - 1);
    var rules = ruleTable[section];

    if (rules) {
      for (var i = 0; i < rules.length; i++) {
        if ((intact || !rules[i].intact)
        && token.substr(0 - rules[i].pattern.length) == rules[i].pattern) {
          var result = token.substr(0, token.length - rules[i].size);

          if (rules[i].appendage)
          result += rules[i].appendage;

          if (this.acceptable(result)) {
            token = result;

            if (rules[i].continuation) {
              return this.applyRuleSection(result, false);
            } else {
              return result;
            }
          }
        }
      }
    }

    return token;
  }
}

module.exports = new Stemmer()
