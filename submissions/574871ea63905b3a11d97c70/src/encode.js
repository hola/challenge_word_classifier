var fs = require("fs");
var mod = require('./solution.js');

fs.readFile('words.txt', {encoding: 'utf8'}, function (err, data) {
    if (err) throw err;
    var words = data.split('\n');
    var dictionary = {};

    var percent = 0;
    var oldPercent = -1;
    var lenWords = words.length;

    words.forEach(function (word, i) {
        percent = Math.round(i / (lenWords / 100));
        if (word) {
            var sound = mod.encode(word);

            dictionary[sound] = true;

            if (percent !== oldPercent) {
                console.log('% : ' + percent);
                oldPercent = percent;
            }
        }
    });

    var mass = [];

    Object.keys(dictionary).forEach(function (item) {
        var simbol = item[0];
        var number = Number(item.slice(1));

        mass[number] = mass[number] ? mass[number] + simbol : simbol;
    });

    var preIndex = -1;
    var filterMass = [];

    var percent2 = 0;
    var oldPercent2 = -1;
    var lenWords2 = mass.length;

    var addRangeLetters = function (item) {
        var arr = item.split("");

        return arr.sort(function (a, b) {
            return a.charCodeAt() - b.charCodeAt();
        }).map(function (s, i) {
            if (arr[i - 1] && arr[i + 1] && s.charCodeAt() + 1 === arr[i + 1].charCodeAt()) {
                if ((i - 1) > 1 && arr[i - 1].charCodeAt() !== s.charCodeAt() - 1) {
                    return s;
                }

                return '-';
            } else {
                return s;
            }
        }).join("").replace(/\-+/g, "-");
    };


    mass.forEach(function (item, index) {
        percent2 = Math.round(index / (lenWords2 / 100));

        if (item) {
            var diff = index - preIndex - 1;

            if (diff) {
                filterMass.push(diff);
            }

            filterMass.push(addRangeLetters(item));

            preIndex = index;
        }

        if (percent2 !== oldPercent2) {
            console.log('% : ' + percent2);
            oldPercent2 = percent2;
        }
    });

    fs.writeFile("soundexEncode.json", JSON.stringify(filterMass), function (err) {
        if (err)
            console.log("Ничего не вышло, и вот почему:", err);
        else
            console.log("Запись успешна. Все свободны." + Object.keys(dictionary).length);
    });
});

