
all: data.gz solution.js
	perl -e 'exit (42) if (-s "data.gz") + (-s "solution.js") > 65535;'
	ls -la data.gz solution.js

words.txt:
	cp ../words.txt words.txt \
	|| wget -O words.txt 'https://cdn.rawgit.com/hola/challenge_word_classifier/1945d565fd929118c88fbceadfe4818d138e3b5f/words.txt'

uniqwords.txt: words.txt words2lcuniq.pl
	perl words2lcuniq.pl < words.txt  > uniqwords.txt

prefixes.txt: uniqwords.txt genprefixes.pl
	perl genprefixes.pl 5 < uniqwords.txt \
	| head -n 83700 \
	| sort > prefixes.txt

dataf1: uniqwords.txt genf1.pl
	perl genf1.pl < uniqwords.txt > dataf1

datapft: prefixes.txt gentree.pl
	perl gentree.pl 5 < prefixes.txt > datapft

datastar:
	printf "*" > datastar

data: dataf1 datapft datastar
	cat dataf1 datastar datapft > data

data.gz: data
	gzip -f -k -9 data

solution.js: src.js
	curl -s \
		-d compilation_level=SIMPLE_OPTIMIZATIONS \
		-d output_format=text \
		-d output_info=compiled_code \
		-d charset=utf-8 \
		--data-urlencode "js_code@-" \
		http://closure-compiler.appspot.com/compile \
		< src.js > solution.js

run: solution.js
	../node --expose-gc ../holatry.js ./ ../testcases1

tarball:
	rm -rf zzz1.tar.gz zzz1/
	mkdir zzz1
	cp README.md Makefile src.js *.pl zzz1/
	tar -cvvzf zzz1.tar.gz zzz1/
	rm -rf zzz1/

clean:
	rm -f words.txt
	rm -f uniqwords.txt
	rm -f prefixes.txt
	rm -f data dataf1 datapft datastar
	rm -f data.gz
	rm -f solution.js

