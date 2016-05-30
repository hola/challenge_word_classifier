var WI = new Float64Array (6000);
var WL = new Float64Array (100);
var BL = new Float64Array (100);
var BO;
var N = 60;
var M = 100;

function init (buf) {
    var i, j;
	var buffer = new ArrayBuffer (49608);
	var data = new ArrayBuffer (49608);
	buffer = buf.buffer;
	data = new Float64Array (buffer);

	for (i = 0; i < M; i++) {
		for (j = 0; j < N; j++) {
			WI [i*N + j] = data [i*N + j];
		}
	}

	shift = M * N;

	for (i = 0; i < M; i++) {
		WL [i] = data [shift + i];
	}

	shift += M;

	for (i = 0; i < M; i++) {
		BL [i] = data [shift + i];
	}

	shift += M;

	BO = data [shift];
}

function test (word) {
    var i, j;
    var word_num = word.length;

    if ((word_num > N) || (word_num == 0)) {
        return false;
    }

    var code = new Float64Array (N);
    var alphabet_num = 27;
    var k;
    for (i = 0; i < N; i++) {
        if (i < word_num) {
            switch (word.charAt(i)) {
                case 'a':
                    k = 1;
                    break;
                case 'b':
                    k = 2;
                    break;
                case 'c':
                    k = 3;
                    break;
                case 'd':
                    k = 4;
                    break;
                case 'e':
                    k = 5;
                    break;
                case 'f':
                    k = 6;
                    break;
                case 'g':
                    k = 7;
                    break;
                case 'h':
                    k = 8;
                    break;
                case 'i':
                    k = 9;
                    break;
                case 'j':
                    k = 10;
                    break;
                case 'k':
                    k = 11;
                    break;
                case 'l':
                    k = 12;
                    break;
                case 'm':
                    k = 13;
                    break;
                case 'n':
                    k = 14;
                    break;
                case 'o':
                    k = 15;
                    break;
                case 'p':
                    k = 16;
                    break;
                case 'q':
                    k = 17;
                    break;
                case 'r':
                    k = 18;
                    break;
                case 's':
                    k = 19;
                    break;
                case 't':
                    k = 20;
                    break;
                case 'u':
                    k = 21;
                    break;
                case 'v':
                    k = 22;
                    break;
                case 'w':
                    k = 23;
                    break;
                case 'x':
                    k = 24;
                    break;
                case 'y':
                    k = 25;
                    break;
                case 'z':
                    k = 26;
                    break;
                case '\'':
                    k = 27;
                    break;
                default:
                    return false;
            }

            code [i] = (2.0 * k - alphabet_num - 1.0) / (alphabet_num - 1.0);
        } else {
            code [i] = 0;
        }
    }

    var x1, x2, y;
    var y1 = new Float64Array (M);

    for (i = 0; i < M; i++) {
        x1 = BL [i];
        for (j = 0; j < N; j++) {
            x1 += code [j] * WI [j + i*N];
        }
        y1 [i] = 2.0 / (1.0 + Math.exp(-2.0 * x1)) - 1.0;
    }

    x2 = BO;
    for (i = 0; i < M; i++) {
        x2 += y1 [i] * WL [i];
    }
    y = x2;

    if (y > 0) {
        return true;
    } else {
        return false;
    }
}

exports.init = init;
exports.test = test;