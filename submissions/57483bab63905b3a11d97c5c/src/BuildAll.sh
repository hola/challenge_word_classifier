#!/bin/bash

##################################################
# 1. Remove arficacts
# 2. Compile Java code
##################################################
rm -f extra_data.gz src.tar.gz
javac *.java

##################################################
# Build Bloom Filter
# 1. Apply PorterStemmer to Training Set (very slow commented)
# 2. Build Stemming statistics from Dataset (slow commented)
#    true positives
#    false positives
# 3. Sort stemmed words by majority (commented)
# 4. Compress the major 163000 stems to bloom.bin
#    Size = 61800 bytes
#    K    = 2
#    Error rate: 0.2333
##################################################
# ./ApplyPorterStemmer.js dataset.3.pos > dataset.3.pos.tmp
# ./ApplyPorterStemmer.js dataset.3.neg > dataset.3.neg.tmp
# java -Xmx4g -Xms4g BuildStemStats dataset.3.pos.tmp dataset.3.neg.tmp dataset.3.tmp
# cat dataset.3.tmp | sed -e 's/^#//g' | awk '{if ($3 > 50.0) print int($1 - $2), $4}' | sort -n | tac > dataset.3.pos.stem
./BuildBloom.py bloom.bin dataset.3.pos.stem 163000 61800 2

##################################################
# Build 3-Gram Filter
# 1. Build 3-Gram statistics from Dataset
# 2. Filter rear used 3-Grams (<2%)
##################################################

# java Distribution3Grams 200 ../dataset/dataset.3.pos ../dataset/dataset.3.neg > Distribution3Grams.dat
./Compress3Grams.py Distribution3Grams.dat 3-gram.bin 0.02

##################################################
# Compress JavaScripts
# 1. PorterStemmer.js
# 2. classifier.js
##################################################

yui-compressor PorterStemmer.js > PorterStemmer.js.min
yui-compressor classifier.js > classifier.js.min

##################################################
# Build extra data
# 1. Put classifier
# 2. Put 0 (separator)
# 3. Put Bloom filter (61800 bytes)
# 4. Put 3-Gram filter (26*26*26 bits = 2197 bytes)
# 5. Gzip
# 6. Advanced compression
##################################################

cat classifier.js.min > extra_data
echo -n -e '\x00' >> extra_data
cat bloom.bin >> extra_data
cat 3-gram.bin >> extra_data
gzip --best extra_data
advdef -4 -i 20 -z extra_data.gz

##################################################
# Build sources
##################################################
tar -cf src.tar *.py *.js *.java *.sh *.md
gzip src.tar

##################################################
# Remove intermediate files
# 1. Python byte code
# 2. Java byte code
# 2. Minified files
# 3. Binary files
##################################################
rm -f *.pyc
rm -f *.class
rm -f *.min
rm -f *.bin

##################################################
# Run sanity tests with different scripts
# 1. eval.coffee    https://gist.github.com/vird/453a86cf16903c017b060cdd457baf86
# 2. official.test  https://habrahabr.ru/company/hola/blog/282624/#comments
##################################################
./eval.coffee
./official.test

##################################################
# Isolate solution files
# 1. solution.js
# 2. extra_data.gz
# 3. src.tar.gz
##################################################
rm -rf ./solution/* 
cp solution.js ./solution/.
cp extra_data.gz ./solution/data.gz
cp src.tar.gz ./solution/.

##################################################
# Run solution on official test script https://github.com/hola/challenge_word_classifier/blob/master/tests/test.js
# 1. Start docker container with Node 6.0.0
# 2. Run on small number of testcases
##################################################
docker run -rm -v `pwd`:/test -t nodejs /root/.nvm/versions/node/v6.0.0/bin/node /test/test_script.js /test/solution /test/testcase

##################################################
# Evaluate classifier
# 1. Test on cross-validation set (5M words)
##################################################
./evaluate.js cv

