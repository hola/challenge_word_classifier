#!/bin/bash

outjson=ann_cpp/words.lst.json
outlist=ann_cpp/words.lst

i=0
while let i++; [ $i -lt 1000000 ]; do
    curl -s https://hola.org/challenges/word_classifier/testcase/$i >> $outjson
    sleep .1
done

# convert json to list  (compatible with ann_cpp)
sed -rn '/.+/ s/^[[:space:]]*//; s/"//g; s/: ((true)|(false)),/ \1/p;' $outjson > $outlist

