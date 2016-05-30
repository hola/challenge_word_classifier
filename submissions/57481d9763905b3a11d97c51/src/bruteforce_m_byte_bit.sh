#!/bin/bash

FILE_D=../db/data.txt
FILE_T=../db/all_true.txt
FILE_F=../db/all_false.txt
FILE_R=/tmp/result.txt
APP=bloom

cd ${APP} && make
echo


FROM=${1:-1}
TO=${2:-2}

BYTE=0
BIT=0
MAX_PF=0
BYTE_F=${BYTE}
BIT_F=${BIT}


for BYTE in `seq ${FROM} ${TO}`;
do
	BIT=${FROM}

	for BIT in `seq ${FROM} ${TO}`;
	do
		echo " ${BYTE}:${BIT}"

		./${APP} -m_byte ${BYTE} -m_bit ${BIT} -d_file ${FILE_D} -tr_files ${FILE_T} ${FILE_R}
		T=`cat ${FILE_R} | grep ": \"true\"" | wc -l`
		F=`cat ${FILE_R} | grep ": \"false\"" | wc -l`
		PT=$(echo "($T / ($T + $F + 1))  * 100" | bc -l)
		echo "${T} | ${F} | ${PT}"

		./${APP} -m_byte ${BYTE} -m_bit ${BIT} -d_file ${FILE_D} -tr_files ${FILE_F} ${FILE_R}
		T=`cat ${FILE_R} | grep ": \"true\"" | wc -l`
		F=`cat ${FILE_R} | grep ": \"false\"" | wc -l`
		PF=$(echo "($F / ($T + $F + 1))  * 100" | bc -l)
		echo "${T} | ${F} | ${PF}"

		P=$(echo "($PT + $PF) / 2" | bc -l)
		echo "TOTAL = ${P}"

		if [[ $(echo "if (${P} > ${MAX_PF}) 1 else 0" | bc) -eq 1 ]]; then
			MAX_PF=${P}
			BYTE_F=${BYTE}
			BIT_F=${BIT}
		fi
	done

	echo
	echo "  max F = ${MAX_PF} | BYTE = ${BYTE_F} | BIT = ${BIT_F}"
done

echo "  TOTAL: max F = ${MAX_PF} | BYTE = ${BYTE_F} | BIT = ${BIT_F}"