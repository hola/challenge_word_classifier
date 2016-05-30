import {IPackedDictionary, ITreeDictionary, IPackedData} from "./Interfaces";
var fs = require("fs"), util = require("util"), stream = require("stream"), es = require("event-stream");
var zlib = require('zlib');

const dictionariesPath = "./Dictionaries";
const dataPath = "./Data/data.txt";
const gzipOptions = {
    level: 9,
    chunkSize: 8 * 1024
};

var packedData: IPackedData = {
    dictionaries: {}
};

init();

function init() {
    var dictionariesFileNames = fs.readdirSync(dictionariesPath);

    for(var i = 0; i < dictionariesFileNames.length; i++) {
        packDictionaries(packedData.dictionaries, dictionariesFileNames[i]);
    }

    var serializedData = JSON.stringify(packedData);

    writeDataToFile(dataPath, serializedData);
    gzipDataToFile(dataPath, serializedData, gzipOptions);
}

function packDictionaries(packedDictionaries, name) {
    console.info("--- Init dictionary: " + name);
    console.info("--- --- Phase: 1 - Read and get json");
    var packedDictionary: IPackedDictionary = JSON.parse(fs.readFileSync(dictionariesPath + "/" + name));
    console.info("--- --- Phase: 2 - Build dictionary tree");
    var tree = buildTree(packedDictionary.data.split("\n"), {$: ""});
    console.info("--- --- Phase: 3 - Pack dictionary tree");
    packedDictionaries[name] = { rule: packedDictionary.rule, data: packTree(tree) };
    console.info("--- Init completed\n");
}

function writeDataToFile(path, data) {
    fs.writeFileSync(path, data, { encoding: "binary" });
}

function gzipDataToFile(path, data, options) {
    var compressedData = zlib.gzipSync(data, options);
    console.info("--- GZIP complete. Compressed file size: " + compressedData.length);
    writeDataToFile(path + ".gz", compressedData);
}

function packTree(tree) {
    var key;
    var str = "";

    var keysArr = [];
    for(key in tree) {
        if(key === "$" || key === "T") { continue; }
        keysArr.push(key);
    }

    for(var i = 0; i < keysArr.length; i++) {
        key = keysArr[i];
        str += key + ":" + packSubTree(tree[key]);
        if(i < keysArr.length - 1) {

            str += "\n";
        }
    }

    return str;
}

function packSubTree(tree) {
    var currNode = tree;
    var str = "";
    var key;

    var keysArr = [];
    for(key in currNode) {
        if(key === "$" || key === "T") { continue; }
        keysArr.push(key);
    }
    keysArr.sort();

    for(var i = 0; i < keysArr.length; i++) {
        key = keysArr[i];
        keysArr.splice(i, 1);
        i--;

        if(currNode[key]["T"]) {
            str += key;
        } else {
            str += key + ":";
            str += packSubTree(currNode[key]);
        }
    }

    str += ";";
    return str;
}

function buildTree(wordList, tRoot: ITreeDictionary) {
    var curNode, word, letters, i, j;
    for(i = 0; i < wordList.length; ++i)
    {
        word = wordList[i];
        letters = word.split("");
        curNode = tRoot;

        for(j = 0; j < letters.length; ++j)
        {
            if(!curNode[letters[j]])
            {
                curNode.T = false;
                curNode[letters[j]] = {};
                curNode[letters[j]].T = false;
                curNode[letters[j]].$ = letters[j];
            }
            curNode = curNode[letters[j]];
        }
        curNode.T = true;
    }
    
    return tRoot;
}