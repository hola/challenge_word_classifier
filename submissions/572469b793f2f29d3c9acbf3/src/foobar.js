slider = [{}]

function init(data)
{
    var file_content = data.toString('ascii');
    var trigram_counter = 0;
    var word_length_counter = 0;
    var buffer = "";
    for (var symb of file_content)
    {
        if (symb == "\n")
        {
            slider.push({});
            word_length_counter += 1;
            buffer = "";
            trigram_counter = 0;
        }
        else
        {
            buffer += symb;
            if (trigram_counter == 2)
            {
                slider[word_length_counter][buffer] = null;
                buffer = "";
                trigram_counter = 0;
            }
        }
    }
}

function test(word)
{
    if (word.length <= 2)
        return true;
    else
    {
        min_length = 3;
        while true
        {
            if word.length >= min_length
            {
                if (word.substring(min_length - 3, min_length) in slider[min_length - 3])
                    min_length += 1
                else
                    return false;
            }
            else:
                return true;
        }
    }
}

function testing_test(word)
{
    return true;
}

module.exports
{
    init:function(data){},
    test:testing_test
}