from keras.models import Sequential, Model
from keras.layers import merge, LSTM, Dense, Dropout, Input, Embedding, GRU
from keras.regularizers import l2, activity_l2


def getModel(maxWordLen, data_dim):
    # mlp = Sequential()
    # mlp.add(Dense(512, input_dim=data_dim, init='uniform', activation='tanh'))
    # mlp.add(Dropout(0.5))
    # mlp.add(Dense(128, init='uniform', activation='tanh'))
    # mlp.add(Dropout(0.5))
    # mlp.add(Dense(1, init='uniform', activation='sigmoid'))

    # sgd = SGD(lr=0.1, decay=1e-6, momentum=0.9, nesterov=True)
    # mlp.compile(loss='mean_squared_error',
    #             optimizer=sgd,
    #             metrics=['accuracy'])

    # # train
    # mlp.fit(x_train, y_train,
    #         batch_size=68, nb_epoch=5,
    #         validation_data=(x_val, y_val))
    # # test
    # score = mlp.evaluate(x_test, y_test, show_accuracy=True, verbose=0)
    # print('Test score:', score[0])
    # print('Test accuracy:', score[1])
    # , dtype='int32'

    # inp = Input(shape=(maxWordLen+1, data_dim))
    # # embedded = Embedding(data_dim, 128, input_length=maxWordLen+1)(inp)
    # # # # apply forwards LSTM
    # forwards = LSTM(
    #     128, return_sequences=False)(inp)
    # # # apply backwards LSTM
    # backwards = LSTM(
    #     128, return_sequences=False, go_backwards=True)(inp)

    # # # # concatenate the outputs of the 2 LSTMs
    # merged = merge([forwards, backwards], mode='concat', concat_axis=-1)
    # # after_dp = Dropout(0.5)(merged)
    # # # l2 = LSTM(16)(merged)
    # output = Dense(2, activation='softmax')(merged)
    # lstm = Model(input=inp, output=output)

    lstm = Sequential()
    # lstm.add(Embedding(data_dim, 128, input_length=maxWordLen+1))
    # embedded = Embedding(max_features, 128, input_length=maxlen)(sequence)
    # lecun_uniform
    lstm.add(GRU(
        output_dim=62,
        return_sequences=False,
        # batch_input_shape=(),
        input_shape=(maxWordLen+1, data_dim),
        consume_less="cpu",
        go_backwards=False,
        dropout_W=0.25
        # W_regularizer=l2(0.01),
        # b_regularizer=l2(0.01)
        ))

    # lstm.add(GRU(8, return_sequences=False, consume_less="cpu"))

    # lstm.add(LSTMpeephole(
    #     output_dim=1,
    #     return_sequences=False,
    #     # batch_input_shape=(),
    #     input_shape=(maxWordLen+1, data_dim),
    #     consume_less="cpu",
    #     go_backwards=False
    #     # dropout_W=0.5
    #     # W_regularizer=l2(0.01)
    #     # b_regularizer=l2(0.01)
    #     ))

    # lstm.add(LSTM(
    #     128, return_sequences=False, consume_less="cpu",
    #     go_backwards=True))

    # lstm.add(LSTM(
    #     hidden_units, return_sequences=True, consume_less="cpu",
    #     go_backwards=False))

    # lstm.add(LSTM(
    #     hidden_units, return_sequences=False, consume_less="cpu",
    #     go_backwards=False))

    # lstm.add(LSTM(
    #     hidden_units, return_sequences=True, consume_less="cpu",
    #     go_backwards=True))

    # lstm.add(LSTM(
    #     hidden_units,
    #     return_sequences=True,
    #     # Varies by word length
    #     input_length=None,
    #     input_dim=data_dim))
    # lstm.add(LSTM(hidden_units, return_sequences=True))
    # lstm.add(LSTM(hidden2_units, return_sequences=False, consume_less="cpu"))
    # lstm.add(Dense(256, activation="tanh"))
    # lstm.add(Dense(32, activation="tanh"))
    lstm.add(Dense(1, activation="sigmoid"))
    # lstm.add(Dense(2, activation="softmax"))
    return lstm
