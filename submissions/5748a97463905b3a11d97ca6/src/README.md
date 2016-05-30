The approach:

1. There is a dictionary with classes that are rare in positive dataset while
they are more frequent in negative dataset. Words in these classes are
outliers. There are a lot of unusual or complex words in this dictionary.
Also there are is a lot of classes there that are empty for positive dataset.
Testing if word outlier and if it's contained in the dictionary is the first step.

2. If word is not classified during the first step, it's tested with trained
AdaBoost model with Decision Trees as weak learners.


Order of use:
1. Put words.txt in the main folder
2. Download JSON dictionary from the competition website by downloading and merging JSON objects multiple times.
For example it can be done with downloadDataset.py
Save the result as datasetFromSite.txt in main folder
3. Run generateTrainingDatasetAndOutliers.py
4. Run generateFeaturesAndLabels.py
5. Run fitModel.py
6. Run jsonCompact.py to get data.txt smaller. Output is dataCompact.txt

Ways to further improve the classifier:
1. Construct better features
2. Construct better classifiers for outliers detection
3. Conduct more experiments to tune the model parameters