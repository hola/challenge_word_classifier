import {IWordDictionaries, IPackedDictionary, ILodash} from "./Interfaces";
var fs = require("fs"), es = require("event-stream"), _ = require("lodash") as ILodash;

const wordsPath = "./Data/words.txt";
var dictionaries: IWordDictionaries = {};
var word, key, dictionary, wordData;

init();

function init() {
    createDictionary("Base", 0, 4);
    createDictionary("Temp", 4, 3);
    createDictionary("Temp2", 6, 4);
    createDictionary("Temp3", 2, 3);
    createDictionary("Temp4", 12, undefined);
}

function createDictionary(name: string, firstIndex: number, charCount: number) {
    dictionaries[name] = {
        name: name,
        path: "./Dictionaries/" + name,
        dictionary: [],
        rule: {
            firstIndex: firstIndex,
            charCount: charCount
        }
    };

    dictionaries[name].getData = function() {
        console.info("--- Prepare dictionary: " + this.name);
        console.info("--- --- Phase: 1 - Sort dictionary");
        this.dictionary.sort();
        console.info("--- --- Phase: 2 - Filter uniq");
        var data = _.sortedUniq(this.dictionary).join("\n") as string;
        console.info("--- --- Phase: 3 - Json convert\n");
        var packedDictionary: IPackedDictionary = {
            rule: {
                firstIndex: this.rule.firstIndex,
                charCount: this.rule.charCount
            },
            data: data
        };
        
        return JSON.stringify(packedDictionary);
    }
}


//var count = 0;
fs.createReadStream(wordsPath).pipe(es.split()).pipe(es.mapSync((line: string) => {
    word = line.toLowerCase();

    // if(word.indexOf("'") !== -1) {
    //     count++;
    // }
    //
    // var wordLength = word.length;
    //
    // if(wordLength > 6) {
    //     if(word.indexOf("'") > wordLength / 2 && word.lastIndexOf("'") < wordLength - 4) {
    //         console.info(word);
    //     }
    // }

    for(key in dictionaries) {
        dictionary = dictionaries[key];
        wordData = word.substr(dictionary.rule.firstIndex, dictionary.rule.charCount);
        dictionary.dictionary.push(wordData);
    }
})
.on("error", function(){
    console.log("Error.");
})
.on("end", () => {
    //console.info(count);
    for(key in dictionaries) {
        dictionary = dictionaries[key];
        fs.writeFileSync(dictionary.path, dictionary.getData(), {
            encoding: "binary"
        });
    }
}));