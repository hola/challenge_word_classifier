#!/bin/bash

FILEOUT=./db/az_last_10_rule.txt
MIN=${1:-10}
chars="abcdefghijklmnopqrstuvwxyz'"
n=27

echo save to ${FILEOUT}
echo '' > ${FILEOUT}

for ((i=0; i<n; i++))
do
	for ((j=0; j<n; j++))
	do
		# for ((k=0; k<n; k++))
		# do
			echo ${chars:i:1}${chars:j:1}
			T=`cat ./db/all_true_rule.txt  | grep -E "${chars:i:1}${chars:j:1}$" | wc -l`
			F=`cat ./db/all_false_rule.txt | grep -E "${chars:i:1}${chars:j:1}$" | wc -l`

			PT=$(echo "($T / ($T + $F + 1))  * 100" | bc -l)

			if [[ $(echo "if ( ($F > 0) && (${PT} < ${MIN}) ) 1 else 0" | bc) -eq 1 ]]; then
				echo -e "${chars:i:1}${chars:j:1}\t${PT}\t${T}\t${F}" >> ${FILEOUT}
			fi
		# done
	done
done

cat ${FILEOUT} | sed -r 's/\t\./\t0,/g' | sed -r 's/\./,/g' | sort -n -k 2 > /tmp/3
cp /tmp/3 ${FILEOUT}


echo
cat ${FILEOUT} | cut -f 1 | tr -s '\t\r\n' ','
echo

# cat file_az10_rule.txt | head -n 15 | cut -f 1 | tr -s '\r\n' ','
# cat ./file_first_az10_rule.txt | head -n 67 | cut -f 1 | tr -s '\r\n' ','
# cat ./file_last_az10_rule.txt | head -n 87 | cut -f 1 | grep -E "[a-z']{1}[^']" | tr -s '\r\n' ','