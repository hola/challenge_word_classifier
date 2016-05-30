#!/bin/bash

echo "all_false.txt => false.txt"
cat ./db/all_false.txt | tr A-Z a-z | sort | uniq > ./db/false.txt
echo "words.txt => true.txt"
cat ./db/words.txt | grep -v ^[a-z]$ | tr A-Z a-z | sort | uniq > ./db/true.txt