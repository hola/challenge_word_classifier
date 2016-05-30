#!/usr/bin/env sh

rm -f data.gz
java -jar compiler.jar --js_output_file=inner.min.js inner.js
perl -e "print pack('l',`stat -c %s inner.min.js`)" > size.bin
nodejs create.js
cat size.bin inner.min.js data_orig > data
gzip -9 data
du -bc data.gz solution.js
