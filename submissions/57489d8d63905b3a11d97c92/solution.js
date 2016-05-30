const LENGTH = 4;
const digraphs =  [];//['TH', 'SH', 'CH', 'EA']
const COUNT = 'Z'.charCodeAt(0) - 'A'.charCodeAt(0) + 3 + digraphs.length;
const BIT_LENGTH = Math.ceil(COUNT/8);
var groups = {}, groups2 = {};
var prefix_suffix = {};
var exc;
function num2chr(num)
{
    num= Math.floor(num);
    if(num == 0)
    {
        return ' ';
    }
    if(num == 1)
    {
        return "'";
    }
    return String.fromCharCode('A'.charCodeAt(0) + num - 2);
}
function read_data(data, num)
{
    var groups = {};

    //cl.init(data);
    for(var i = 1; i< data.length && num < COUNT * COUNT; num++, i++)
    {
        var start = num2chr(num/COUNT) + num2chr(num%COUNT);
        for(; i< data.length && data[i] != 10; i+=5)
        {
            for(var j = 0; j<4; j++)
            {
                for(var k =0; k < 8; k++)
                {
                    if(data[i + j + 1]&(1<<k))
                    {
                        groups[start + String.fromCharCode(data[i]) + num2chr(j*8 + k)] = 1;
                    }
                }
            }
        }
    }
    return groups;
}
exports.init = function(data) 
{
    var size1 = data.readInt32LE();
    var data1 = data.slice(4, 4 + size1);
    var data2 = data.slice(size1+8);
    groups = read_data(data1, 2);
    groups2 = read_data(data2, 2);
    for(var key in exc)
    {
        exc[key] = new RegExp('^' + key.replace(' ', '(' + exc[key].replace(/ /g, '|') + ')') + '$');
    }
    //console.log(exc);
}
function _test(word, groups) {
    var tries = 0;
    for(var i = 0; i < word.length - 4; i++)
    {
         if(!groups[word.substr(i, 4)])// && tries++)
         {
             return false;
         }
    }
    return true;
}
exports.test = function(word)
{

    word1 = word.toUpperCase();
    for(var i in digraphs) {
        word1 = word1.replace(new RegExp(digraphs[i], 'g'), String.fromCharCode('Z'.charCodeAt(0) + 1 + parseInt(i)));
    }
    var word1 = ' ' + word1 + ' ' + word1.slice(0, LENGTH-2);
    if(word.match(/^un.*'s/))
        return false;
    if(!_test(word1, groups) && !_test(word1, groups2)) {
        return false;
    }
    if(word.length > 15)
    {
        return false;
    }
    if(word.match(/(oo|ea|ee|oa).*(ae|ph|ium$|ism$|x)|(ae|ph|ium$|ism$|x).*(oo|ee|oa)/)) {
        return false;
    }
    return 1;

}
exports.groups=function () { return groups; }
