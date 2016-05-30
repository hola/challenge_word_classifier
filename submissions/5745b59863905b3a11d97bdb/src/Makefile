
all:	gram

test:
	./test.js

run: gram
	./gram

sort: gram
	./gram | sort -k2n

version:
	@node --version

gram: gram.c

compress:
	ls -l data.json.gz data.json
	gzip -9 <data.json >data.json.gz
	ls -l data.json.gz

holatest:
	node hola/test.js hola/solution hola/testcase

zip:
	zip mike README.md gram.c Makefile
