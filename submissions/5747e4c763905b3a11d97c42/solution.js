function Classifier()
{
    function startsWith(str, pref)
    {
        return str.lastIndexOf(pref, 0) == 0;
    }

    function endsWith(str, suf)
    {
        return str.indexOf(suf, str.length - suf.length) !== -1;
    }

    function cmp(a, b)
    {
        return b.length - a.length;
    }

    var prefix;
    var root;
    var suffix;

    var morpheme;

    this.init = function(data) {
        data = JSON.parse(data.toString());

        prefix = data.prefix.sort(cmp);
        root = data.prefixOrRoot.sort(cmp);
        suffix = data.suffix.sort(cmp);

        morpheme = [ prefix, root, suffix ];
    };

    function test1(res)
    {
        console.log(res);
        var n = [ 0, 0, 0 ];
        var used = [ {}, {}, {} ];
        for(var i = 0; i < res.length; ++i)
        {
            ++n[res[i][0]];
            if(used[res[i][1]])
            {
                return false;
            }
            used[res[i][1]] = true;
        }
        console.log(n);
        if(n[0] > 3)
        {
            return false;
        }
        if(n[1] == 0 || n[1] > 4)
        {
            return false;
        }
        if(n[2] > 3)
        {
            return false;
        }
        return true;
    }

    function parse(word, st, res)
    {
        var pref;
        while(st < morpheme.length)
        {
            for(var i = 0; i < morpheme[st].length; ++i)
            {
                pref = morpheme[st][i];
                if(startsWith(word, pref))
                {
                    res.push([st, pref]);
                    if(word.length == pref.length)
                    {
                        var ret = test1(res);
                        res.pop();
                        return ret;
                    }
                    else
                    {
                        if(parse(word.substr(pref.length), st, res))
                        {
                            res.pop();
                            return true;
                        }
                    }
                    res.pop();
                }
            }
            ++st;
        }
        return false;
    }

    this.test = function(word) {
        word = word.toLowerCase();
        if(word.length == 1)
        {
            return true;
        }
        if(word.length > 2)
        {
            if(endsWith(word, "'s"))
            {
                word = word.substr(0, word.length - 2);
            }
        }
        return parse(word, 0, []);
    }

    /*this.tryParse = function(word) {
        var st = 0;
        var str;
        word = word.toLowerCase();
        if(word.length > 2)
        {
            if(endsWith(word, "'s"))
            {
                word = word.substr(0, word.length - 2);
            }
        }
        if(this.test(word))
        {
            return null;
        }
        while(st < morpheme.length)
        {
            for(var i = 0; i < morpheme[st].length; ++i)
            {
                str = morpheme[st][i];
                if((str.length > 1 || st == 1) &&
                   word.length - str.length > 2 &&
                   startsWith(word, str))
                {
                    if(word.length == str.length)
                    {
                        return null;
                    }
                    word = word.substr(str.length);
                    break;
                }
            }
            if(i == morpheme[st].length)
            {
                ++st;
            }
        }
        st = morpheme.length - 1;
        while(st > 0)
        {
            for(var i = 0; i < morpheme[st].length; ++i)
            {
                str = morpheme[st][i];
                if((str.length > 1 || st == 1) &&
                   word.length - str.length > 2 &&
                   endsWith(word, str))
                {
                    if(word.length == str.length)
                    {
                        return null;
                    }
                    word = word.substr(0, word.length - str.length);
                    break;
                }
            }
            if(i == morpheme[st].length)
            {
                --st;
            }
        }
        return word;
    }*/

    return this;
};

module.exports = new Classifier();
