FILE_D=../db/data_rule.txt
FILE_T=../db/all_true_rule.txt
FILE_F=../db/all_false_rule.txt
FILE_R=/tmp/result.txt
FILE_B=data.bin
APP=bloom

MAX_PF=0
SIZE_MAX=65208
FS_S=65536
DIFF_S=9999

cd ${APP} && make
echo

for FS in `seq 74370 1 85000`;
do
	./${APP} -filter_size ${FS} -d_file ${FILE_D} -b_file ${FILE_B}
	cat data.bin | gzip --best > data.gz
	SIZE=`wc data.gz -c | cut -d " " -f1`

	DIFF=$((SIZE_MAX - SIZE))

	if [[ $DIFF -lt 0 ]]; then
		echo "continue"
		continue
	fi

	./${APP} -filter_size ${FS} -d_file ${FILE_D} -tr_files ${FILE_T} ${FILE_R}
	T=`cat ${FILE_R} | grep ": \"true\"" | wc -l`
	F=`cat ${FILE_R} | grep ": \"false\"" | wc -l`
	PT=$(echo "($T / ($T + $F + 1))  * 100" | bc -l)
	echo "${T} | ${F} | ${PT}"

	./${APP} -filter_size ${FS} -d_file ${FILE_D} -tr_files ${FILE_F} ${FILE_R}
	T=`cat ${FILE_R} | grep ": \"true\"" | wc -l`
	F=`cat ${FILE_R} | grep ": \"false\"" | wc -l`
	PF=$(echo "($F / ($T + $F + 1))  * 100" | bc -l)
	echo "${T} | ${F} | ${PF}"

	P=$(echo "($PT + $PF) / 2" | bc -l)
	echo "TOTAL = ${P}"

	if [[ $(echo "if (${P} > ${MAX_PF}) 1 else 0" | bc) -eq 1 ]]; then
		MAX_PF=${P}
		echo "[!] new max = ${P}"

		if [[ $DIFF -lt $DIFF_S ]]; then
			DIFF_S=$DIFF
			FS_S=${FS}
		fi
	fi

	echo "	size = ${SIZE}, diff = ${DIFF_S}, fs = ${FS_S}, p = ${MAX_PF}"
	echo
done;