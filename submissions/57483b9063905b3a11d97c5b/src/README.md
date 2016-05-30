This solution loads pre-trained neural network. Network was trained using Encog for Java.
Basically, it limits strings to 20 length, turns that string into number vector, feeds it to neural network and then reads the results. 
Network was trained on full dictionary and about the same number of randomly generated words, it tends to set them apart relatively well but it will perform badly
on words which are really similar to some existing ones. I was hoping that network will overfit words in the dictionary, but due to having quite limited processing power at hand,
I was unable to experiment with large networks, but it doesn't seem to perform horribly bad.