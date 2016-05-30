#!/bin/bash


cat ./db/az_str_10_rule.txt   | head -n 97  | cut -f 1 | grep -vE "^$" > /tmp/str.txt
cat ./db/az_first_10_rule.txt | head -n 107 | cut -f 1 | grep -E "[^'][a-z']" | grep -vE "^$" > /tmp/first.txt
cat ./db/az_last_10_rule.txt  | head -n 143 | cut -f 1 | grep -E "[a-z'][^']" | grep -vE "^$" > /tmp/last.txt


cd ./diff && make

# echo -en "    str:\n---------------------\n\""
# cat /tmp/str.txt | sed 's/$/" | grep -vE "/' | tr -s '\n' '"'
# echo
# echo "---------------------"

# echo -en "    first:\n---------------------\n\""
# ./diff.out /tmp/first.txt /tmp/str.txt | sed 's/$/" | grep -vE "/' | tr -s '\n' '^"'
# echo
# echo "---------------------"

# echo -en "    last:\n---------------------\n\""
# ./diff.out /tmp/last.txt /tmp/str.txt | sed 's/$/$" | grep -vE "/' | tr -s '\n' '"'
# echo
# echo "---------------------"


echo -en "    str:\n---------------------\n\""
cat /tmp/str.txt | sed 's/$/", "/' | tr -s '\n' '"'
echo
echo "---------------------"

echo -en "    first:\n---------------------\n\""
./diff.out /tmp/first.txt /tmp/str.txt | sed 's/$/", "/' | tr -s '\n' '"'
echo
echo "---------------------"

echo -en "    last:\n---------------------\n\""
./diff.out /tmp/last.txt /tmp/str.txt | sed 's/$/", "/' | tr -s '\n' '"'
echo
echo "---------------------"
