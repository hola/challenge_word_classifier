#!/bin/bash

WORDS_CNT=${1:-};
echo "true.txt => data.txt"
cd gist_sort && make && ./gist.out ../db/true.txt ../db/data.txt ${WORDS_CNT}