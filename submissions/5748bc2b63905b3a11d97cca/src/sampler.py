import csv
import utils
import prepare_img
import numpy as np

class Sampler:
    def __init__(self, file_name, supplied_label = None):
        words = []
        labels = []
        for row in csv.reader(open(file_name, 'rb')):
            word = row[0]
            ac = int(row[1])
            if len(word) not in utils.train_range:
                continue
            words.append(word)
            labels.append(ac)
        self.words = np.array(words)
        self.labels = np.array(labels) * 2 - 1
        if supplied_label is not None:
            self.labels = supplied_label

    def Size(self):
        return self.labels.shape[0]
     
    def Epoch(self, batch_size, random = True):
        orders = np.arange(self.labels.shape[0])
        if random:
            np.random.shuffle(orders)
        for i in xrange((self.labels.shape[0] + batch_size - 1) // batch_size):
            yield prepare_img.transform(self.words[orders[i * batch_size : (i + 1) * batch_size]]), self.labels[orders[i * batch_size : (i + 1) * batch_size]]

