exports.init=s=>b=s
exports.test=s=>!/'|.{14}|[qjx]{2}|[qjxzwkvfgbdm]{3}|[^aeiouy]{5}/.test(s=Buffer(s.replace(/(...+?)(ing)?(ed)?(ly)?s?('s)?$/,'$1')),h=s.slice(0,8).reduce((x,y)=>(137*x+y)%557648))&&b[h>>3]>>(h&7)&1
