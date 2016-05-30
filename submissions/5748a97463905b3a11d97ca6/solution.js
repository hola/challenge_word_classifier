var dataForClassification;

function getOccurrences(word, character) {
    var occurrences = [];
    for (var i = 0; i < word.length; ++i) {
        if (word[i] == character) {
            occurrences.push(i);
        }
    }
    return occurrences;
}

var CONSONANTS = "bcdfghjklmnpqrstvwxyz";
var VOWELS = "aeiou";
var ALLOWED_CHARACTERS = "'abcdefghijklmnopqrstuvwxyz";
var ALLOWED_CHARACTERS_WITHOUT_APOSTROPHE = "abcdefghijklmnopqrstuvwxyz";

function isConsonant(letter) {
    return CONSONANTS.indexOf(letter) > -1;
}

function isVowel(letter) {
    return VOWELS.indexOf(letter) > -1;
}

var outliersClassifiers = {
    "length": function(word) {
        var wordLength = word.length;
        if (wordLength > 60)
            return [">60"];
        else {
            return [wordLength]
        }
    },
    "apostrophe": function(word) {
        var occurrences = getOccurrences(word, '\'');
        if (occurrences.length == 0) {
            return ["no"];
        } else if (occurrences.length == 1) {
            if ((occurrences[0] == word.length - 2) &&
                (word.slice(-1) == 's')) {
                return ["one_plus_s_in_end"];
            }
        }

        return ["many_or_not_s_in_end"];
    },
    "pairs": function(word) {
        var pairs = [];
        for (var i = 0; i < word.length-1; ++i) {
            var pair = word[i] + word[i+1];
            pairs.push(pair);
        }
        return pairs;
    },
    "triplets": function(word) {
        var triplets = [];
        for (var i = 0; i < word.length-2; ++i) {
            var triplet = word[i] + word[i+1] + word[i+2];
            triplets.push(triplet);
        }
        return triplets;
    },
    "last_pair": function(word) {
        if (word.length < 2) {
            return ["None"];
        } else {
            var lastTwoLetters = word.slice(-2);
            if (lastTwoLetters == "'s") {
                if (word.length < 4) {
                    return ["None"];
                } else {
                    return [word.slice(-4, -2)];
                }
            }

            return [lastTwoLetters];

        }
    }
};

var PAIRS = [];
for (var i = 0; i < ALLOWED_CHARACTERS_WITHOUT_APOSTROPHE.length; ++i) {
    for (var j = 0; j < ALLOWED_CHARACTERS.length; ++j) {
        PAIRS.push(ALLOWED_CHARACTERS_WITHOUT_APOSTROPHE[i] + ALLOWED_CHARACTERS[j]);
    }
}

function calculateWordProbabilityLengthAndLetters(probabilities, limit, word) {
    var probability = 1.0;
    for (var i = 0; i < Math.min(limit, word.length); ++i) {
        var letter = word[i];
        probability *= probabilities[i][letter];
    }

    return probability;
}

function reverseWordAndDeleteApostrophe(word){
    if (word.length >=2) {
        if (word.slice(-2) == "'s") {
            word = word.substr(0, word.length - 2);
        }
    }
    return word.split("").reverse().join("");
}

function getLettersProbabilities() {
    return dataForClassification["lettersProbabilities"];
}

function getReverseLettersProbabilities() {
    return dataForClassification["lettersReverseProbabilities"];
}

var features = {
    "wordLengthFeature": function(word) {
        return [word.length];
    },

    "consonantsMinusVowelsFeature": function(word) {
        var consonants = 0;
        var vowels = 0;
        for (var i = 0; i < word.length; ++i) {
            if (isConsonant(word[i])) {
                consonants += 1;
            } else if (isVowel(word[i])) {
                vowels += 1;
            }

        }

        return [consonants - vowels];
    },

    "apostropheFeature": function(word) {
        if (word.length >= 2) {
            if (word.slice(-2) == "'s") {
                return [1];
            }
        }

        return [0];
    },

    "firstLetterFeature": function(word) {
        if (word.length == 0) {
            return [-1];
        } else {
            return [ALLOWED_CHARACTERS.indexOf(word[0])];
        }
    },

    "lastLetterFeature": function(word) {
        if (word.length == 0) {
            return [-1];
        } else {
            return [ALLOWED_CHARACTERS.indexOf(word.slice(-1))];
        }
    },

    "firstVowelFeature": function(word) {
        for (var i = 0; i < word.length; ++i) {
            if (isVowel(word[i])) {
                return [ALLOWED_CHARACTERS.indexOf(word[i])];
            }
        }
        return [-1]
    },

    "lastVowelFeature": function(word) {
        for (var i = word.length-1; i >=0; --i) {
            if (isVowel(word[i])) {
                return [ALLOWED_CHARACTERS.indexOf(word[i])];
            }
        }
        return [-1]
    },

    "firstConsonantFeature": function(word) {
        for (var i = 0; i < word.length; ++i) {
            if (isConsonant(word[i])) {
                return [ALLOWED_CHARACTERS.indexOf(word[i])];
            }
        }
        return [-1]
    },

    "lastConsonantFeature": function(word) {
        for (var i = word.length-1; i >=0; --i) {
            if (isConsonant(word[i])) {
                return [ALLOWED_CHARACTERS.indexOf(word[i])];
            }
        }
        return [-1]
    },

    "consonantsInARowFeature": function(word) {
        var maxConsonantsInARow = 0;
        var curConsonantsInARow = 0;

        for (var i = 0; i < word.length; ++i) {
            if (isConsonant(word[i])) {
                curConsonantsInARow += 1;
                maxConsonantsInARow = Math.max(maxConsonantsInARow, curConsonantsInARow);
            } else {
                curConsonantsInARow = 0;
            }
        }

        return [maxConsonantsInARow];
    },

    "wordProbabilityFeature": function(word) {
        return [calculateWordProbabilityLengthAndLetters(getLettersProbabilities(), 60, word),
                calculateWordProbabilityLengthAndLetters(getLettersProbabilities(), 3, word)];
    },

    "wordProbabilityReverseFeature": function(word) {
        var preparedWord = reverseWordAndDeleteApostrophe(word);
        return [calculateWordProbabilityLengthAndLetters(getReverseLettersProbabilities(), 3, preparedWord),
                calculateWordProbabilityLengthAndLetters(getReverseLettersProbabilities(), 2, preparedWord)];
    },

    "lettersFeature": function(word) {
        var result = [];
        for (var i = 0; i < ALLOWED_CHARACTERS_WITHOUT_APOSTROPHE.length; ++i) {
            result.push(0);
        }

        for (i = 0; i < word.length; ++i) {
            var letterNumber = ALLOWED_CHARACTERS_WITHOUT_APOSTROPHE.indexOf(word[i]);
            if (letterNumber > -1) {
                result[letterNumber] += 1;
            }
        }

        return result;
    }
};

function calcFeature(featureName, word) {
    return features[featureName](word);
}

function getOutliers() {
    return dataForClassification["outliers"];
}

function getFeaturesUsed() {
    return dataForClassification["featuresUsed"];
}

function getDecisionTrees() {
    return dataForClassification["decisionTrees"];
}

function isOutlierClassifierAvailable(outliersType) {
    return outliersType in outliersClassifiers;
}

function isFeatureAvailable(featureName) {
    return featureName in features;
}


function calculateFeatures(featuresToUse, word) {
    var features = [];
    for (var i = 0; i < featuresToUse.length; ++i) {
        var currentFeatures = calcFeature(featuresToUse[i], word);
        Array.prototype.push.apply(features, currentFeatures);
    }

    return features;
}

function calculateProbabilityForSingleTree(features, tree) {
    var weight = tree["w"];

    var currentBranch = tree["t"];

    while (true) {

        if (0 in currentBranch) {
            var negativeProbability = currentBranch[0];
            var positiveProbability = currentBranch[1];
            var sum = negativeProbability + positiveProbability;
            var normalizedProbabilities = [negativeProbability / sum, positiveProbability / sum];
            return [normalizedProbabilities[0] * weight, normalizedProbabilities[1] * weight];
        } else {
            var lessOrEqual = currentBranch["le"];
            var featureToCompare = features[currentBranch["f"]];

            if (featureToCompare <= lessOrEqual) {
                currentBranch = currentBranch["l"];
            } else {
                currentBranch = currentBranch["r"];
            }
        }
    }
}

function calcSammeProbabilities(probabilities) {
    var EPSILON = 2.2204460492503130808472633361816E-16;
    var nonZeroNegative = probabilities[0] < EPSILON ? EPSILON : probabilities[0];
    var nonZeroPositive = probabilities[1] < EPSILON ? EPSILON : probabilities[1];

    var logNegative = Math.log(nonZeroNegative);
    var logPositive = Math.log(nonZeroPositive);
    var halfSum = (logPositive + logNegative) / 2.0;

    var sammeNegative = logNegative - halfSum;
    var sammePositive = logPositive - halfSum;

    return [sammeNegative, sammePositive]
}

function treesWeightsSum(trees) {
    var sum = 0.0;

    for (var i = 0; i < trees.length; ++i) {
        sum += trees[i]["w"];
    }

    return sum;
}

function classifyFeaturesWithDecisionTrees(decisionTrees, features) {

    var totalProbabilityPositive = 0.0;
    var totalProbabilityNegative = 0.0;

    var weightsSum = treesWeightsSum(decisionTrees);
    for (var i = 0; i < decisionTrees.length; ++i) {
        var probabilities = calculateProbabilityForSingleTree(features, decisionTrees[i]);
        var transformedProbabilities = calcSammeProbabilities(probabilities, weightsSum);

        totalProbabilityNegative += transformedProbabilities[0];
        totalProbabilityPositive += transformedProbabilities[1];

    }

    totalProbabilityNegative /= weightsSum;
    totalProbabilityPositive /= weightsSum;

    return totalProbabilityPositive >= totalProbabilityNegative;
}

function classifyAsOutlier(outliersType, word) {
    return outliersClassifiers[outliersType](word);
}

var NOT_OUTLIER = 0;
var OUTLIER_AND_POSITIVE = 1;
var OUTLIER_AND_NEGATIVE = 2;

function isOutlier(outliers, word) {
    for (var outliersType in outliers) {
        var classes = classifyAsOutlier(outliersType, word);

        for (var i = 0; i  < classes.length; ++i) {
            var oneClass = classes[i];

            if (oneClass in outliers[outliersType]) {
                for (var j = 0; j < outliers[outliersType][oneClass].length; ++j) {
                    if (word == outliers[outliersType][oneClass][j]) {
                        return OUTLIER_AND_POSITIVE;
                    }
                }

                return OUTLIER_AND_NEGATIVE;
            }
        }

    }

    return NOT_OUTLIER
}

module.exports = {

    init: function(data) {
        dataForClassification = JSON.parse(data);
    },

    test: function(word) {
        var outlierTestResult = isOutlier(getOutliers(), word);

        if (outlierTestResult == NOT_OUTLIER) {
            var features = calculateFeatures(getFeaturesUsed(), word);
            return classifyFeaturesWithDecisionTrees(getDecisionTrees(), features)
        } else
            return outlierTestResult == OUTLIER_AND_POSITIVE;
    },

    // just for tests
    getOutliers: getOutliers,
    getFeaturesUsed: getFeaturesUsed,

    classifyAsOutlier: classifyAsOutlier,

    isOutlierClassifierAvailable: isOutlierClassifierAvailable,
    isFeatureAvailable: isFeatureAvailable,

    NOT_OUTLIER: NOT_OUTLIER,
    OUTLIER_AND_POSITIVE: OUTLIER_AND_POSITIVE,
    OUTLIER_AND_NEGATIVE: OUTLIER_AND_NEGATIVE,

    isOutlier: isOutlier,

    calcFeature: calcFeature,
    calculateFeatures: calculateFeatures,
    calculateProbabilityForSingleTree: calculateProbabilityForSingleTree,
    getOccurrences:getOccurrences,
    classifyFeaturesWithDecisionTrees: classifyFeaturesWithDecisionTrees,
    calculateWordProbabilityLengthAndLetters: calculateWordProbabilityLengthAndLetters,
    reverseWordAndDeleteApostrophe:reverseWordAndDeleteApostrophe
};