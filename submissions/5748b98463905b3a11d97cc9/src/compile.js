var fs = require('fs');
var zlib = require('zlib');

var words = JSON.parse(fs.readFileSync('./data/words.json'));
var unrecWords = JSON.parse(fs.readFileSync('./data/unrecWords.json'));
var psb = 'g\'hpmducltroniase';
var vowels = 'qjxzwkvfyb';
var tangleWordLength = 0;

var blockLen = 4;
var maxWordLength = 14;

function makeThrees() {
    var list = [];
    var thm = {};
    var l = psb.length;
    var a = l;
    while (a--) {
        var b = l;
        while (b--) {
            var c = l;
            while (c--) {
                var d = l;
                while (d--) {
                    var three = psb[a] + psb[b] + psb[c] + psb[d];
                    list.push(three);
                    thm[three] = list.length;
                }
            }
        }
    }
    return {
        list: list,
        thm: thm
    };
}

function makeTransitions(words, blockLen, maxWordLength, threes) {
    var explicitWords = [];
    var cube = new Array(maxWordLength);
    for (var i = 0; i < cube.length; i++) {
        var transitions = new Uint32Array(threes.list.length);
        transitions.fill(0);
        cube[i] = transitions;
    }
    var usedTi = {};
    for (var i = 0; i < words.length; i++) {
        if (words[i].length > maxWordLength) {
            explicitWords.push(words[i]);
            continue;
        }
        var word = devowelWord(words[i]);
        for (var j = 0; j < word.length; j++) {
            var wordThree = padWord(word.substring(j, j + blockLen), blockLen);
            var ti = threes.thm[wordThree];
            if (ti === undefined) {
                throw new Error('Cant find wordThree ' + wordThree);
            }
            cube[j][ti] = 1;
            usedTi[ti] = true;
        }
    }
    console.log('Used', Object.keys(usedTi).length, 'of', threes.list.length);
    var usedColumns = Object.keys(usedTi).map((k) => parseInt(k) || k).sort((a, b) => a - b);
    return {
        explicitWords,
        cube,
        usedColumns: usedColumns,
        blockLen,
        maxWordLength,
        threesLength: threes.list.length
    };
}

function setBit(src, index) {
    return src | 1 << index;
}

function getBit(src, index) {
    return ((src >>> index) % 2 != 0)
}

function getBitsString(num) {
    var str = '';
    for (var i = 0; i < 32; i++) {
        str += getBit(num, i) ? '1' : '0';
    }
    return str;
}

function packData(cube, explicitWords, colCount, rowCount, usedColumns, threesLength) {
    var usedColumnsLength = Math.ceil(threesLength / 8);
    if (usedColumnsLength % 4 > 0)
        usedColumnsLength = usedColumnsLength + (4 - usedColumnsLength % 4);
    var rowLength = Math.ceil(colCount / 8);
    if (rowLength % 4 > 0)
        rowLength = rowLength + (4 - rowLength % 4);
    console.log('rowLength', rowLength);
    var transitionsSize = rowLength * rowCount;
    var explicitWordsStr = explicitWords.join('\0');
    var explicitWordsSize = explicitWordsStr.length;
    var unrecWordsStr = unrecWords.join('#');
    var size = transitionsSize + usedColumnsLength + unrecWordsStr.length;
    console.log('Transitions size', transitionsSize);
    console.log('Used columns size', usedColumnsLength);
    console.log('unrecWordsStr size', unrecWordsStr.length);
    //console.log('Total data size:', size, 'threesLength', threesLength, 'usedColumns', usedColumns.length, usedColumnsLength, 'explicit words', explicitWords.length, explicitWordsStr.length);
    var buffer = new Buffer(size);
    var umap = {};
    usedColumns = usedColumns.sort((a, b) => a - b);
    for (var i = 0; i < usedColumns.length; i++) {
        umap[usedColumns[i]] = true;
    }
    for (var i = 0; i < usedColumnsLength / 4; i++) {
        var int = 0;
        for (var k = 0; k < 32; k++) {
            var column = i * 32 + k;
            if (umap[column]) {
                int = setBit(int, k);
            }
        }
        buffer.writeInt32LE(int, i * 4);
    }
    // Reduce cube
    var newCube = new Array(cube.length);
    for (var i = 0; i < newCube.length; i++) {
        var newTransitions = new Uint32Array(usedColumns.length);
        newTransitions.fill(0);
        for (var j = 0; j < usedColumns.length; j++) {
            newTransitions[j] = cube[i][usedColumns[j]];
        }
        newCube[i] = newTransitions;
    }

    for (var i = 0; i < rowCount; i++) {
        var transitions = newCube[i];
        for (var j = 0; j < rowLength / 4; j++) {
            var int = 0;
            for (var k = 0; k < 32; k++) {
                var t = transitions[j * 32 + k];
                if (t !== undefined && t === 1)
                    int = setBit(int, k);
            }
            buffer.writeInt32BE(int, usedColumnsLength + i * rowLength + j * 4);
        }
    }
    buffer.write(unrecWordsStr, usedColumnsLength + transitionsSize);
    return buffer;
}

function unpackData(buffer, rowCount, threesLength) {
    var usedColumnsLength = Math.ceil(threesLength / 8);
    if (usedColumnsLength % 4 > 0)
        usedColumnsLength = usedColumnsLength + (4 - usedColumnsLength % 4);
    var usedColumns = [];
    for (var i = 0; i < usedColumnsLength / 4; i++) {
        var int = buffer.readInt32LE(i * 4);
        for (var k = 0; k < 32; k++) {
            var column = i * 32 + k;
            if (getBit(int, k)) {
                usedColumns.push(column);
            }
        }
    }
    var colCount = usedColumns.length;
    var rowLength = Math.ceil(colCount / 8);
    if (rowLength % 4 > 0)
        rowLength = rowLength + (4 - rowLength % 4);
    var cube = new Array(rowCount);
    var transitionsSize = rowLength * rowCount;
    for (var i = 0; i < rowCount; i++) {
        var transitions = new Uint32Array(colCount);
        transitions.fill(0);
        var int = 0;
        for (var j = 0; j < rowLength / 4; j++) {
            var int = buffer.readInt32BE(usedColumnsLength + i * rowLength + j * 4);
            for (var k = 0; k < 32; k++) {
                var index = j * 32 + k;
                //console.log(getBit(int, k));
                if (index < transitions.length && getBit(int, k))
                    transitions[index] = 1;
            }
        }
        cube[i] = transitions;
    }
    var newCube = new Array(cube.length);
    for (var i = 0; i < newCube.length; i++) {
        var newTransitions = new Uint32Array(threesLength);
        newTransitions.fill(0);
        for (var j = 0; j < usedColumns.length; j++) {
            newTransitions[usedColumns[j]] = cube[i][j];
        }
        newCube[i] = newTransitions;
    }
    var unrecWords = buffer.toString('ascii', transitionsSize + usedColumnsLength).split('#');
    //var explicitWordsStr = buffer.toString('ascii', transitionsSize);
    //var explicitWords = explicitWordsStr.split('\0');
    return {
        cube: newCube,
        unrecWords,
        usedColumns: usedColumns.sort()
    };
}

function checkData(data1, data2) {
    var uw1 = unrecWords;
    var uw2 = data2.unrecWords;
    if (uw1.length != uw2.length)
        throw new Error('uw1.length != uw2.length ' + uw1.length + ' != ' + uw2.length);
    for (var i = 0; i < uw1.length; i++) {
        if (uw1[i] != uw2[i])
            throw new Error('uw1[i] != uw2[i]');
    }
    var uc1 = data1.usedColumns;
    var uc2 = data2.usedColumns;
    if (uc1.length != uc2.length)
        throw new Error(`uc1.length (${uc1.length}) != uc2.length (${uc2.length})`);
    for (var i = 0; i < uc1.length; i++) {
        if (uc1[i] !== uc1[i])
            throw new Error(`uc1[i] (${uc1map[uc1[i]]}) != uc2[i] (${uc2map[uc1[i]]})`);
    }
    var cube1 = data1.cube;
    var cube2 = data2.cube;
    if (cube1.length != cube2.length)
        throw new Error(`сube1.length (${cube1.length}) != cube2.length (${cube2.length})`);
    for (var i = 0; i < cube1.length; i++) {
        var t1 = cube1[i];
        var t2 = cube2[i];
        if (t1.length != t2.length)
            throw new Error(`t1.length (${i}:${t1.length}) != t2.length (${i}:${t2.length})`);
        for (var j = 0; j < t1.length; j++) {
            if (t1[j] !== t2[j])
                throw new Error(`t1[j] (${i}:${j}:${t1[j]}) !== t2[j] (${i}:${j}:${t2[j]})`);
        }
    }
}

function padWord(word, blockLen) {
    if (word.length < blockLen) {
        var diff = blockLen - word.length;
        for (var i = 0; i < diff; i++) {
            word = word + '\'';
        }
    }
    return word;
}

function devowelWord(word) {
    return word.replace(RegExp('[' + vowels + ']', 'g'), '\'');
}

var threes = makeThrees();
var cube = makeTransitions(words, blockLen, maxWordLength, threes);

var packedBuffer = packData(cube.cube, cube.explicitWords, cube.usedColumns.length, maxWordLength, cube.usedColumns, threes.list.length);
var unpackedCube = unpackData(packedBuffer, maxWordLength, threes.list.length);
checkData(cube, unpackedCube);

var zippedBuffer = zlib.gzipSync(packedBuffer);
fs.writeFileSync('./data.gz', zippedBuffer);
console.log('Zipped size', zippedBuffer.length);