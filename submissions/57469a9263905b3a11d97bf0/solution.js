module.exports = {
    voc: [],
    init: function (data) {
        this.voc = data.toString().split('|');
        console.log(this.voc.length);
    },
    test: function (word) {
        let blacklist = [
            'bjk', 'vsq', 'ycf', 'gpyz', 'qhb', 'jks',
            'mmp', 'rlg', 'wlf', 'wtz', 'rroo', 'mwc',
            'nth', 'ndq', 'dnd', 'wxr', 'qlf', 'eev', 'utu', 'ndf', 'ceae',
            'wmb','mgz'
        ];

        let whitelist = [
            'nymousness','nymity'
        ];
        let tmp = word.replace("'s", "").replace(/[aeioyu]/g, '');
        if(this.voc.indexOf(tmp) != -1) {
            return true;
        }

        for (var a in blacklist) {
            if(word.indexOf(blacklist[a]) != -1) {
                console.log(word);
                return false;
            }
        }

        for (var b in whitelist) {
            if(word.indexOf(whitelist[b]) != -1) {
                return true;
            }
        }

        if(word.length > 13 || word.length < 3) {
            return false;
        }
        let exp = word.split("'");
        if(exp.length > 2) {
            return false;
        }
        if(exp.length > 1 && exp[1].length > 2) {
            return false;
        }
        if(word.match(/a{2,}|j{2,}|k{2,}|q{2,}|v{2,}|w{2,}|x{2,}|y{2,}|p{2,}/g)) {
            return false;
        }

        console.log('Superchecker: ' + word);
        for (var i in this.voc) {
            if(this.voc[i].length > 4) {
                continue;
            }
            for (var j in this.voc) {
                if(this.voc[j].length > 4) {
                    continue;
                }
                if(tmp.indexOf(this.voc[i] + this.voc[j])!=-1) {
                    return false;
                }
            }
        }

        return true;
    }

};