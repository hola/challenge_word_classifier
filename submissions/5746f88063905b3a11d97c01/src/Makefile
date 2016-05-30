all: solution.js data.gz test1
	du -b --total solution.js data.gz

data.gz: QQ.js buf2.bin stop3.bin  breadth.bin
	cat QQ.js buf2.bin stop3.bin breadth.bin | gzip -9n > data.gz

stop3.bin: genstop3.pl result3.txt
	perl genstop3.pl stop3.bin < result3.txt

test1: solution.js data.gz run1.js
	nodejs run1.js || true

realtest: solution.js data.gz test.js
	nodejs test.js

offtest: solution.js data.gz offtest.js
	nodejs offtest.js . ./small

submission: data.gz solution.js
	mkdir -p ../submission
	cp data.gz solution.js ../submission/
	tar cvzf ../submission/word-classifier-source.tar.gz -C .. word-classifier --exclude='*.txt' --exclude='*~' --exclude='offtest.js' --exclude='dump/*.json'
