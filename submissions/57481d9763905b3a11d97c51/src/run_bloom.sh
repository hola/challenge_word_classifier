#!/bin/bash

APP=bloom
RULE=0
FILE_D=../db/data.txt
FILE_RT=/tmp/result_true.txt
FILE_RF=/tmp/result_false.txt

if [[ $@ =~ .*all.* ]]; then
	FILE_T=../db/all_true.txt
	FILE_F=../db/all_false.txt
elif [[ $@ =~ .*short.* ]]; then
	FILE_T=../db/short_true.txt
	FILE_F=../db/short_false.txt
	FILE_D=../db/data_rule.txt
elif [[ $@ =~ .*rule.* ]]; then
	RULE=1
	FILE_T=../db/all_true_rule.txt
	FILE_F=../db/all_false_rule.txt
	FILE_D=../db/data_rule.txt
	TS=20737
	FS=712523
else
	FILE_T=../db/true.txt
	FILE_F=../db/false.txt
fi


cd ${APP} && make
echo


./${APP} -d_file ${FILE_D} -tr_files ${FILE_T} ${FILE_RT}
T=`cat ${FILE_RT} | grep ": \"true\"" | wc -l`
F=`cat ${FILE_RT} | grep ": \"false\"" | wc -l`
SUM=`cat ${FILE_T} | wc -l`

if [[ RULE -eq 1 ]]; then
	F=$((F + TS))
	SUM=$((SUM + TS))
fi

PT=$(echo "($T / $SUM) * 100" | bc -l)
echo "$SUM | ${T} / ${F} | ${PT}"


./${APP} -d_file ${FILE_D} -tr_files ${FILE_F} ${FILE_RF}
T=`cat ${FILE_RF} | grep ": \"true\"" | wc -l`
F=`cat ${FILE_RF} | grep ": \"false\"" | wc -l`
SUM=`cat ${FILE_F} | wc -l`

if [[ RULE -eq 1 ]]; then
	F=$((F + FS))
	SUM=$((SUM + FS))
fi

PF=$(echo "($F / $SUM) * 100" | bc -l)
echo "$SUM | ${T} / ${F} | ${PF}"

P=$(echo "($PT + $PF) / 2" | bc -l)
echo "TOTAL = ${P}"


if [[ $@ =~ .*split.* ]]; then
	# cat ${FILE_RT} | grep ": \"true\"" > /tmp/result_true_true.txt
	cat ${FILE_RT} | grep ": \"false\"" > /tmp/result_true_false.txt
	cat ${FILE_RF} | grep ": \"true\"" > /tmp/result_false_true.txt
	# cat ${FILE_RF} | grep ": \"false\"" > /tmp/result_false_false.txt
fi
