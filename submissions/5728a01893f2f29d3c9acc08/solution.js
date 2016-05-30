var maxHash = 0;
var hashSet = null;
var repls = null;
var badRe = null;

function hash(s)
{
    var v = 75797 * s.length;
    for (var i = 0; i < s.length; i++)
        v = (((v << 7) - v) + s.charCodeAt(i)) >>> 0;
    return v % maxHash;
}

exports.init = function(data)
{
    maxHash = 0x7CEFF;
    hashSet = new Set();
    for (var i = 0; i < maxHash / 8; i++)
        for (var j = 0; j < 8; j++)
            if ((data[i] & (1 << j)) != 0)
                hashSet.add(i * 8 + j);
    var temp = data.toString('utf8', (maxHash + 7) / 8).split('*');
    badRe = new RegExp(temp[0]);
    repls = temp[1].split('|').map(r => r.split('-'));
    repls = repls.map(r => [new RegExp(r[0] + '$'), r[1]]);
};

exports.test = function(word)
{
    var nword = word;
    for (var i = 0; i < repls.length; i++)
        nword = nword.replace(repls[i][0], repls[i][1]);
    if (nword.length > 14)
        return false;
    if (!hashSet.has(hash(nword)))
        return false;
    if (badRe.test(nword))
        return false;
    if (/'/.test(nword))
        return false;
    if (/[^aeiouy]{5}/.test(nword))
        return false;
    return true;
};