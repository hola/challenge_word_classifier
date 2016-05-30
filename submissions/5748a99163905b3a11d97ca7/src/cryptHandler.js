module.exports = function cryptHandler() {

    this.init = function (dictionary) {

        var encryptedWords = [];

        for (i = 0; i < dictionary.length; i++) {
            var word = (dictionary[i]).toLowerCase();

            var newEncryptedWord = this.encryptWord(word);

            var isNew = encryptedWords.filter(function (word) {
                return word === newEncryptedWord
            });

            if (isNew.length === 0) {
                encryptedWords.push(newEncryptedWord);
            }

        }

        return encryptedWords;
    };

    this.encryptWord = function (word) {
        return this.encryptEverythig(word);
    };


    this.encryptEverythig = function (word) {
        var encryptedWord = "";

        var nonRepetedCharacters = {
            consonants: {
                value: [],
                encryption: {}
            },

            vowels: {
                value: [],
                encryption: {}
            }
        };


        for (var j = 0; j < word.length; j++) {

            var charToReplace = word[j];

            if (charToReplace !== "e" && charToReplace !== "s" && charToReplace !== "c"
                && charToReplace !== "a" && charToReplace !== "m"  && charToReplace !== "y" && charToReplace !== "l") {

                var findConsonant = nonRepetedCharacters.consonants.value.filter(function (char) {
                    return char === charToReplace;
                });

                var findVowel = nonRepetedCharacters.vowels.value.filter(function (char) {
                    return char === charToReplace
                })


                // NEW CHAR
                if (findConsonant.length === 0 && findVowel.length === 0) {

                    if (this.isVowel(charToReplace)) {
                        var lastVowel = this.findLastEncryptedVowel(encryptedWord);
                        var nextEncryptedVowel = this.nextChar(lastVowel);
                        encryptedWord += nextEncryptedVowel;

                        //used char needed to be pusehd
                        nonRepetedCharacters.vowels.value.push(charToReplace);
                        //map values
                        nonRepetedCharacters.vowels.encryption[charToReplace] = nextEncryptedVowel;

                    } else {
                        var lastEncryptedConsonant = this.findLastEncryptedConsonant(encryptedWord);
                        var nextEncryptedConsonant = lastEncryptedConsonant + 1;
                        encryptedWord += nextEncryptedConsonant;

                        //used char needed to be pusehd
                        nonRepetedCharacters.consonants.value.push(charToReplace);
                        //map values
                        nonRepetedCharacters.consonants.encryption[charToReplace] = nextEncryptedConsonant;
                    }

                }


                if (findConsonant.length !== 0) {

                    var nextEncryptedConsonant = this.savedConsonant(charToReplace, nonRepetedCharacters.consonants);
                    encryptedWord += nextEncryptedConsonant;

                }

                if (findVowel.length !== 0) {
                    var nextEncryptedVowel = this.savedVowel(charToReplace, nonRepetedCharacters.vowels);
                    encryptedWord += nextEncryptedVowel;
                }


            }

        }

        return encryptedWord;
    };

    this.isVowel = function (char) {
        return char === 'a' || char === 'e' || char === 'i' || char === 'o' || char === 'u';
    };

    this.isEncryptedVowel = function (char) {
        return char.match(/[a-z]/i);
    };

    this.nextChar = function (char) {
        if (char === "")
            return 'a';
        else
            return char.substring(0, char.length - 1) + String.fromCharCode(char.charCodeAt(char.length - 1) + 1);

    };

    this.findLastEncryptedVowel = function (encryptedWord) {
        var biggestChar = "";

        for (var i = encryptedWord.length - 1; i >= 0; i--) {
            var char = encryptedWord[i];

            if (this.isEncryptedVowel(char)) {
                if (biggestChar < char) {
                    biggestChar = char
                }
            }

        }

        return biggestChar;
    };

    this.findLastEncryptedConsonant = function (word) {
        var biggestNumber = -1;

        for (var i = word.length - 1; i >= 0; i--) {
            var char = word[i];

            if (!isNaN(parseInt(char))) {

                if (biggestNumber < parseInt(char)) {
                    biggestNumber = parseInt(char);
                }
            }

        }

        return biggestNumber;
    };

    this.savedConsonant = function (char, persistedConsonants) {
        return persistedConsonants.encryption[char];
    };

    this.savedVowel = function (char, persistedVowels) {
        persistedVowels.encryption[char];
        return persistedVowels.encryption[char];
    };

}
