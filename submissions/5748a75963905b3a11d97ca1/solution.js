exports.init = function(data) {
    let allData = JSON.parse(data.toString());
    this.data = allData.a;
    this.template = allData.b;
};
exports.test = function(word) {
    if (word === '\'' || word.length > this.data.length) {
        return false;
    } else if (word.length === 1) {
        return true;
    }

    let maxItemChance = 1; // derived empirically
    let maxAvgChance = 40; // derived empirically
    let resultChance = [];
    let alpha = 'abcdefghijklmnopqrstuvwxyz\''.split('');

    for (let i = 1; i < word.length; ++i) {
        let wordTemplate = this.getTemplate(word);

        if (this.template.indexOf(wordTemplate) === -1) {
            return false;
        }

        let chance = this.data[i-1][alpha.indexOf(word[i])];
        if (chance < maxItemChance) {
            return false;
        } else {
            resultChance.push(chance);
        }
    }

    let avgChance = resultChance.reduce((v1, v2) => v1 + v2, 0) / resultChance.length;

    return avgChance >= maxAvgChance;
};

exports.getTemplate = function(word) {
    let alphaG = 'aeiouy'.split('');
    let alphaS = 'bcdfghjklmnpqrstvwxz'.split('');
    let alphaTemplate = {g: 'G', s: 'S', q: 'Q'};
    let wordTemplate = '';

    for (let j = 0; j < word.length; ++j) {
        let letter = word[j];

        if (alphaG.indexOf(letter) !== -1) {
            wordTemplate += alphaTemplate.g;
        } else if (alphaS.indexOf(letter) !== -1) {
            wordTemplate += alphaTemplate.s;
        } else {
            wordTemplate += alphaTemplate.q;
        }
    }

    return wordTemplate;
}
