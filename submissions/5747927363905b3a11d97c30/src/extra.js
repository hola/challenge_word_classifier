const tobj = {
    'ing': 'A',
    //'ess': 'Y',
    //"'s": 'B',
    'er': 'C',
    // 'in': 'D',
    'es': 'E',
    // 'on': 'F',
    // 'an': 'G',
    // 'ti': 'H',
    // 'te': 'I',
    // 'is': 'J',
    // 'en': 'K',
    // 'at': 'L',
    // 're': 'M',
    // 'al': 'N',
    // 'ri': 'O',
    // 'le': 'P',
    // 'ra': 'Q',
    // 'ar': 'R',
    // 'ne': 'S',
    // 'st': 'T',
    // 'li': 'U',
    // 'ro': 'V',
    // 'ic': 'W',
    // 'or': 'X',
    // 'nt': 'Z'
};

exports.hex = new Array(36).fill(0).map((_, i) => i < 10 ? `${i}` : String.fromCharCode(55 + i));

exports.letters = new Array(26).fill(0).map((_, i) => String.fromCharCode(97 + i));


const rx = new RegExp(Object.keys(tobj).join('|'), 'g');

exports.replaceCombos = word => word.toLowerCase().replace(rx, matched => tobj[matched]);

//const rareRx = /[qjxzw]/g;
 const rareRx = /[qjxzwvkfbgh]/g;
//const rareRx = /[qjxzwvkfybghpmducl]/g;
const apRx = /'/g;
const apsRx = /'s/g;

exports.replaceRare = w => w.replace(/y/g, 'i').replace(/[au]/g, 'o').replace(rareRx, 'q').replace(apsRx, "");
//replace(/k/g, 'g').replace(/b/g, 'p')

exports.containsBadSequences = word => {
    
}

const vowels = 'eaoiuy';

exports.deleteVowels = word => {
    if (word.length <= 5) return word;
    const arr = word.slice(0, 3);
    for (let i = 3; i < word.length; ++i) {
        
    }
};