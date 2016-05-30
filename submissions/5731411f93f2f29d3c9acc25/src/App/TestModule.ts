import {IPackedData, IPackedDictionaries, IDictionaryTrees, ITreeDictionary} from "./Interfaces";
var dictionaryTrees: IDictionaryTrees = {};

function buildTree(tree: ITreeDictionary, data: string): ITreeDictionary {
    var treeRootNodeString = data.split("\n"), nodeDataObject, i;

    for (i = 0; i < treeRootNodeString.length; i++) {
        nodeDataObject = {
            data: treeRootNodeString[i]
        };

        buildNode(tree, nodeDataObject);
    }

    return tree;
}

function removeNodeDataFirstChar(nodeDataObject) {
    nodeDataObject.data = nodeDataObject.data.substr(1);
}

function buildNode(parentNode, nodeDataObject) {
    var i, nodeStringChar, nextNodeStringChar;

    for (i = 0; i < nodeDataObject.data.length; i++) {
        nodeStringChar = nodeDataObject.data.charAt(i);
        nextNodeStringChar = (i === nodeDataObject.data.length - 2) ? "" : nodeDataObject.data.charAt(i + 1);

        if (nodeStringChar === ";") {
            removeNodeDataFirstChar(nodeDataObject);
            return;
        }

        parentNode[nodeStringChar] = {
            $: nodeStringChar
        };

        removeNodeDataFirstChar(nodeDataObject);

        if (nextNodeStringChar === ":") {
            removeNodeDataFirstChar(nodeDataObject);
            buildNode(parentNode[nodeStringChar], nodeDataObject);
        }

        if (nextNodeStringChar === ";") {
            removeNodeDataFirstChar(nodeDataObject);
            return;
        }

        i--;
    }
}

function inDictionary(tree, word: string) {
    var node = tree, currChar, i;

    for (i = 0; i < word.length; i++) {
        currChar = word.charAt(i);

        if (Object.keys(node).length === 1) {
            return true;
        }

        node = node[currChar];

        if (!node) {
            return false;
        }
    }

    return true;
}

function getParsedData(data: Buffer) {
    return JSON.parse(data.toString());
}

function buildTrees(dictionaries: IPackedDictionaries) {
    for(var key in dictionaries) {
        dictionaryTrees[key] = {
            rootNode: buildTree({$:""}, dictionaries[key].data),
            rule: dictionaries[key].rule
        };
    }
}

function isInDictionaries(word) {
    var failCount = 0;

    for(var key in dictionaryTrees) {
        var dictionaryTree = dictionaryTrees[key];
        var dicWord = word.substr(dictionaryTree.rule.firstIndex, dictionaryTree.rule.charCount);

        if(!inDictionary(dictionaryTree.rootNode, dicWord)) {
            failCount++;
        }
    }

    return failCount <= 0;
}

function isVowelOk(word: string) {
    var result = true;
    var vowel = ["a", "e", "i", "o", "u", "y"];
    var notVowel = ["q", "w", "r", "t", "p", "s", "d", "f", "g", "h", "j", "k", "l", "z", "x", "c", "v", "b", "n", "m"];

    var existsVowels = [];
    var existsNotVowels = [];

    for(var i = 0; i < word.length; i++) {
        var char = word.charAt(i);
        if(vowel.indexOf(char) !== -1) {
            existsVowels.push(char);
        } else {
            existsVowels.length = 0;
        }

        if(notVowel.indexOf(char) !== -1) {
            existsNotVowels.push(char);
        } else {
            existsNotVowels.length = 0;
        }

        if(existsVowels.length >= 6 || existsNotVowels.length >= 6) {
            result = false;
            break;
        }
    }

    return result;
}

function isBaseOk(word: string) {
    var result = true;
    if(word.charAt(0) === "'") { // Исключение слова, когда первый символ - апостроф
        result = false;
    }

    var wordLength = word.length;
    if(wordLength > 6) {
        if(word.indexOf("'") > wordLength / 3.145 && word.lastIndexOf("'") < wordLength - 2) {
            return false;
        }
    }

    if(word.indexOf("'") !== word.lastIndexOf("'")) { // Исключение двух апострофов в слове
        result = false;
    }


    return result;
}

exports.init = (data: Buffer) => {
    var packedData: IPackedData = getParsedData(data);
    buildTrees(packedData.dictionaries);
};
exports.test = (data: string) => {
    var result = true;
    var word = data.toLowerCase();
    var inDictionary = isInDictionaries(word);

    if(!isVowelOk(word) || !isBaseOk(word)) {
        result = false;
    }

    if(result) {
        result = inDictionary;
    }

    return result;
};