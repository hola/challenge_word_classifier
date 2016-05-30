// Just a pure Javascript, not only Node.js

var dict={};

module.exports.init = function(data) {
    // Incoming dictionary was prepared by such steps:
    // All words with "'s" are converted  to form without "'s"
    // Each other words are splitted by 3 parts - prefix, body, suffix
    // Each prefix and suffix made as substring from original word, with up to 3 length  begin and from end of the word
    // Rest of word (named body) are cutted to length 3 from the begin and end (so it will like a wildcards
    // Example
    // "body" => ["bod","y",""]
    // "suffixes" => ["suf","fi","xes"]
    // "combinations" => ["com","binati","ons"] => ["com","ina","ons"] (like a wildcards we allow "com*ina*ons")
    //
    // 3 as length for all three parts are calculated after some iteration as optimal for combination of string length and 
    //   result dictionary file size
    //
    //
    // We made 3 dictionaries after steps above
    // We move parts from them into 4 additional dictionaries if parts exists in more than one dictionary
    // So 7 results dictionaries contains unique word parts
    //
    // 2 additional dictionary contains nonexists in source file 2 and 3-chars combinations

    var dicts = JSON.parse(data);  		// We convert dictionaries from JSON and single string format into real array dictionaries
    dict.pref = get_dict(dicts.pref);;  	// Prefixes
    dict.body = get_dict(dicts.body);  		// Body
    dict.suf = get_dict(dicts.suf);		// Suffixes
    dict.pref_body = get_dict(dicts["12"]);	// Parts exists in prefix and body dictionary same time
    dict.pref_suf = get_dict(dicts["13"]);	// .... prefix and suffix
    dict.body_suf = get_dict(dicts["23"]);	// .... body and suffix
    dict.full = get_dict(dicts["123"]);		// .... in all dictionaries
    dict.full.push("");
    dict.ch2 = break_line(dicts.ch2,2);	// Nonexists 2-chars combination
    dict.ch3 = break_line(dicts.ch3,3);	// Nonexists 3-chars combination
}

module.exports.test = function(word) {
    var res = false,r;
    var pref,body,suf;

    if (word.includes("'")&&((!word.endsWith("'s"))||(word.split("'").length>2)))  
					// Word can contains "'" only when ends with "'s"
	return false;

    if (word.endsWith("'s"))  			// Skip "'s". It's increase mistakes, but convert to existing (may be) word
	word = word.substr(0,word.length-2);



    for(i=0;i<word.length-1;i++)   // Word can't contains 2 or 3-chars combination from depricated dictionaries
    {
        ch2 = word.substr(i,2);
        if (dict.ch2.indexOf(ch2)!=-1)
		return false;
	if (i!=(word.length-2))
	{
	    ch3 = word.substr(i,3);
	    if (dict.ch3.indexOf(ch3)!=-1)
		return false;
	}
    }


    if (word.length<=9) // When word can be combined from parts from dictionary
    {
	    pref = word.substr(0,3);
	    body = word.substr(3,word.length-3);
	    if (body.length<=3)
	    {
		suf="";
	    }
	    else
	    {
		suf = body.substr(-3,3);
		body = body.substr(0,body.length-3);
	    }
    }
    else
    {
	    pref = word.substr(0,3);
	    suf = word.substr(-3,3);
	    body = word.substr(3,word.length-6);
	    while (body.length>3) // Cut body to length 3 step by step from both sides
		    body = (body.length%2==1)?body.substr(1,body.length-1):body.substr(0,body.length-1);
    }
    res =  ((dict.pref.indexOf(pref)!=-1)||(dict.pref_body.indexOf(pref)!=-1)||(dict.pref_suf.indexOf(pref)!=-1)||(dict.full.indexOf(pref)!=-1))&&
		    ((dict.body.indexOf(body)!=-1)||(dict.pref_body.indexOf(body)!=-1)||(dict.body_suf.indexOf(body)!=-1)||(dict.full.indexOf(body)!=-1))&&
		    ((dict.suf.indexOf(suf)!=-1)||(dict.pref_suf.indexOf(suf)!=-1)||(dict.body_suf.indexOf(suf)!=-1)||(dict.full.indexOf(suf)!=-1))&&
		    ((word.length>9)|| ((pref+body+suf)==word));
		// Each part must be exists in appropriate dictionary
		// In additional, if source word length <=9 so such word MUST be equal to the its parts concatenation

    return res;
}


function break_line(line,part_len)
{
    return line.match(new RegExp('.{1,' + part_len + '}', 'g'));
}

function get_dict(dicts)
{
    var i;
    var res = [];
    for(i=1;i<=3;i++)
	res = res.concat(break_line(dicts["l"+i],i));

    while ((i=res.indexOf(null))!=-1)
	res.splice(i,1);
    return res;
}