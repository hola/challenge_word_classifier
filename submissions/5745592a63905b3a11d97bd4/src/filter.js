var exports = module.exports={};

exports.test=function(word){

  var fs = require("fs");
  var data = fs.readFileSync('words.txt');

  var arrayOfWords = data.toString().toLowerCase().replace(" ","").split("\n");

  var data=[];
  var temp1="";
  var count1=0;
  for(var i=0;i<arrayOfWords.length;i++){


    if((arrayOfWords[i].split("").length==4||arrayOfWords[i].split("").length>4)&&temp1=="")
    temp1=arrayOfWords[i];

    if(similar(arrayOfWords[i],temp1)<50){
      temp1=arrayOfWords[i];
      if(count1%30==0)
      data.push('"'+arrayOfWords[i]+'"');
      count1++;
    }

  }

  fs.writeFile('data.txt', data, function (err) {
    if (err) return console.log(err);
    console.log('written');
  });
};

function similar(a,b) {
  var lengthA = a.length;
  var lengthB = b.length;
  var equivalency = 0;
  var minLength = (a.length > b.length) ? b.length : a.length;
  var maxLength = (a.length < b.length) ? b.length : a.length;
  for(var i = 0; i < minLength; i++) {
    if(a[i] == b[i]) {
      equivalency++;
    }
  }


  var weight = equivalency / maxLength;
  return (Math.ceil(weight * 100));
}
