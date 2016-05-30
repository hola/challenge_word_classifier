var hashes = [];
var lefts = [];
var rights = [];
var three = {};

function wordhash(word) {
    lefts[128] = '';
    rights[128] = ''; 
    l = word.length;

    var left = 128;
    var right = 128;
    var clear_word = word;

    for (var i = 0; i < 128; i++) {
        if (String(lefts[i]).length && (word.indexOf(lefts[i]) == 0)) {
            // начинается с шаблона
            left = i;
            clear_word = clear_word.substr(String(lefts[i]).length);
            break;
        }
    }
    for (i = 0; i < 128; i++) {
        if (String(rights[i]).length && (clear_word.split('').reverse().join('').indexOf(String(rights[i]).split('').reverse().join('')) == 0)) {
            right = i;
            clear_word = clear_word.substr(0, clear_word.length-String(rights[i]).length);
            break;
        }
    }

    var hash = left | (right << 7);

    var ll = clear_word.length;
    hash = hash | (Number(ll > 3 && ll < 8) << 14);

    if (ll) {
        var key = Math.round(10*(ll-clear_word.replace(/[aeiou]/g, '').length)/ll); // отношение кол-ва гласных букв к длине слова
        var bin = Number(key > 5 && key < 9); // если отношение в процентах такое как в списке значений, то ставим 1 (60-80%)
        hash = hash | (bin << 15);

        key = Math.round(10*Math.max.apply(null, clear_word.replace(/[aeiou]/g, ' ').split(' ').map(function(element){return element.length;}))/ll); // кол-во подряд идущих согласных относительно длины слова в процентах
        bin = Number(key > 1 && key < 6); // если отношение как в списке то ставим 1
        hash = hash | (bin << 16);

        bin = Number(/[eaiuohlyrn]/.test(clear_word[0])); // если слово начинается с определённых букв, то ставим 1, остальные буквы встречаются реже
        hash = hash | (bin << 17);

        bin = Number(/[loidaesun]/.test(clear_word[ll-1])); // если последний символ такой, то 1
        hash = hash | (bin << 18);

        bin = Number(/[ohrsaelntp]/.test(clear_word[Math.floor(ll/2)])); // если средний символ такой, то 1
        hash = hash | (bin << 19);
    }

    return hash;
}


module.exports = {
    init: function (data){
        var s = String(data).split("\n");
        lefts = s.slice(0, 128);
        rights = s.slice(128, 256);

        var three_chars = data.slice(965,3162/*965+2197*/);
        for (var h = 0; h < 17576; h++) {
            var i = h >> 3;
            var j = h % 8;
            var c3 = String.fromCharCode(97+h % 26);
            var c2 = String.fromCharCode(97+Math.floor(h/26) % 26);
            var c1 = String.fromCharCode(97+Math.floor(h/676));
            three[c1+c2+c3] = (three_chars[i] & (1 << j)) > 0;
        }

        var chars = data.slice(3162);
        for (h = 0; h < Math.pow(2,20); h++) {
            var i = h >> 3; // целочисленное деление на 8, т.е. получаем номер символа в котором хранится бит для текущего хеша
            var j = h % 8; // остаток от деления на 8, т.е. получаем номер бита, который соответствует текущему хешу (будем использовать как маску для получения значения бита)
            if ((chars[i] & (1 << j)) > 0) {
                hashes.push(h);
            }
        }
    },
    test: function (word){
        l = word.length;
        if (l == 1 && word != "'") {
            return true;
        }
        if (l > 17 || l <= 1) {
            return false;
        }
        if (word.indexOf("'") >= 0 && (word.indexOf("'s") < 0 || word[l-2] != "'")) {
            return false;
        }
        if (l>2) {
            for (i = 0; i <= l-3; i++) {
                var key = word[i]+word[i+1]+word[i+2];
                if (key.indexOf("'") >= 0) {
                    continue;
                }
                if (three[key]) {
                    return false; // если в слове встречается комбинация из 3 символов, которая помечена как не существующая в словаре, то сразу возвращаем false
                }
            }
        }
        var hash = wordhash(word);
        if (hashes.indexOf(hash) >= 0) {
            return true; // true (слово есть в солваре), иначе false (слова нет в словаре)
        }
        return false;
    }
}
