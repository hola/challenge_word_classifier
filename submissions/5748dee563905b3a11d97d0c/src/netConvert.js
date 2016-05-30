// Convert from FANN net to classifier net (gzip-ed)

var fileSrc  = './ann_cpp/nets/net_name.d/fann.net',
    fileDest = './data.gz',
    decimalPlaces = 5;  // reduce size of dest file

var fs = require("fs");
var zlib = require("zlib");
var dataSrc = fs.readFileSync(fileSrc).toString().split('\n');
var dataDest;

var layerSizes = [],
    weigths = [];

for (var line of dataSrc) {
    var re, match;

    line = line.trim();

    re = /^layer_sizes=(.+)$/;
    if (re.test(line)) {
	match = re.exec(line);
	layerSizes = match[1].split(' ');
	continue;
    }

    re = /^connections .+=(.+)$/;
    if (re.test(line)) {
	match = re.exec(line);
	match = match[1].replace(/\(/g, ' ').replace(/\)/g, ',').replace(/, *$/, '');
	match = JSON.parse('[' + match + ']');
	// now 'match' contains couples as: (connected_to_neuron, weight)

	// make layer[0]
	weigths[0] = [];
	for (var i = 0; i < layerSizes[0]; i++) {
	    weigths[0][i] = [];
	}

	// make all layers
	var layer = 1,
            neuron = 0,
            connection = 0;
	for (var i = 1; i < match.length; i += 2) {
	    if (weigths[layer]         == undefined) weigths[layer]         = [];
	    if (weigths[layer][neuron] == undefined) weigths[layer][neuron] = [];

	    weigths[layer][neuron][connection] = match[i].toFixed(decimalPlaces);
	    connection++;
	    if (connection == layerSizes[layer - 1]) {
		connection = 0;
		neuron++;
	    }
	    // bias neuron: weigths not registered in file
	    if (neuron == layerSizes[layer] -1) {
		weigths[layer][neuron] = [];
		connection = 0;
		neuron = 0;
		layer++;
	    }
	}

	continue;
    }
}

// sanity check
if (layerSizes.length == 0 || typeof layerSizes !== "object")
    console.log("Error: layerSizes not found.");

// save converted file
dataDest = zlib.gzipSync(
    JSON.stringify(weigths),
    {level: zlib.Z_BEST_COMPRESSION}
);
fs.writeFileSync(fileDest, dataDest);

