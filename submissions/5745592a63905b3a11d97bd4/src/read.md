I have filtered word.txt and saved fresh data in data.txt.

I have used a function similar() to find similarity between consecutive words. And on the basis of similarity I have selected one word at a time.

To reduce the size of data.txt I have chosen every 30th word in the filtered data.

To avoid use of init(data) function I have added the filtered data in an array in tempArray[] in test.js.

----------test.js------------------
I am converting the tempArray to string and checking if it contains the input word. If yes, the word in an English word.
If not, I check whether first half of the input word is contained in tempArray. If yes, guessing the word to be an English word.

Else, the word is not English word.
