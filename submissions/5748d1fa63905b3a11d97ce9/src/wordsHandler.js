const fs = require('fs');

  var file = fs.readFileSync('words.txt');
  file = file.toString();

   // Разбивка файла по строкам
  var lines = file.split('\n');
  for (var i = 0; i < lines.length; i++) {
    lines[i] = lines[i].toLowerCase();
  }

  var newLines = lines.map(function(name) {
  	var lastTwo = name.slice(-2);
  	if (lastTwo == "'s") return name.slice(0, name.length - 2);
  	var last = name.slice(-1);
  	if (last == 's') return name.slice(0, name.length - 1);
  });

  var obj = {};

  for (var i = 0; i < newLines.length; i++) {
  	obj[newLines[i]] = true;
  }

  var newLines = [];

  for (key in obj) {
  	newLines.push(key);
  }

  file = newLines.join('\n');

  fs.writeFileSync('newFile.txt', file);

//   var zopfli = require('node-zopfli');
// fs.createReadStream('newFile.txt')
//   .pipe(zopfli.createGzip({
//   verbose: false,
//   verbose_more: false,
//   numiterations: 13,
//   blocksplitting: true,
//   blocksplittinglast: false,
//   blocksplittingmax: 5
// }))
//   .pipe(fs.createWriteStream('newFile.txt.gz'));