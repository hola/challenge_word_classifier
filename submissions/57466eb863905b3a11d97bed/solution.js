function main(str){
let c1 = 0;
let c2 = 0;	
if (str.length >=4){
for (i = 0;i<=(str.length-4);i++){
c1++;
if (Buffer.has(str.substr(i,4))) c2++;
};} else {
   Buffer.forEach(function f(s){if (s.substr(0,str.length) == str){ c1=1; c2=1; }});
};

if (c2 == 0 )  return false;
if (c1 == c2) return true;
if ((c1>7)&&(c1 - c2) > 1) return false;
return true;	
}

module.exports.Buffer= new Set();
module.exports = {
init: function(ss){
let Buff = new Set();
let s = ss.toString();
let i = 0;
let word = "";
while (i < s.length)
{
word = s.substr(i,4);
Buff.add(word);
i += 4;
}
Buffer = Buff;
},
test: main
}
