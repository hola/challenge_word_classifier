#!/bin/bash

FILE_D=../db/data_rule.txt
FILE_T=../db/short_true.txt
FILE_F=../db/short_false.txt
FILE_R=/tmp/result.txt

cd bloom && make
echo

./bloom -d_file ${FILE_D} -tr_files ${FILE_T} ${FILE_R} -b_file data.bin -show_options
cat data.bin | gzip --best > data.gz
DB=`wc data.gz -c | cut -d " " -f1`
echo "DB = ${DB}"

cp data.gz ../node_js && cd ../node_js
nodejs compress.js
JS=`wc project.min.js -c | cut -d " " -f1`
echo "JS = ${JS}"

echo -n "TOTAL: "
echo $((DB + JS))
echo

nodejs api.js ${FILE_T} > ${FILE_R}
T=`cat ${FILE_R} | grep ": \"true\"" | wc -l`
F=`cat ${FILE_R} | grep ": \"false\"" | wc -l`
SUM=`cat ${FILE_T} | wc -l`
PT=$(echo "($T / $SUM)  * 100" | bc -l)
echo "$SUM | ${T} / ${F} | ${PT}"

nodejs api.js ${FILE_F} > ${FILE_R}
T=`cat ${FILE_R} | grep ": \"true\"" | wc -l`
F=`cat ${FILE_R} | grep ": \"false\"" | wc -l`
SUM=`cat ${FILE_F} | wc -l`
PF=$(echo "($F / $SUM)  * 100" | bc -l)
echo "$SUM | ${T} / ${F} | ${PF}"

P=$(echo "($PT + $PF) / 2" | bc -l)
echo "TOTAL = ${P}"