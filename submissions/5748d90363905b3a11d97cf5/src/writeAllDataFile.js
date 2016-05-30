var fs = require('fs');

var arVBlocks = fs.readFileSync("bad_vblocks.txt",'utf8').split('\n').filter(function(el){return el.length>0});
//3.4.5
var v3 = "", v4="", v5="";
var n1=0, n2=0, n3=0;
arVBlocks.forEach(function (el) {
    if (el.length==3) {
        v3+=el;
        n1++;
    } else if (el.length==4) {
        v4+=el;
        n2++;
    } else {
        v5+=el;
        n3++;
    }
});
console.log ("vb", n1, n2, n3);

var arIB = fs.readFileSync("uniq_ptrns.txt",'utf8').split('\n').filter(function(el){return el.length>0});
//2.3
var i2="", i3="";
n1=0; n2=0;
arIB.forEach(function (el) {
    if (el.length==2) {
        i2+=el;
        n1++;
    } else {
        i3+=el;
        n2++;
    }
});
console.log ("ib", n1, n2);

var ar4l = fs.readFileSync("ar4l.txt",'utf8').split('\n').filter(function(el){return el.length>0});
//4
var l3="", l4="";
n1=0; n2=0;
ar4l.forEach(function (el) {
    if (el.length==3) {
        l3+=el;
        n1++;
    } else if (el.length==4) {
        l4+=el;
        n2++;
    } else {
        console.log("wrong length", el.length);
    }
});
console.log ("4l", n1, n2);
console.log ("l3", l3);

var arToSave = [];
arToSave.push(v3);
arToSave.push(v4);
arToSave.push(v5);
arToSave.push(i2);
arToSave.push(i3);
arToSave.push(l3);
arToSave.push(l4);

writeDestFile(arToSave, "alldata.txt");

function writeDestFile(ar, fName) {
    var file = fs.createWriteStream(fName);
    file.on('error', function(err) { console.log(err) });
    ar.forEach(function(elem){
        file.write(elem+'\n');
    });
    file.end();
}

