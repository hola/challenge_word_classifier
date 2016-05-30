var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('words.txt')
});

var fs = require('fs');

var num = 3;

var i = 0;
var proper = [];
lineReader.on('line', function (line) {
  i++;
  var l = 0;
  console.log(i);
  if (l = line.length < num) {
    return;
  }

  for (var j = 0; j < line.length - num - 1; j++) {
    var triplet = line.slice(j, j+num).toLowerCase();
    var res = proper.findIndex(x => x.triplet === triplet);
    if (proper.find(x => x.triplet === triplet)) {
        proper[res].count++;
        if (proper[res].pos.indexOf(j) === -1)
            proper[res].pos.push(j);
    } else {
        proper.push({
            triplet,
            count: 1,
            pos: [j]
        })
    }
  }

});

lineReader.on('close', () => {
    console.log(proper.length);

    fs.writeFile("./raw" + num + "positions.txt", proper.map(x => x.triplet + ":" + x.count + ":" + x.pos.join("|")).join(","), 'ascii', function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    }); 
});
