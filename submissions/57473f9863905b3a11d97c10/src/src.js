
var S={}, F={}, N=5;

function i (b) {
    var m=[],i=0, l,p=0, M, g=[],k, o=0,z=[""];
    
    // i is continuous here

    // unpack vowels/consonants filter
    l = (b[i] * 256 + b[i+1]) * 2 + 2;
    for (i = 2; i < l; i += 2) {
        p += b[i] * 256 + b[i+1];
        F [p] = 1;
    }
    
    /* 
    // sanity check
    if (b[i] != 42) {
        console.log (i);
        console.log (b[i-4], b[i-3], b[i-2], b[i-1], b[i]);
        console.log (b[i+1], b[i+2], b[i+3], b[i+4], b[i+5]);
        throw 42;
    }
    */
    i++; // skip sanity check mark

    // character map
    m[26] = "'";
    for (k = 0; k < 26; k++) { 
        m[k] = String.fromCharCode (97 + k); 
    }
 
    // unpack number of zeroes before ones
    g=[];
    for (; i < b.length; i++) {
        for (k = 0; k < b[i]; k++) {
            g.push (0);
        }
        g.push (1);
    }

    // unpack prefix tree
    o=0;
    for (i = 0; i < z.length; i++) {
        for (k = 0; k < 27; k++) {
            if (g[o++] == 1) {
                z.push (z[i] + m[k]);
            }
        }
        if (z[i].length == N) {
            S[z[i]] = 1;
        }
    }
}


function f1 (w, F) {
    var i,s,v=0,c=0,l=w.length,mc=0,mv=0,f=0;
    for (i = 0; i < l; i++) {
        s = w.substr (i, 1);
        if (/[aeiouy]/.test(s)) { 
            v++;
            mv += s.charCodeAt (0) - 97;
        } else if (/[bcdfghjklmnpqrstvwxyz]/.test (s)) {
            c++;
            //mc += s.charCodeAt (0) - 97;
        }
    }
    //mc = ((mc / c) * 5) | 0; 
    mv = ((mv / v) * 5) | 0; 
    //mc = ((mc / c) * 1) | 0; 
    //mv = ((mv / v) * 4) | 0; 
    i = 25;
    f = f * i + v;
    f = f * i + c;
    //f = f * i + mc;
    f = f * i + mv;
    //f = f * i + mv + mc;
    if (F[f]) {
        return true;
    }
    return false;
}

function t (w) {
    if (!f1 (w, F)) { return false; }
    if (S [w.substr (0, N)]) { return true; }
    return false;
}

exports.init = i;
exports.test = t;


