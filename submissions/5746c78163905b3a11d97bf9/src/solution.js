"use strict";
const chars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
        'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z','\''];
const offset = Math.pow(chars.length, 2) + 1;
let substrings = {};

exports.init = function(data)
{
    function arrayGen(char_list, str_len)
    {
       let len = str_len - 1;
       let chars = char_list;
       let new_array =[];
       if (len == 0)
       {
           new_array = chars;
       }
       else
       {
           let i = 0;
           new_array = chars;
           while (i < len)
           {
               i += 1;
               let tmp = [];
               for (let s in new_array)
               {
                   for (let c in chars)
                   {
                       tmp.push(new_array[s]+char_list[c]);
                   };
               };
               new_array = tmp;
           };
       };
       return new_array;
    };

    let substr_array = arrayGen(chars, 2).concat(arrayGen(chars, 3));
    let substr_array_len = substr_array.length;
    let data_len = data.length;
    if (substr_array_len != data_len)
    {
        throw("Error: data is corrupted!");
    };
    for (let i = 0; i < data_len; i++)
    {
        let x = data[i];
        if (x != 0)
        {
            if (i < offset)
            {
                substrings[substr_array[i]] = (2.25 * x * x);
            }
            else
            {
                substrings[substr_array[i]] = (0.56 * x * x);
            }
        }
        else
        {
            substrings[substr_array[i]] = x
        };
    };
    return true;
};
exports.test = function(word){
    let ss = substrings, i = 0, ret = false;
    let i2 = 0, i3 = 0, c2 = 0, c3 = 0;
    let wl = word.length;
    for (let s in ss)
    {
        i += 1;
        let q = (word.match(new RegExp(s, "g"))||[]).length;
        if (q!=0)
        {
            if (ss[s] == 0)
            {
                return false
            }
            else
            {
                if (i < offset)
                {
                    i2 += 1; c2 += ss[s]*q;
                }
                else
                {
                    i3 += 1; c3 += ss[s]*q;
                };
            };


        };
    };
if(i2==0 || i3==0){ret = true}
if(wl==3 && c2/i2>2 && c2/i2<=146307){ret = true;}; // avg2 11059
if(wl==4 && c2/i2>8000 && c2/i2<=146307 && c3/i3>0 && c3/i3<36415){ret = true;}; // avg2 18121 avg 980
if(wl==5 && c2/i2>20 && c2/i2<=146307 && c3/i3>0 && c3/i3<24732){ret = true;}; // avg2 25902 avg 1928
if(wl==6 && c2/i2>492 && c2/i2<=146307 && c3/i3>0 && c3/i3<23339){ret = true;}; // avg2 29977 avg 2384
if(wl==7 && c2/i2>811 && c2/i2<87275 && c3/i3>1 && c3/i3<19622){ret = true;}; // avg2 33493 avg 2938
if(wl==8 && c2/i2>1770 && c2/i2<86747 && c3/i3>12 && c3/i3<17630){ret = true;}; // avg2 35260 avg 3491
if(wl>8 && c2/i2>480 && c2/i2<80099 && c3/i3>8 && c3/i3<17542){ret = true;}; // avg2 37925 avg 4578
    return ret;
};
