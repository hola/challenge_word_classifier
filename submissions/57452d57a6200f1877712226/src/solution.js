var symbols = ["'s","s","te","er","li","in","re","c","ri","a","es","en","al","ti","le","la","ni","ra","an","p","ro","b","ed","is","st","ch","to","or","ma","f","un","di","de","ne","ta","ic","mi","th","us","g","ng","ar","na","at","lo","on","y","ll","me","si","ho","el","ur","co","w","tr","no","e","it","ly","ha","d","as","r","et","mo","he","se","ca","k","n","op","ol","os","vi","ia","ul","ve","il","pe","ph","hi","ci","sh","ac","id","nt","t","ot","po","ns","ce","um","nd","ck","om","ie","rs","z","ge","io","pi","ad","pa","ss","sa","ou","m","am","ea","l","rt","oc","od","ry","ba","ty","tion","qu","be","fi","hy","ga","da","u","x","ts","ec","va","bo","ow","tt","tu","bi","sm","do","ct","so","rd","em","pr","ki","ag","cr","ke","i","ap","sc","per","ee","lu","gi","er's","ab","ae","ant","ness","ut","cu","ical","mp","ir","su","o","im","bu","rr","fo","tra","ex","au","br","pl","ment","ru","ai","sp","able","wa","mb","og","rm","con","lle","tri","h","go","oo","ep","eo","dr","fe","wo","gr","alis","ig","on's","res","ob","non","wi","nn","chi","ff","nc","rg","rn","uc","over","ip","man","less","ib","ting","pro","pre","cl","bili","ei","pt","if","yl","ld","ator","ds","ay","tive","vo","we","ys","cy","olog","lt","oi","ud","hr","an's","ls","nder","idae","ka","ak","ster","ther","ps","bl","ms","gh","av","mu","rc","pp","nk","sta","dis","fa","gu","che","du","rk","rb","ey","fl","oa","ja","up","pu","gl","mm","my","aw","nu","ful","ling","hu","eg","ograph","ah","yn","ring","dd","cha","gra","eu","ks","sy","sk","rp","stic","ui","ub","ng's","gg","ings","car","ox","ev","ua","nesses","sub","ok","mis","com","iv","af","yi","ju","ence","eb","fr","ym","enti","teri","ia's","ya","logi","gn","zi","ance","ze","bb","mon","ew","tions","ny","qui","pla","par","cro","ness's","ight","iz","ated","za","yt","je","v","jo","yc","xi","ue","inter","of","yr","oe","und","out","us's","ship","ug","dy","rl","mar","ne's","ov","zo","anti","st's","yp","sl"];

var layersSize = 8;

var neuro;

function word2symseq(word, symseq, wordI, goodLength) {
    if (!wordI) {
        wordI = 0;
    }
    if (!goodLength) {
        goodLength = 0;
    }
    if (!symseq) {
        symseq = [];
    }

    // перебор
    if (wordI > word.length) {
        return [];
    }

    // найдено
    if (wordI == word.length) {
        return symseq;
    }

    // ветво границы
    if (goodLength != 0 && symseq.length >= goodLength) {
        return [];
    }

    // Слишком длинно, уходим
    if (symseq.length-1 >= layersSize) {
        return [];
    }

    var goodSymseq = [];
    for (var idxSym = 0; idxSym < symbols.length; idxSym++) {
        var sym = symbols[idxSym];

        // Проверяем слог
        if (word.indexOf(sym, wordI) == wordI) {

            // Слог совпал, нужно идти глубже
            var deeperSymseqCopy = JSON.parse(JSON.stringify(symseq));
            deeperSymseqCopy.push(idxSym);
            var deeperSymseq = word2symseq(word, deeperSymseqCopy, wordI+sym.length, goodLength);

            // Нашли что-то там в глубине?
            if (deeperSymseq.length != 0) {

                // Оно там в глубине лучше чем уже есть?
                if (goodSymseq.length == 0 ||
                    goodLength > deeperSymseq.length) {
                    goodSymseq = JSON.parse(JSON.stringify(deeperSymseq));
                    goodLength = goodSymseq.length;
                }
            }
        }
    }
    return goodSymseq;
}

function init(data) {
    neuro = new Array(layersSize);
    for (var layerNum = 0; layerNum < layersSize; layerNum++) {
        neuro[layerNum] = new Array(symbols.length);
        for (var i = 0; i < symbols.length; i++) {
            neuro[layerNum][i] = new Array(symbols.length);
            for (var j = 0; j < symbols.length; j++) {
                neuro[layerNum][i][j] = 0;
            }
        }
    }

    var offset = 0;
    var byteOffset = 0;
    for (var idxLay = 0; idxLay < layersSize; idxLay++) {
        for (var i = 0; i < symbols.length; i++) {
            for (var j = 0; j < symbols.length; j++) {
                var byteData = data.readUInt8(offset);
                byteData = (byteData >> byteOffset);
                byteData = (byteData & 0x01);

                neuro[idxLay][i][j] = byteData;
                byteOffset++;

                if (byteOffset == 8) {
                    byteOffset = 0;
                    offset++;
                }
            }
        }
    }
}
module.exports.init = init;

function test(word) {
    var symseq = word2symseq(word);
    console.log('------------------');
    console.log(word);

    if (symseq.length <= 0) {
        console.log('not');
        return false;
    }

    if (symseq.length == 1) {
        console.log('one');
        return true;
    }

    for (var idxLay = 0; idxLay < symseq.length-1; idxLay++) {
    	console.log(symbols[symseq[idxLay]]);
        if (neuro[idxLay][symseq[idxLay]][symseq[idxLay+1]] <= 0) {
        	console.log('false');
            return false;
        }
    }
    return true;
}
module.exports.test = test;