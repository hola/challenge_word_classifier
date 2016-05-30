let f = false, t = true;
let ruleTable = {"a":[[f,t,"ia","2"],[f,t,"a","1"]],"b":[[f,f,"bb","1"]],"c":[[f,f,"ytic","3","s"],[t,f,"ic","2"],[t,f,"nc","1","t"]],"d":[[f,f,"dd","1"],[t,f,"ied","3","y"],[f,f,"ceed","2","ss"],[f,f,"eed","1"],[t,f,"ed","2"],[t,f,"hood","4"]],"e":[[t,f,"e","1"]],"f":[[f,f,"lief","1","v"],[t,f,"if","2"]],"g":[[t,f,"ing","3"],[f,f,"iag","3","y"],[t,f,"ag","2"],[f,f,"gg","1"]],"h":[[f,t,"th","2"],[f,f,"guish","5","ct"],[t,f,"ish","3"]],"i":[[f,t,"i","1"],[t,f,"i","1","y"]],"j":[[f,f,"ij","1","d"],[f,f,"fuj","1","s"],[f,f,"uj","1","d"],[f,f,"oj","1","d"],[f,f,"hej","1","r"],[f,f,"verj","1","t"],[f,f,"misj","2","t"],[f,f,"nj","1","d"],[f,f,"j","1","s"]],"l":[[f,f,"ifiabl","6"],[f,f,"iabl","4","y"],[t,f,"abl","3"],[f,f,"ibl","3"],[t,f,"bil","2","l"],[f,f,"cl","1"],[f,f,"iful","4","y"],[t,f,"ful","3"],[f,f,"ul","2"],[t,f,"ial","3"],[t,f,"ual","3"],[t,f,"al","2"],[f,f,"ll","1"]],"m":[[f,f,"ium","3"],[f,t,"um","2"],[t,f,"ism","3"],[f,f,"mm","1"]],"n":[[t,f,"sion","4","j"],[f,f,"xion","4","ct"],[t,f,"ion","3"],[t,f,"ian","3"],[t,f,"an","2"],[f,f,"een","0"],[t,f,"en","2"],[f,f,"nn","1"]],"p":[[t,f,"ship","4"],[f,f,"pp","1"]],"r":[[t,f,"er","2"],[f,f,"ear","0"],[f,f,"ar","2"],[t,f,"or","2"],[t,f,"ur","2"],[f,f,"rr","1"],[t,f,"tr","1"],[t,f,"ier","3","y"]],"s":[[t,f,"ies","3","y"],[f,f,"sis","2"],[t,f,"is","2"],[t,f,"ness","4"],[f,f,"ss","0"],[t,f,"ous","3"],[f,t,"us","2"],[t,t,"s","1"],[f,f,"s","0"]],"t":[[f,f,"plicat","4","y"],[t,f,"at","2"],[t,f,"ment","4"],[t,f,"ent","3"],[t,f,"ant","3"],[f,f,"ript","2","b"],[f,f,"orpt","2","b"],[f,f,"duct","1"],[f,f,"sumpt","2"],[f,f,"cept","2","iv"],[f,f,"olut","2","v"],[f,f,"sist","0"],[t,f,"ist","3"],[f,f,"tt","1"]],"u":[[f,f,"iqu","3"],[f,f,"ogu","1"]],"v":[[t,f,"siv","3","j"],[f,f,"eiv","0"],[t,f,"iv","2"]],"y":[[t,f,"bly","1"],[t,f,"ily","3","y"],[f,f,"ply","0"],[t,f,"ly","2"],[f,f,"ogy","1"],[f,f,"phy","1"],[f,f,"omy","1"],[f,f,"opy","1"],[t,f,"ity","3"],[t,f,"ety","3"],[f,f,"lty","2"],[f,f,"istry","5"],[t,f,"ary","3"],[t,f,"ory","3"],[f,f,"ify","3"],[t,f,"ncy","2","t"],[t,f,"acy","3"]],"z":[[t,f,"iz","2"],[f,f,"yz","1","s"]]};

function acceptable(candidate) {
  return /^[aeiou]/.test(candidate) ? candidate.length > 1
                                    : candidate.length > 2 && candidate.match(/[aeiouy]/);
}

function getStem(token, intact=true) {
  let section = token.substr(-1);
  let rules = ruleTable[section];

  if (rules) {
    for (let rule of rules) {
      if ((intact || !rule[1]) && token.substr(-rule[2].length) == rule[2]) {
        let result = token.substr(0, token.length - rule[3]);

        if (rule[4])
          result += rule[4];

        if (acceptable(result)) {
          token = result;

          return rule[0] ? getStem(result, false) : result;
        }
      }
    }
  }

  return token;
}
