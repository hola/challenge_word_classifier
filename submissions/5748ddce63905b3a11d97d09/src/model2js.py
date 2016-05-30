import serialize_keras

serialize_keras.serialize(
    './data/model.json', './data/weights.hdf5', './data/keras.json', False)

serialize_keras.serialize(
    './data/model.json', './data/weights.hdf5', './data/keras.json.gz', True)

print("Done!")
