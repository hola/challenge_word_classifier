var bf = require("../bloomfilter"), BloomFilter = bf.BloomFilter;

var vows = require("vows"),
    assert = require("assert");

var suite = vows.describe("bloomfilter");

var jabberwocky = "`Twas brillig, and the slithy toves\n  Did gyre and gimble in the wabe:\nAll mimsy were the borogoves,\n  And the mome raths outgrabe.\n\n\"Beware the Jabberwock, my son!\n  The jaws that bite, the claws that catch!\nBeware the Jubjub bird, and shun\n  The frumious Bandersnatch!\"\n\nHe took his vorpal sword in hand:\n  Long time the manxome foe he sought --\nSo rested he by the Tumtum tree,\n  And stood awhile in thought.\n\nAnd, as in uffish thought he stood,\n  The Jabberwock, with eyes of flame,\nCame whiffling through the tulgey wood,\n  And burbled as it came!\n\nOne, two! One, two! And through and through\n  The vorpal blade went snicker-snack!\nHe left it dead, and with its head\n  He went galumphing back.\n\n\"And, has thou slain the Jabberwock?\n  Come to my arms, my beamish boy!\nO frabjous day! Callooh! Callay!'\n  He chortled in his joy.\n\n`Twas brillig, and the slithy toves\n  Did gyre and gimble in the wabe;\nAll mimsy were the borogoves,\n  And the mome raths outgrabe.";

var fs = require("fs");

suite.addBatch({
    "bloom filter": {

        "newFile": function () {

            fs.readFile("/Users/wihoho/Downloads/challenge_word_classifier-master/words.txt", function (err, data) {

                var lines = data.toString().split('\n');
                var bloomFilter = BloomFilter.createOptimal(lines.length, 0.71);
                for (var i = 0; i < lines.length; i++) {
                    bloomFilter.add(lines[i]);
                }

                fs.writeFile("/Users/wihoho/Downloads/word_classifier/data.dat", bloomFilter.serialize(), function (err) {
                    if (err) {
                        return console.log(err);
                    }

                    console.log("The file was saved!");
                });

            });
        },

        "basic": function () {
            //var f = BloomFilter.createOptimal(4, 0.0001),
            //    n1 = "Bess",
            //    n2 = "Jane";
            //f.add(n1);
            //assert.equal(f.test(n1), true);
            //assert.equal(f.test(n2), false);
            //
            //var str1 = f.serialize();
            //var newF = BloomFilter.deserialize(str1);
            //console.log();
            //
            //assert.equal(newF.test(n1), true);
            //assert.equal(newF.test(n2), false);

            var obj = {
                "coucherincemen's": false,
                "uqxvykncidb'tquzozc": false,
                "agesorbimeoreriechlongorier": false,
                "riatreralcles": false,
                "chiran": true,
                "rootfast": true,
                "nemophilous": true,
                "mple": false,
                "'niqwlvcsycgiagwiknpst": false,
                "mawms": false,
                "laking": true,
                "ulioss": false,
                "dohnnyi's": true,
                "ngeris": false,
                "summertime": true,
                "gomokus": true,
                "hemstitcher": true,
                "clothespins": true,
                "longstop's": true,
                "pyrol's": false,
                "'ojos'jqharh": false,
                "reconsidereal": false,
                "islesmen": true,
                "candell": false,
                "infructuosity": true,
                "bish": true,
                "malariate": false,
                "wickers": true,
                "'pwv": false,
                "shycatialeywilinphypa": false,
                "nonmythological": true,
                "yountville": true,
                "canape": true,
                "subeditors": true,
                "sheepfoots": true,
                "mwxsohexvhcnoxydrujanu'qa": false,
                "bipartistic": false,
                "archflatterer": true,
                "ozartuzubxf": false,
                "nicknack": true,
                "chanders": false,
                "inselberg": true,
                "blepharelcosis": true,
                "fieldton's": true,
                "tlatendimanche": false,
                "dispiri's": false,
                "unpristolognaph": false,
                "nonconvivialist": false,
                "hansoms": true,
                "pinbone": true,
                "superincumbently": true,
                "ageistic": false,
                "unalises": false,
                "edulcorators": true,
                "mafia's": true,
                "hymnologists": true,
                "acrasped": false,
                "calipeva": true,
                "microergate": false,
                "isomerism": true,
                "serological": true,
                "fleshly": true,
                "pidgeons": true,
                "foudrie": true,
                "colycosmosopin": false,
                "cy'sh": false,
                "discurre": true,
                "grooteriomorphyrioriness": false,
                "salutationalists": false,
                "cbi": true,
                "qurokpekdrhcrovxfp": false,
                "unyachtsmanlike": true,
                "conciliatorinesses": true,
                "blabbermouth's": true,
                "extrinifortimaten": false,
                "theocentrism": true,
                "suboffice's": true,
                "untacks": true,
                "ewlledelyare'stss": false,
                "mussiness's": true,
                "cpzhkba": false,
                "piddling": true,
                "unaryling": false,
                "polychromism": true,
                "brustalcognonnered": false,
                "okens": false,
                "tachytelic": true,
                "forsaying": true,
                "exponence": true,
                "dicirdnel": false,
                "teness's": false,
                "pographing": false,
                "btol": true,
                "whjdzf'uhboeps": false,
                "bestarring": true,
                "branches": true,
                "reenlistments": true,
                "oversaved": true,
                "absbh": true,
                "obtainer's": true
            };

            fs.readFile("/Users/wihoho/Downloads/word_classifier/data.dat", function (err, data) {

                bf.init(data);

                var counter = 0;
                var correct = 0;

                for (var item in obj) {
                    if (bf.test(item) == obj[item]) {
                        correct += 1;
                    }
                    counter += 1;
                }

                console.log(correct / counter);
            });
        }
    }
});

suite.export(module);
