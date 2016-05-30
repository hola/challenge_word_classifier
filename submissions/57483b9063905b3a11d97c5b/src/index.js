module.exports = {
  init: function(data) {
    createNetFromBuffer(data);
  },

  test: function(word) {
	if (word.length > 20) {
		word = word.substring(0,20);
	}
	var result = evalNet(word);
    return result[0] > result[1];
  }
};
function evalNet(word) {
	var nnData = wordToData(word);
	net.layers[0].neurons = nnData;
	for (var i = 1; i < net.layers.length; i++) {
		var layer = net.layers[i];
		var prev = net.layers[i-1];
		var sum = [];
		for (var j = 0; j < layer.neurons.length; j++) {
			sum[j] = 0;
			for (var z = 0; z < prev.neurons.length; z++) {
				sum[j] += prev.weights[z][j] * prev.neurons[z];
			}
			sum[j] += prev.weights[prev.weights.length-1][j];
		}
		layer.neurons = layer.act(sum);
	}
	return net.layers[net.layers.length-1].neurons;
}
function wordToData(word) {
	word = word.toUpperCase();
	var step = 1/28;
	var res = [];
	for (var i = 0; i < 20; i++)
		res[i] = 0;
	for (i = 0; i < word.length; i++) {
		var ch = word.charCodeAt(i);
		var nr = ch - 65;
		if (ch == '\'')
			nr = 27;
		res[i] = step*(1+nr);
	}
	return res;
}
var net;
function createNetFromBuffer(buff) {
	net = new Object();
	net.layers = [];
	net.layers.push(createLayer(id, true, 20));
	net.layers.push(createLayer(tanh, true, 20));
	net.layers.push(createLayer(tanh, true, 20));
	net.layers.push(createLayer(tanh, true, 20));
	net.layers.push(createLayer(tanh, true, 20));
	net.layers.push(createLayer(tanh, true, 20));
	net.layers.push(createLayer(tanh, true, 20));
	net.layers.push(createLayer(tanh, true, 20));
	net.layers.push(createLayer(tanh, true, 20));
	net.layers.push(createLayer(softmax, false, 2));
	var offset = 0;
	for(var i = 0; i < net.layers.length-1; i++) {
		for(var j = 0; j < net.layers[i].neurons.length+1; j++) {
			for (var z = 0; z < net.layers[i+1].neurons.length; z++) {
				net.layers[i].weights[j][z] = buff.readDoubleBE(offset);
				offset += 8;
			}
		}
	}
}
function id(x) {
	var result = [];
	for (var i = 0; i < x.length; i++)
		result[i] = x[i];
	return result;
}
function tanh(x) {
	var result = [];
	for (var i = 0; i < x.length; i++)
		result[i] = Math.tanh(x[i]);
	return result;
}
function softmax(x) {
	var result = [];
	var sumexp = 0;
	for (var i = 0; i < x.length; i++)
		sumexp += Math.exp(x[i]);
	for (var i = 0; i < x.length; i++)
		result[i] = Math.exp(x[i])/sumexp;
	return result;
}
function createLayer(activation, bias, size) {
	var layer = new Object();
	layer.weights = [];
	layer.act = activation;
	if (bias)
		layer.bias = 1;
	layer.neurons = [];
	for (var i = 0; i < size+(bias ? 1 : 0); i++) {
		layer.weights[i] = [];
	}
	for (i = 0; i  < size; i++) {
		layer.neurons[i] = 0;
	}
	return layer;
}