== Word Classifier
  
  - Build using bloom filter.
  - Hashing alogorithm is FNV1
  - Word Processing:
    - Read words.text
    - Devide each words to 4 subwords or less, it's depend on word length. i.e 'abcdefghijkl' => [abc, defg, hij, kl]
    - Build bloom filters for each words groups and export it to binary file.
  - Word existance checking: 
    - Read boom file and check hash value against bit position.
     
  NOTE: accuracy is not good beacuse I have taken 0.1(10%) as error rate due to file size limit.
