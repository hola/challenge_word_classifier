import nmodel

model = nmodel.getModel(maxWordLen=15, data_dim=28)
with open('./data/model.json', 'w') as f:
    f.write(model.to_json())
