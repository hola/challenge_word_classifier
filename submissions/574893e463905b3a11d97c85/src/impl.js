const size=64000;
var data,i,val;
const has = word => {
  val = 9544;
  for (i = 0; i < word.length; ++i)
  {
    val ^= word.charCodeAt(i);
    val += (val << 1) + (val << 4) + (val << 7) + (val << 8) + (val << 24);
  }
  val = (val >>> 0)%(size*8);
  return !!(data[val >> 3] & (1 << (7 & val)));
};
function test(word){
  val = word.replace(/\'s$/,'');
  ow = val;
  //all 2 letter words
  if(val.length == 2&&/\w\w/.test(val)){
    return /[ad].|b[^jq]|[ch][^x]|e[^jk]|f[^hjkq]|g[^fjxz]|i[^h]|j[^bfhkmnqwxz]|k[^fhkqxz]|l[^kq]|m[^qz]|n[^knx]|o[^q]|[ps][^z]|q[^gjkowxz]|r[^kz]|t[^fjqz]|u[^efjoqyz]|v[^hkqyz]|w[^jnqxz]|x[^fghjkmyz]|y[^cghjklqwxz]|z[^cefhjmpqv-y]/.test(val);
  }
  //apos count
  val = word.split("'").length-1;
  if(val>1){
    return false;
  }
  if(val && word.slice(-2)!='\'s'){
    return false;
  }
  if((word.match(/[bcdfghjklmnpqrstvwxz]+/g)||[])
  .find(x=>x
    .replace(/[cgst]+h|[csg][rk]|[gt]s|st/g,1)
  .length>3)){
    return false;
  }

  //+0,003
  if(word.length>18){
    return false;
  }
  [
    '\'s',
    // 'n\'t',
    'ness',
    'ly',
    's',
    'al',
    'ing',
    'ed',
    'ion',
    'e'
  ].forEach(x=>
    word.slice(-x.length)==x && word.length>3?word=word.slice(0,-x.length):0
  );
  if(word.replace(/bility|ation|cism|cial|ism|ality|ist|ativ|ship|ness|ment|aphy|acea|ular|phic|logy|tomy|ceou|ogic|nary|stic|tric|izat/g,'').length>13){//ation
    return false;
  }
  if(word[0] == '\''){
     return false;
  }
  return (has(word)
  &&(word.length>3||has(word.split('').reverse().join('')))
  ||/^(a(a[aefhlmprsux]|b[ac-eil-pr-v]|c[b-dfhk-mops-vy]|d[a-fh-jm-pr-t]|e[c-fr-u]|f[b-dfgil-nprt]|g[acdhl-or-uy]|h[eioqs-u]|i[cdfhkmnr-tx]|l[a-gik-ps-uwy]|m[b-eiopr-ty]|n[ac-eg-ilns-uy]|o[ablp-sw]|p[beghjlmopr-ux]|r[b-gim-vxy]|s[cegik-mopstw]|t[abehikm-or-tv]|u[cdf-hk-mpsx]|v[adem-o]|w[abdegk-nsu]|y[ehm-or])|s(a[a-eghkln-prt-y]|c[abd-fhimopr-ux]|d[abdfhiln-prsv]|e[ac-egil-np-tv-z]|h[aefhimoprtuy]|i[a-gk-npr-tx]|m[adeilmot]|o[b-eghk-nprtv-y]|p[ac-filprtuy]|q[c-el]|r[a-din-ps]|s[a-inor-uw]|t[adeg-il-nprsuvy]))$/.test(ow))
}

module['exports'] = {
  'test': test,
  'init': buf => {
    data = new Uint8Array(buf)
  }
}
