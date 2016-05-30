var fs = require('fs');
var file = 'words';
var I = fs.readFileSync(file+'.txt', 'utf8').split('\n');
var Il = I.length;
var dubl = {};

for(var i=0; i<Il; i++){
   var e = I[i].toLowerCase();
   if(e.length>1) {
     dubl[e] = 1; 
   }
}
fs.writeFile(file+'_.txt', Object.keys(dubl).sort().join('\n'));
