let fs = require('fs')
let data = require('./data/keras.json')

let chunks = [
    // gruData 
    data[0].parameters[0].W_z,
    data[0].parameters[0].U_z,
    [data[0].parameters[0].b_z],
    data[0].parameters[0].W_r,
    data[0].parameters[0].U_r,
    [data[0].parameters[0].b_r],
    data[0].parameters[0].W_h,
    data[0].parameters[0].U_h,
    [data[0].parameters[0].b_h],
    // dense
    data[1].parameters[0].W,
    [data[1].parameters[0].b]
];

let totalCount = chunks.reduce((v, item) => {
    return v + item.length * item[0].length;
}, 0);

console.log('cnt', totalCount);

let arr = new Float32Array(totalCount);
let i = 0;
chunks.forEach((rows) => {
    rows.forEach((items) => {
        items.forEach((item) => {
            arr[i++] = item;
        })
    })
});

let buf = new Buffer(arr.buffer);
fs.writeFileSync('./data.bin', buf);

let model = load(buf);
i = 0;

function floatCmp(a, b) {
    return Math.abs(a - b) < 0.0000001;
}

console.log([
//model.gru.z.W[0][0], chunks[0][0][0],
    floatCmp(model.gru.z.W[0][0], chunks[i++][0][0]),
    floatCmp(model.gru.z.U[0][0], chunks[i++][0][0]),
    floatCmp(model.gru.z.b[0][0], chunks[i++][0][0]),

    floatCmp(model.gru.r.W[0][0], chunks[i++][0][0]),
    floatCmp(model.gru.r.U[0][0], chunks[i++][0][0]),
    floatCmp(model.gru.r.b[0][0], chunks[i++][0][0]),

    floatCmp(model.gru.h.W[0][0], chunks[i++][0][0]),
    floatCmp(model.gru.h.U[0][0], chunks[i++][0][0]),
    floatCmp(model.gru.h.b[0][0], chunks[i++][0][0]),

    floatCmp(model.dense.W[0][0], chunks[i++][0][0]),
    floatCmp(model.dense.b[0][0], chunks[i++][0][0])
]);
i = 0
console.log([
//model.gru.z.W[0][0], chunks[0][0][0],
    floatCmp(model.gru.z.W[0].length, chunks[i++][0].length),
    floatCmp(model.gru.z.U[0].length, chunks[i++][0].length),
    floatCmp(model.gru.z.b[0].length, chunks[i++][0].length),

    floatCmp(model.gru.r.W[0].length, chunks[i++][0].length),
    floatCmp(model.gru.r.U[0].length, chunks[i++][0].length),
    floatCmp(model.gru.r.b[0].length, chunks[i++][0].length),

    floatCmp(model.gru.h.W[0].length, chunks[i++][0].length),
    floatCmp(model.gru.h.U[0].length, chunks[i++][0].length),
    floatCmp(model.gru.h.b[0].length, chunks[i++][0].length),

    model.dense.W[0].length, chunks[i++][0].length, // bad!
    floatCmp(model.dense.b[0].length, chunks[i++][0].length)
]);


function load(buf) {
    let gruDim = 62,
        dictLen = 28;
    let idx = 0;
    function readFloat2d(rows, cols) {
        let r = new Array(rows);
        for (let i = 0; i < rows; i++) {
            let row = new Array(cols);
            for (let j = 0; j < cols; j++) {
                row[j] = buf.readFloatLE(idx);
                idx += 4;
            }
            r[i] = row;
        }
        return r;
    }

    function readWUb() {
        return {
            W: readFloat2d(dictLen, gruDim),
            U: readFloat2d(gruDim, gruDim),
            b: readFloat2d(1, gruDim)
        }
    }

    let model = {
        gru: {
            z: readWUb(),
            r: readWUb(),
            h: readWUb()
        },
        dense: {
            W: readFloat2d(gruDim, 1),
            b: readFloat2d(1, 1)
        }
    }
    return model;
}