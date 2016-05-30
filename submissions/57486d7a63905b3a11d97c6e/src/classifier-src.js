var ns = [];
var r = [/[bcdfghjklmnpqrstvwxz]{8,}/, /[aeyiou]{7,}/, /.{25,}/];
function p(w) {
    for(var i = 0, len = w.length; i < len; i++) {
        l(w.charAt(i), w.substr(0, i), i);
    }
};
function l(l, p, i) {
    var c = ns;
    if(p.length > 0) {
        var ps = p.split('');
        for(var j = 0, len = ps.length; j < len; j++) {
            var pj = ps[j];
            for(var d = 0, dLen = c.length; d < dLen; d++) {
                if(c[d][0] == pj) {
                    c = c[d][1];
                    break;
                }
            }
        }
    }
    for(var d = 0, dLen = c.length; d < dLen; d++) {
        if(c[d][0] == l) return;
    }
    if(c[0] == l) return;
    c.push([l, [], i]);
};
module.exports = {
    init: function(d) { 
        d = d.toString();
        var w = '', ind = '';
        for(var i = 0, len = d.length; i < len; i++) {
            var char = d.charAt(i);
            if(char.match(/[0-9]+/)) {
                if(ind === '') p(w);
                ind += char;
            } else {
                if(ind.length) {
                    ind = parseInt(ind);
                    w = w.substr(0, ind);
                    ind = '';
                }
                w += char;
            }
        }
        p(w);
    },
    test: function(w) { 
        var w = w.toLocaleLowerCase().replace(/\'[\w]{0,2}$/, '').replace(/[^a-z]/, '');
        for(var i = 0, len = r.length; i < len; i++) {
            if(r[i].test(w)) return false;
        }
        var c = ns;
        var l = w.length;
        for(var i = 0, len = w.length; i < len; i++) {
            var char = w.charAt(i);
            for(var j = 0, jlen = c.length; j < jlen; j++) {
                var n = c[j];
                if(n[0] == char) {
                    if(n[2] == l - 1) return true;
                    c = n[1];
                    break;
                }
            }
        }
        return false; 
    }
};