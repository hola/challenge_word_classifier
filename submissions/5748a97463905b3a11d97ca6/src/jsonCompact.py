# -*- coding: utf-8 -*-
"""
Created on Thu May 26 22:24:32 2016

@author: Vladislav
"""

from json import encoder

import datasets

sourceRepr = encoder.FLOAT_REPR
print(encoder.FLOAT_REPR)

encoder.FLOAT_REPR = lambda o: format(round(o,7),'.7f').rstrip('0').rstrip('.')
data = datasets.loadDatasetJson("data.txt")
datasets.saveDatasetJson(data, "dataCompact.txt")

encoder.FLOAT_REPR = sourceRepr

