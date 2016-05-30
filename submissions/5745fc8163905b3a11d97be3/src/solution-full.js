//Alexey Borisov 2016, License: CC

//var D; // data

module.exports =
{
  init: function(data)
  {
    D = data;
  },

  test: function(word)
  {
    word = word.replace(/^un/,"").replace(/'s$/,"").replace(/s$/,"").replace(/ing$/,"");
    var len = word.length;

    //////////////// inlined precheck function
    var score = 0;
    for (var i = 0; i < 8; i++)
      if (word.search("'wvqxjzy"[i]) >= 0)
      {
        score++;
        if (!i)
          score = 9;
      }

    var inraw = 1;
    for (var i = 0; i < len; i++)
    {
      if ("aeouiy".search(word[i]) < 0)
      {
        inraw++;
        if (inraw > 3)
          score++;
      }
      else
        inraw = 0;
    }

    if (len > 13)
      score++;

    if (len > 15)
      score++;

    if (len > 16)
      score++;

    if (!len || score >= 3 || (len > 2 && word[0] == word[1]))
      return false; 

    ////////////////


      
    var HASH_CHUNK_SIZE = 44101;
    var seed = 998;
    var idx = 0;
    var val = HASH_CHUNK_SIZE;
    var half = 75750 / 2;           // half size of data
    for (var i = 0; i < half; i++)
    {
      var delta = (D[i] << 8) + D[i + half];
      val += delta;
      if (delta == HASH_CHUNK_SIZE)
        continue;

      if (val >= HASH_CHUNK_SIZE)
      {
        val -= HASH_CHUNK_SIZE;
        seed++;
        
        /////////// inlined hash function
        var res = seed;
        for (var x = 0; x < len; x++)
          res = (res * 101 + (word.charCodeAt(x)) * (x + ((seed % 256) | 1))) & 0xFFFFF; // 5 x F
        ///////////

        idx = res % HASH_CHUNK_SIZE;
      }

      if (val == idx)
        return false;
    }

    return true;  
  }
}
