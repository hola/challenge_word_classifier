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
 const rareRx = /[qjxzwvkfbg]/g;
//const rareRx = /[qjxzwvkfybghpmducl]/g;
const apRx = /'/g;
const apsRx = /'s/g;

exports.replaceRare = w => w.replace(/y/g, 'i').replace(/[au]/g, 'o').replace(rareRx, 'q').replace(apsRx, "");

// exports.replaceRare = w => w
//     .replace(/q/g, 'k')
//     .replace(/[tp]h/g, 'f')
//     .replace(/ch/g, 's')
//     //.replace(/wr/g, 'r')
//     //.replace(/[pgk]n/g, 'n')
//     .replace(/ae/g, 'e')
//     //.replace(/mb$/g, 'm')
//     //.replace(/gh/g, '')
//     .replace(/gg/g, 'kk')
//     .replace(/d?g([eiy])/g, "j$1")
//     .replace(/g/g, 'k')
//     .replace(/c([eiy])/g, "s$1")
//     .replace(/c/g, 'k')
//     .replace(/x/g, 'ks')
//     .replace(/[jz]/g, 's')
//     .replace(/y/g, 'i')
//     .replace(/b/g, 'p')
//     .replace(/v/g, 'w')
//     .replace(/h/g, 'f')
//     .replace(/d/g, 't')
//     .replace(/[au]/g, 'o')
//     .replace(apsRx, "");

exports.containsBadSequences = word => {
    
}

const vowels = 'eaoiuy';

exports.deleteVowels = word => {
    if (word.length <= 5) return word;
    const arr = word.slice(0, 3);
    for (let i = 3; i < word.length; ++i) {
        
    }
};