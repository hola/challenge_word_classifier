The basic idea of solutions based on the fact that a set of correct words is fixed (in the list words.txt 661686 words) and a set of incorrect words is not restricted. Consequently, on the large set of test words it is likely that the correct word is already met. Thus, can assess whether the search word is a word from words.txt list. For such an assessment calculated the number of times the correct word should have to meet. If the test word met a lower number times, it is incorrect word.
To calculate this can use the formula: count / 2 / 661686 / 1.75.
Where:
count - the total number of words already tested;
2 - for the estimation of correct words tested, the average of the input test data set equally correct and incorrect words;
661686 - total number of words in the list words.txt;
1.75 - correction factor to account for the fact that the appearance of the correct word is probabilistic in nature, this obtained by experiment.
Theoretically, on a very large set of test words, the described solution is able to give a result close to 100%.
The test results:
at 1 000 000 test words 49.96% of correct answers;
at 5 000 000 test words 71.04% of correct answers;
at 10 000 000 test words 81.56% of correct answers;
at 15 000 000 test words 85.62% of correct answers;
at 20 000 000 test words 87.87% of correct answers;
at 25 000 000 test words 89.32% of correct answers.