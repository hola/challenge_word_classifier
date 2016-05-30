#hola spring challenge 2016 - words classifier

##my solution
I used the dictionary and made non-words out of it and together used it all (all above 1,200,000 examples) as training set for an unregularized logistic regression classifier (I wanted to use polynomial features of 4th degree but memory didn't allow and I didn't have time to change it into a big-data noline traininig method such as batch training).
I used only words of 20 or less characters (because that's the significant majority) and I converted the characters 'a'->2, 'b'->3, 'c'->4,... where '''->1 and ''(empty)->0 (for padding at the end to have uniform vectors of 20 dimensions).
After training (because of lack of time I only trained for 10 iterations starting from all-zero-theta) I included the trained theta in the file itself - no need for any data file, as it's all only ~6kb.
It doesn't perform brilliantly, but it does a fairly good job considering the low degree polynomial I took (degree=2).