FILE_D=../db/data.txt
FILE_B=data.bin
APP=bloom

MAX_PF=0
SIZE_MAX=65208
FS_S=65536
DIFF_S=9999

cd ${APP} && make
echo



for FS in `seq 74000 25 85000`;
do
	./${APP} -filter_size ${FS} -d_file ${FILE_D} -b_file ${FILE_B}
	cat data.bin | gzip --best > data.gz
	SIZE=`wc data.gz -c | cut -d " " -f1`

	DIFF=$((SIZE_MAX - SIZE))

	if [[ $DIFF -ge 0 ]]; then
		if [[ $DIFF -lt $DIFF_S ]]; then
			DIFF_S=$DIFF
			FS_S=${FS}
		fi
	fi

	echo "size = ${SIZE}, diff = ${DIFF_S}, fs = ${FS_S}"
done;