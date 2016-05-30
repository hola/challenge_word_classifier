#/bin/sh

FROM=${1:-1}
TO=${2:-10};

for i in `seq ${FROM} ${TO}`;
do
	url='https://hola.org/challenges/word_classifier/testcase/'$i;
	`wget ${url} -O $i.tf`
	`cat ${i}.tf | grep ": true," | cut -d '"' -f2 >> all_true.txt`
	`cat ${i}.tf | grep ": false," | cut -d '"' -f2 >> all_false_txt`
	`rm ${i}.tf`
done
