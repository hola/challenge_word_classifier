function c(n,t){for(r=5381,i=t.length;i;)r=33*r^t.charCodeAt(--i);return r>>>=0,i=r%(8*n.length),n.readUInt8(~~(i/8))>>i%8&1}function d(n,t){return n.split("v"==t?"c":"v").sort(function(n,t){return t.length-n.length})[0].length}function k(n){e=n.toString("ascii",0,5234).split("*").map(function(n){return[n[0],n.substring(1).split(";").map(function(n){return n.split("-")})]}),f=new RegExp("("+n.toString("ascii",5234,5512).match(/.{1,2}/g).join("|")+")"),g=n.slice(67112,68112),h=n.slice(5512,67112)}function l(n){n=n.replace(/'s$/,"");for(var t in e){r=e[t][0];for(var i in e[t][1])q=e[t][1][i],q[0]&&(n=n.replace(new RegExp("p"==r?"^"+q[0]:q[0]+"$"),q[1]))}return z=n.replace(/[^aeiouy]/g,"c").replace(/[^c]/g,"v"),!(n.length>14||"'"==n[0]||!c(h,n)||d(z,"v")>4||d(z,"c")>4||(n.match(/\'/g)||[]).length>=2||n.length>=4&&!c(g,n.substring(0,3))||n.match(f))}