#!/bin/bash

FILE_D=../db/data.txt

make && ./bloom -d_file ${FILE_D} -b_file data.bin
cat data.bin | gzip --best > data.gz
wc data.gz -c