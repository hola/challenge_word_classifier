var data;

module.exports.init = function (buffer) {
    data = JSON.parse(buffer.toString('utf-8'));
    data.c3 = unpack_c3(data.c3);
    data.c5 = unpack_c5(data.c5);
};

module.exports.test = function (w) {
    var hash = getHash(w);
    return w.length === 1 ||
        data.hashes.indexOf(hash) !== -1 && !data.c2.some(c2=>w.includes(c2)) && !data.c3.some(c3=>w.includes(c3)) &&
        (w.length < 5 || data.c5.indexOf(w.substr(0, 5)) !== -1);
};

function getHash(str) {
    let sum = 0;
    for (let i = 0, len = str.length; i < len; i++) {
        let code = str.charCodeAt(i) - 95;
        code = code < 1 ? 1 : code;
        sum += (i <= 12 ? code * (10000 - i * 800) : code);
    }
    return sum;
}

function unpack_c3(c3) {
    let res = [];
    for (let k0 in c3) {
        let o = c3[k0];
        for (let k1 in o) {
            let str = o[k1];
            for (let c of str) {
                res.push(k0 + k1 + c);
            }
        }
    }
    return res;
}

function unpack_c5(c3) {
    let res = [];
    for (let k0 in c3) {
        for (let k1 in c3[k0]) {
            for (let k2 in c3[k0][k1]) {
                for (let k3 in c3[k0][k1][k2]) {
                    let str = c3[k0][k1][k2][k3];
                    for (let c of str) {
                        res.push(k0 + k1 + k2 + k3 + c);
                    }
                }
            }

        }
    }
    return res;
}