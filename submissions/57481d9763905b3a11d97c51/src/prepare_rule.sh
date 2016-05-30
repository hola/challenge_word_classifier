#!/bin/bash

# 96 / 103284 | .09294760079005460600
# grep -vE "[a-z]+'s[a-z]+"

# 457 / 108326 | .42187471151893358900
# grep -vE "'[a-z]+'"

# 20345 / 635898 | 3.19941248439215094200
# grep -vE "[^aeiouy]{6,}"

# 2208 / 579148 | .38124969783198767800


cat ./db/all_true.txt   | grep -vE "[a-z]+'s[a-z]+" | grep -vE "'[a-z]+'" | grep -vE "[^aeiouy]{5,}" > ./db/all_true_rule.txt
cat ./db/all_false.txt  | grep -vE "[a-z]+'s[a-z]+" | grep -vE "'[a-z]+'" | grep -vE "[^aeiouy]{5,}" > ./db/all_false_rule.txt
cat ./db/data.txt       | grep -vE "[a-z]+'s[a-z]+" | grep -vE "'[a-z]+'" | grep -vE "[^aeiouy]{5,}" > ./db/data_rule.txt

T1=`cat ./db/all_true.txt | wc -l`
T2=`cat ./db/all_true_rule.txt | wc -l`
TT=$((T1 - T2))

F1=`cat ./db/all_false.txt | wc -l`
F2=`cat ./db/all_false_rule.txt | wc -l`
FF=$((F1 - F2))

T=$(echo "($TT / $FF) * 100" | bc -l)
echo "${TT} / ${FF} | ${T}"