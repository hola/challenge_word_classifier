from cnn import Network
from sampler import Sampler
import utils
import numpy as np

def validate_boost(sampler, networks, weights):
    preds = []
    for i in xrange(len(networks)):
        preds.append(networks[i].predict(sampler))
    
    val = preds[0] * weights[0]
    for i in xrange(1, len(networks)):
        val += preds[i] * weights[i]

    acc = np.sum(np.equal(np.sign(val), sampler.labels))

    print 'validate boost', float(acc * 100) / sampler.Size()

def main():
    ValidSampler = Sampler(utils.valid_file)
    TestSampler = Sampler(utils.test_file)
    networks = []
    weights = []
    for i in xrange(5):
        if i == 0:
            TrainSampler = Sampler(utils.train_file)
            prev_ys = np.copy(TrainSampler.labels)
        else:
            TrainSampler = Sampler(utils.train_file, prev_ys)
        
        network = Network()
        network.train(TrainSampler)
        
        cur_ys = network.predict(TrainSampler)
        b1 = np.sum(np.multiply(cur_ys, prev_ys))
        b2 = np.sum(np.multiply(cur_ys, cur_ys))
        w = float(b1) / b2
        prev_ys = np.subtract(prev_ys, w * cur_ys)
        
        print i, 'done with weight', w
        network.save('network_' + str(i) + '.ckpt')
        weights.append(w)
        networks.append(network)

        validate_boost(ValidSampler, networks, weights)
    validate_boost(TestSampler, networks, weights)

    np.save('weights.npy', weights)

if __name__ == '__main__':
    main()

