import numpy as np
import tensorflow as tf
import sampler
import utils
import struct

class Network():
    def __init__(self):
        self.g = tf.Graph()
        with self.g.as_default():
            self.x = tf.placeholder(tf.float32, shape = [None, 1, 24, 27])
            self.y = tf.placeholder(tf.float32, shape = [None])
            self.lr = tf.placeholder(tf.float32, shape = [])

            cnn1w = tf.Variable(tf.random_normal([1, 5, 27, 8], stddev = 0.01), name = 'cnn1w')
            cnn1b = tf.Variable(tf.zeros([20, 8]), name = 'cnn1b')
    
            x1 = tf.nn.conv2d(self.x, cnn1w, [1, 1, 1, 1], 'VALID') + cnn1b
            p1 = tf.nn.max_pool(x1, [1, 1, 2, 1], [1, 1, 2, 1], 'VALID')
            s1 = tf.tanh(p1)

            cnn2w = tf.Variable(tf.random_normal([1, 3, 8, 8], stddev = 0.01), name = 'cnn2w')
            cnn2b = tf.Variable(tf.zeros([8, 8]), name = 'cnn2b')

            x2 = tf.nn.conv2d(s1, cnn2w, [1, 1, 1, 1], 'VALID') + cnn2b
            p2 = tf.nn.max_pool(x2, [1, 1, 2, 1], [1, 1, 2, 1], 'VALID')
            s2 = tf.tanh(p2)

            rr = tf.reshape(s2, [-1,  32])

            linear1 = tf.Variable(tf.random_normal([32, 8], stddev = 0.01), name = 'linear1')
            bias1 = tf.Variable(tf.zeros([8]), name = 'bias1')

            x3 = tf.tanh(tf.matmul(rr, linear1) + bias1)

            linear2 = tf.Variable(tf.random_normal([8, 8], stddev = 0.01), name = 'linear2')
            bias2 = tf.Variable(tf.zeros([8]), name = 'bias2')

            x4 = tf.tanh(tf.matmul(x3, linear2) + bias2)

            linear3 = tf.Variable(tf.random_normal([8, 1], stddev = 0.01), name = 'linear3')
            bias3 = tf.Variable(tf.zeros([1]), name = 'bias3')

            self.x5 = tf.reshape(tf.tanh(tf.matmul(x4, linear3) + bias3), [-1])
    
            batch_size = tf.reshape(tf.cast(tf.shape(self.y), tf.float32), [])
            self.loss = tf.nn.l2_loss(self.x5 - self.y) / batch_size
            self.acc = tf.reduce_sum(tf.cast(tf.equal(tf.sign(self.x5), self.y), tf.float32)) / batch_size

            self.train_step = tf.train.RMSPropOptimizer(self.lr, 0.9, 0.9).minimize(self.loss)

            self.init_op = tf.initialize_all_variables()

            self.saver = tf.train.Saver()

        self.session = tf.Session(graph = self.g)

    def train(self, sampler, fastMode = False):
        self.session.run(self.init_op)
        mylr = 0.001
        best_ls = 1
        cnt = 0
        cnt2 = 0
        while mylr > 1e-9 and (not fastMode or cnt2 < 2000):
            for x_, y_ in sampler.Epoch(1024):
                cnt2 += 1
                ls, ac, _ = self.session.run([self.loss, self.acc, self.train_step], feed_dict = {self.x:x_, self.y:y_, self.lr:mylr})
                if ls < best_ls:
                    best_ls = ls
                    cnt = 0
                else:
                    cnt += 1
                if cnt >= 1000:
                    cnt = 0
                    mylr /= 2
                    print 'lr', mylr
    
    def predict(self, sampler):
        y = []
        for x_, y_ in sampler.Epoch(1024, False):
            y.append(self.session.run(self.x5, feed_dict = {self.x:x_}))
        return np.concatenate(y)

    def validate(self, sampler):
        acc = 0.0
        s = 0
        for x_, y_ in sampler.Epoch(1024, False):
            ac = self.session.run(self.acc, feed_dict = {self.x:x_, self.y:y_})
            size = x_.shape[0]
            acc += ac * size
            s += size
        acc = acc * 100 / s
        print 'validate', acc
        return acc

    def save(self, file_name):
        print 'Saved to', self.saver.save(self.session, file_name)

    def restore(self, file_name):
        self.saver.restore(self.session, file_name)
        print 'Model restored'

    def save__(self, f, arr, shape):
        if len(shape) == 1:
            f.write(struct.pack('f' * shape[0], *arr))
        else:
            for i in xrange(shape[0]):
                self.save__(f, arr[i], shape[1:])

    def save_(self, f, op):
        tensor = op.outputs[0]
        arr = tensor.eval(session = self.session)
        shape = tensor.get_shape()
        self.save__(f, arr, shape) 
    
    def to_file(self, f):
        self.save_(f, self.g.get_operation_by_name("cnn1w"))
        self.save_(f, self.g.get_operation_by_name("cnn1b"))
        self.save_(f, self.g.get_operation_by_name("cnn2w"))
        self.save_(f, self.g.get_operation_by_name("cnn2b"))
        self.save_(f, self.g.get_operation_by_name("linear1"))
        self.save_(f, self.g.get_operation_by_name("bias1"))
        self.save_(f, self.g.get_operation_by_name("linear2"))
        self.save_(f, self.g.get_operation_by_name("bias2"))
        self.save_(f, self.g.get_operation_by_name("linear3"))
        self.save_(f, self.g.get_operation_by_name("bias3"))

def main():
    network = Network()
    f = open('network.bin', 'wb')
    arr = np.load('weights.npy')
    f.write(struct.pack('f' * 5, *arr))
    network.restore('network_0.ckpt')
    network.to_file(f)
    network.restore('network_1.ckpt')
    network.to_file(f)
    network.restore('network_2.ckpt')
    network.to_file(f)
    network.restore('network_3.ckpt')
    network.to_file(f)
    network.restore('network_4.ckpt')
    network.to_file(f)
    f.close()

if __name__ == '__main__':
    main()
