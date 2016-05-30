var two_freq, three_freq;

var MIN_SUM = 0.00301;
var MAX_LEN = 15;

function init(data)
{
    var dict = JSON.parse(data.toString());
    two_freq = {};
    three_freq = {};

    Object.keys(dict).forEach(function(key) {
        var val = dict[key];
        if (key.length == 2)
        {
            two_freq[key] = val;
        }

        if (key.length == 3)
        {
            three_freq[key] = val;
        }
    });
}

function test(_word)
{
    console.log("Testing " + _word);

    if (_word.length > MAX_LEN)
    {
        console.log("Too long");
        return false;
    }

    console.log("Ngraming");
    var word = "^" + _word + "$";
    var sum = 0.0;

    for (var i=0; i < word.length - 1; ++i)
    {
        tf = parseFloat(two_freq[word.slice(i, i+2)]);
        sum += tf;
    }
    console.log("Sum:" + sum);

    for (var i=0; i < word.length - 2; ++i)
    {
        tf = parseFloat(three_freq[word.slice(i, i+3)]);
        sum += tf;
    }

    return sum > MIN_SUM;
}


module.exports.init = init;
module.exports.test = test;