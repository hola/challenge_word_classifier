exports.init=function(d){b=d}
function t(w,o=0){n=[...w].reduce((a,c)=>(a*26+c.charCodeAt()-96)&0x7FFFF,0);return (b[Math.floor(n/8)+o]&(1<<(n%8)))!=0}
exports.test=function(w){
s=w.replace(/'s$/,'').replace(/sses$/,'ss').replace('ies','y').replace(/(.{2,}[^s])(s|ion)$/,'$1').replace(/(ly|ing|[ai]ble|ic|e?ment|ism|ity|ous|ive|ful|ness)+$/,'')
return s.length<13&&!/'|j[qxz]|q[jxz]|vq|xj|zx|^([blmuwz]q|[flvxy]k|[ghkwy]x|[krvwxy]z|[qx]g|uo|[yz]j|z[cfv])|(g[jz]|j[bfhw]|k[qz]|mq|pz|q[kow]|tq|v[kz]|[wy][jq]|x[ghkz]|z[fjmpqw])$|[^aeiouy]{5,}/.test(s)&&(w.length==2?t(w,65537):/^.$/.test(w)||t(s))}
