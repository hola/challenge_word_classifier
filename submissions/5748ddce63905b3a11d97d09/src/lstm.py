from keras.optimizers import SGD
import numpy as np
# import sklearn.preprocessing.OneHotEncoder
import sys
from sklearn.preprocessing import OneHotEncoder
from keras.preprocessing import sequence
from scipy import sparse
import math
# The usual preamble
import pandas as pd
import matplotlib.pyplot as plt
from keras.callbacks import (
    ModelCheckpoint, EarlyStopping, ProgbarLogger)
# , TensorBoard
from util import *
# from lstm_peep import LSTMpeephole
import os.path
import nmodel

# import theano
# theano.config.openmp = True

# Make the graphs a bit prettier, and bigger
plt.style.use('ggplot')
# plt.style.use('default')
# pd.set_option('display.line_width', 5000)
# pd.set_option('display.max_columns', 60)
# figsize = (15, 5)

# Preprocessing funcs
# [ a-z'] -
maxWordLen = 16
# maxWordLen = 4
batchSize = 512
# batchSize = 128
# batchSize = 128
# batchSize = maxWordLen + 1

# vocabulary binary vector
# 1 EOW  + 26 a-z + 1 (')
# data_dim = 31
data_dim = 28
# timesteps = 4


def f(w):
    return word2onehot(w)

# good = np.genfromtxt(
#     './data/good3chars.txt', delimiter=",",
#     filling_values=1.,
#     dtype=[('word', '|S100')])
# good = np.append(good, np.ones(good.size), 1)
# print(repr(good))

# # good1hot = goodWords['good'].map(f)
# good1hot['valid'] = pd.Series(np.ones(good1hot.size), index=good1hot.index)

# # bad1hot = goodWords['good'].map(f)
# bad1hot['valid'] = pd.Series(np.zeros(bad1hot.size), index=bad1hot.index)

# all1hot = good1hot.append(bad1hot, ignore_index=True)
# # shuffle good&bad
# all1hot = all1hot.sample(frac=1.0)

# len = all1hot.size
# trainSize = len // 3
# testSize = len - trainSize * 2
# testOffset = trainSize * 2

# trainDf = all1hot[0:trainSize]
# valDf = all1hot[trainSize:testOffset]
# testDf = all1hot[testOffset:]
# print(repr([trainSize, testSize, testOffset]))
# print(repr([trainDf.size, valDf.size, testDf.size]))
# sys.exit(0)

df = pd.read_csv(
    # "./data/train4chnr.csv",
    # './data/gen_train.csv',
    './data/train_all.csv',
    names=["word", "category"],
    dtype={
        "word": str,
        "category": int},
    header=None,
    na_filter=False,
    # index_col="word",
    verbose=True)

# df = pd.read_csv(
#     './data/dataset3less.csv',
#     names=["word", "category", "source", "errorcat"],
#     dtype={
#         "word": str,
#         "category": int,
#         "source": int,
#         "errorcat": int},
#     na_filter=False,
#     # index_col="word",
#     verbose=True)
# converters={
#     "word": word2onehot,
#     "category": category2onehot})

# mask = (df['word'].str.len() == 3)
# df = df.loc[mask]

# validate data set
validLen = len(df[df.category == 1])
invalidLen = len(df[df.category == 0])
print(validLen, invalidLen)
# input("Press Enter to continue...")
if (abs(validLen - invalidLen) / (validLen + invalidLen) > 0.001):
    print("Valid/invalid items should be equal!")
    sys.exit(0)


def f2(v):
    v = v[:maxWordLen]
    return fastword2vec2(v, maxWordLen, data_dim)


def f3(v):
    v = v[:maxWordLen]
    return word2vec2(v, maxWordLen)

# df['wordVector'] = df["word"].map(f2)
# df['resultVector'] = df["category"].map(category2onehot)

# convert pandas to numpy

dx = df.iloc[:, 0].values
dy = df.iloc[:, 1].values

x = np.empty((df.shape[0], maxWordLen+1, data_dim))
# x = np.empty((df.shape[0], maxWordLen+1))
y = np.empty((df.shape[0], 1))

for i in range(df.shape[0]):
    x[i] = f2(dx[i])
    # x[i] = f3(dx[i])
    y[i] = dy[i]
    # y[i] = category2onehot(dy[i])

print('x', x.shape)
print('y', y.shape)
# print(x)

# x = np.zeros((len(df.index), maxWordLen, data_dim))
# y = np.zeros((len(df.index), 2))

# for i,  in df["word"]

trainCount = math.ceil(x.shape[0] * 0.7)
# trainData = df[:trainCount]

# trainData = pd.read_csv(
#     './data/train3.csv',
#     names=["word", "y"],
#     dtype=str,
#     na_filter=False,
#     verbose=False,
#     converters={"word": word2onehot})
x_train = x[:trainCount]
y_train = y[:trainCount]
# x_train = np.zeros((len(trainData.index), maxWordLen, data_dim))
# x_train = np.array(trainData["wordVector"])
# y_train = np.zeros((len(trainData.index), 2))
# y_train = np.array(trainData["resultVector"])
# x_train = np.array([[
#     [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
#         0, 0, 0],
#     [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
#         0, 0, 0],
#     [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
#         0, 0, 0],
#     [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
#         0, 0, 0]]])
# y_train = np.array([[1, 0]])
# validationData = pd.read_csv(
#     './data/validate3.csv',
#     names=["word", "y"],
#     dtype=str,
#     na_filter=False,
#     verbose=False,
#     converters={"word": word2onehot})
# validationData = df[trainCount:]
# x_val = validationData["wordVector"]
# y_val = validationData["resultVector"]
# x_val = x_train
# y_val = y_train
x_val = x[trainCount:]
y_val = y[trainCount:]

# x_train = sequence.pad_sequences(x_train, maxlen=maxWordLen)
# x_val = sequence.pad_sequences(x_val, maxlen=maxWordLen)
print('x_train shape:', x_train.shape)
print('y_train shape:', y_train.shape)
# print('x_val shape:', x_val.shape)
# print('y_val shape:', y_val.shape)

# print(x_val, y_val)

# testData = pd.read_csv(
#     './data/validate3.csv',
#     names=["word", "y"],
#     dtype=str,
#     na_filter=False,
#     verbose=False,
#     converters={"word": word2onehot})

# x_test = testData["word"]
# y_test = testData["y"]
x_test = x_val
y_test = y_val

# words = [
#     "cat", "Kiev", "IBM"]


# print(repr(
#     [word2vec(w) for w in words]
# ))

lstm = nmodel.getModel(maxWordLen, data_dim)

with open('./data/model.json', 'w') as f:
    f.write(lstm.to_json())

modelPath = "./data/weights.hdf5"

if os.path.isfile(modelPath):
    lstm.load_weights(modelPath)

# mean_squared_error
lstm.compile(
    # loss="mse",
    loss="binary_crossentropy",
    optimizer="adam",
    # rmsprop worse result
    # optimizer="rmsprop",
    # optimizer="adadelta",
    metrics=['accuracy'])

# # generate dummy training data

# x_train = np.random.random((1000, timesteps, data_dim))
# y_train = np.random.random((1000, 1))

# # # generate dummy validation data
# x_val = np.random.random((100, timesteps, data_dim))
# y_val = np.random.random((100, 1))
checkpointer = ModelCheckpoint(
    filepath=modelPath, verbose=1, save_best_only=True)

# tensorBoard = TensorBoard(
#     log_dir='./logs', histogram_freq=0, write_graph=True)

earlyStopper = EarlyStopping(
    monitor='val_loss', patience=10, verbose=0, mode='auto')
progbar = ProgbarLogger()

print("Training...")

history = lstm.fit(
    x_train, y_train,
    batch_size=batchSize, nb_epoch=1000,
    validation_data=(x_val, y_val),
    callbacks=[earlyStopper, progbar, checkpointer])
# tensorBoard, checkpointer
score = lstm.evaluate(x_test, y_test, verbose=0)
print('Test score:', score[0])
print('Test accuracy:', score[1])

# Compare models' accuracy, loss and elapsed time per epoch.
plt.style.use('ggplot')
ax1 = plt.subplot2grid((2, 2), (0, 0))
ax1.set_title('Accuracy')
ax1.set_ylabel('Validation Accuracy')
ax1.set_xlabel('Epochs')
ax2 = plt.subplot2grid((2, 2), (1, 0))
ax2.set_title('Loss')
ax2.set_ylabel('Validation Loss')
ax2.set_xlabel('Epochs')
# ax3 = plt.subplot2grid((2, 2), (0, 1), rowspan=2)
# ax3.set_title('Time')
# ax3.set_ylabel('Seconds')
ax1.plot(history.epoch, history.history['val_acc'], label="aa")
ax2.plot(history.epoch, history.history['val_loss'], label="bb")
ax1.legend()
ax2.legend()
# ax3.bar(np.arange(len(results)), [x[1] for x in results],
#         tick_label=modes, align='center')
plt.tight_layout()
plt.show()
