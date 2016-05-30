a = (function() {
  var step2list = {
      "ational" : "ate",
      "tional" : "tion",
      "enci" : "ence",
      "anci" : "ance",
      "izer" : "ize",
      "bli" : "ble",
      "alli" : "al",
      "entli" : "ent",
      "eli" : "e",
      "ousli" : "ous",
      "ization" : "ize",
      "ation" : "ate",
      "ator" : "ate",
      "alism" : "al",
      "iveness" : "ive",
      "fulness" : "ful",
      "ousness" : "ous",
      "aliti" : "al",
      "iviti" : "ive",
      "biliti" : "ble",
      "logi" : "log"
    },

    step3list = {
      "icate" : "ic",
      "ative" : "",
      "alize" : "al",
      "iciti" : "ic",
      "ical" : "ic",
      "ful" : "",
      "ness" : ""
    },

    c = "[^aeiou]",
    v = "[aeiouy]",
    C = c + "[^aeiouy]*",
    V = v + "[aeiou]*",

    mgr0 = "^(" + C + ")?" + V + C,
    meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$",
    mgr1 = "^(" + C + ")?" + V + C + V + C,
    s_v = "^(" + C + ")?" + v,
    
    h,
    length,
    index,

    buf,
    stem,
    suffix,
    firstch,
    re,
    re2,
    re3,
    re4,
    fp;

  function stemmer(w) {
    if (w.length < 3) { return w; }

    firstch = w.substr(0,1);
    if (firstch == "y") {
      w = "Y" + w.substr(1);
    }

    // Step 1a
    re0 = /^(.+?)('s|')$/;
    re = /^(.+?)(ss|i)es$/;
    re2 = /^(.+?)([^s'])'?s'?$/;

    if (re0.test(w)) { w = w.replace(re0,"$1"); }
    if (re.test(w)) { w = w.replace(re,"$1$2"); }
    else if (re2.test(w)) {  w = w.replace(re2,"$1$2"); }

    // Step 1b
    re = /^(.+?)eed$/;
    re2 = /^(.+?)(ed|ing)$/;
    if (re.test(w)) {
      fp = re.exec(w);
      re = new RegExp(mgr0);
      if (re.test(fp[1])) {
        re = /.$/;
        w = w.replace(re,"");
      }
    } else if (re2.test(w)) {
      fp = re2.exec(w);
      stem = fp[1];
      re2 = new RegExp(s_v);
      if (re2.test(stem)) {
        w = stem;
        re2 = /(at|bl|iz)$/;
        re3 = new RegExp("([^aeiouylsz])\\1$");
        re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");
        if (re2.test(w)) { w = w + "e"; }
        else if (re3.test(w)) { re = /.$/; w = w.replace(re,""); }
        else if (re4.test(w)) { w = w + "e"; }
      }
    }

    // Step 1c
    re = /^(.+?)y$/;
    if (re.test(w)) {
      fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(s_v);
      if (re.test(stem)) { w = stem + "i"; }
    }

    // Step 2
    re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
    if (re.test(w)) {
      fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = new RegExp(mgr0);
      if (re.test(stem)) {
        w = stem + step2list[suffix];
      }
    }

    // Step 3
    re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
    if (re.test(w)) {
      fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = new RegExp(mgr0);
      if (re.test(stem)) {
        w = stem + step3list[suffix];
      }
    }

    // Step 4
    re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
    re2 = /^(.+?)(s|t)(ion)$/;
    if (re.test(w)) {
      fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(mgr1);
      if (re.test(stem)) {
        w = stem;
      }
    } else if (re2.test(w)) {
      fp = re2.exec(w);
      stem = fp[1] + fp[2];
      re2 = new RegExp(mgr1);
      if (re2.test(stem)) {
        w = stem;
      }
    }

    // Step 5
    re = /^(.+?)e$/;
    if (re.test(w)) {
      fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(mgr1);
      re2 = new RegExp(meq1);
      re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
      if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
        w = stem;
      }
    }

    re = /ll$/;
    re2 = new RegExp(mgr1);
    if (re.test(w) && re2.test(w)) {
      re = /.$/;
      w = w.replace(re,"");
    }

    // and turn initial Y back to y

    if (firstch == "y") {
      w = "y" + w.substr(1);
    }

    return /q(y|x|g|c|k|f|v|m|z|j)|v(x|b|j|q|f)|x(q|j|k|z)|j(z|q)|(j|h|m|p|w|g|z|d|eo)x|(b|p|f|g)ll|(d|y|l)sv|ify|gq|cj/.test(w) ? "'" : w; 
  }

  function hash(s) {
      h = 0x811c9dc5;
      for(i = 0, l = s.length; i < l; i++) {
          h ^= s.charCodeAt(i);
          h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
      }

      return h >>> 13;
  }


  function test(word) {
      word = stemmer(word);
      length = word.length;
      index = hash(word);

      if(length < 14 && length > 3 && !/[^eyioua']{5,}|'/.test(word)) 
          return buf[index >> 3] & (1 << (index % 8));
}
  
  function init(buffer) {
      buf = buffer;
  }

  return {
      init: init,
      test: test
  }
})();