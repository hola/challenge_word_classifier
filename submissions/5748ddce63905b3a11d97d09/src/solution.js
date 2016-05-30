let chars=".abcdefghijklmnopqrstuvwxyz'",
	dictLen = chars.length,
	dict = {},
	nn,
	noChar = zeros(dictLen)

chars.split("").map((ch,i) => {
	let onehot = zeros(dictLen);
	onehot[i] = 1;
	dict[ch] = onehot;
})

function w2vec(w) {
	return (w+'.').split("").map(x => dict[x]);
}

let model;

module.exports = {
	init: function(buf) {
		// Load model
		let gruDim = 62
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
		
		model = {
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
		// if (idx !== buf.length) {
		// 	throw new Error("Invalid data");
		// }
	},

	test: function(w) {
		let wLen = w.length,
			maxWlen = 16;

		if (wLen > 30) {
			return false;
		}

		if (wLen > maxWlen) {
			w = w.substr(0, maxWlen);
			wlen = maxWlen
		}

		let seq = w2vec(w),
			seqLen = w.length; // [wlen, 28]
		let gruOut;

		let state = {};
		for (let i = 0; i < maxWlen; i++) {
			gruOut = gru(i < seqLen ? [seq[i]] : [noChar], state)
			// console.log(w, i, gruOut[0].join(','));
		}

		// dense x=[1,256] W=[256,2] -> 1x2, b=[1,2]
		// let out = softmax(sum(dot(gruOut, model.dense.W), model.dense.b))
		let out = sigmoid(sum(dot(gruOut, model.dense.W), model.dense.b))
		// result in the last iteration
		// return out[0][1] > out[0][0];
		// console.log(out);
		return out > 0.5;
	}
}

function gru(x, state) {
	// x is a 1hot array [28]
	// prev hidden state
	if (!state.h_tm1) {
		state.h_tm1 = [zeros(model.gru.h.U.length)];
	}
	let h_tm1 = state.h_tm1; // [256]

	let x_z = sum(dot(x, model.gru.z.W), model.gru.z.b); // x=[28] * z.W[28x256] = [1x256] z.b=[1,256]
	let x_r = sum(dot(x, model.gru.r.W), model.gru.r.b);
	let x_h = sum(dot(x, model.gru.h.W), model.gru.h.b);

	// z, r - scalars?
	let z = hardSigmoid(sum(x_z, dot(h_tm1, model.gru.z.U))) // h_tm1[1x256] z.U[256x256] = [1x256]
	let r = hardSigmoid(sum(x_r, dot(h_tm1, model.gru.r.U)))

	let hh = tanh(sum(x_h, dot(mul1d(r, h_tm1), model.gru.h.U))) // [256]*[256x256] = [256] * [256,256] = [256]
	// update internal state
	// console.log('hh', hh)
	//console.log('-z', sub(1,z))
	//console.log(h_tm1);
	h = sum(mul1d(z, h_tm1), mul1d(sub(1, z), hh)) // [256] * [256] + 
	state.h_tm1 = h
	return h;
}

function mul1d(a, b) {
	return a.map((row, i) => row.map((x, j) => x * b[i][j]))
	/*if (a.length && a[0].length) {
		return a.map((x, i) => mul1d(x, b[i]))
	}
	return a.map((x, i) => x * b[i])*/
}

function sum(a, b) {
	// if (a.length !== b.length) {
	// 	throw new Error("Not equal length: " + a.length + '!=' + b.length);
	// }

	if (a[0].length) {
		return a.map((row, i) => sum(row, b[i]));
	}
	return a.map((x, i) => x + b[i] );
}

function sub(a, b) {
	if (!a.length) {
		if (b[0].length) {
			return b.map((row) => sub(a, row));
		}
		return b.map((x) => a - x);
	}

	// if (a.length !== b.length) {
	// 	throw new Error("Not equal length: " + a.length + '!=' + b.length);
	// }

	if (a[0].length) {
		return a.map((row, i) => sub(row, b[i]));
	}
	return a.map((x, i) => x - b[i]);
}


/*console.log(sum2d(
[[ 1,2 ],
[3,4]
],
[[ 11,12 ],
[13,14]
]
	));*/

function dot(a, b) {
	let rows = a.length,
		cols = b[0].length,
		aCols = a[0].length;
	// if (aCols !== b.length) {
	// 	throw new Error('Number of A cols <> B rows' + aCols + '<>' + b.length);
	// }
	let res = new Array(rows)
	for (let i = 0; i < rows; i++) {
		res[i] = zeros(cols);
		for (let j = 0; j < cols; j++) {
			for (let k = 0; k < aCols; k++) {
				res[i][j] += a[i][k] * b[k][j];
			}
		}
	}
	return res;
}
/*
console.log('mul2d', mul2d(
[[1,2],
 [3,4]],

[[5,6],
 [7,8]]

	));*/

function hardSigmoid(x) {
	if (x.map) {
		return x.map(hardSigmoid);
	}
	return Math.max(0, Math.min(1, x*0.2 + 0.5))
}

function sigmoid(x) {
	return 1.0 / (1.0 + Math.exp(-x));
}

function tanh(x) {
	if (x.map) {
		return x.map(tanh);
	}
	let ex = Math.exp(x),
		ey = 1/ex;

	return (ex - ey)/(ex + ey);
}

//console.log(softmax([1,2,3,4]));

/*console.log(hardSigmoid([
	[12, 0.1],
	[-12, -0.1]
	]));*/

function zeros(len) {
	let res = new Array(len+1);
	return res.join('0').split('').map(parseFloat);
}

