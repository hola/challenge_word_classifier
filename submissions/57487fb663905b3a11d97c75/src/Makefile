buckets: classifier_bloom.js main.js
	node main.js learn
classifier_bloom_release.js: classifier_bloom.js
	./make-release.awk metadata $< > temp.js
	./node_modules/.bin/babel --presets es2015 -o temp2.js temp.js
	closure-compiler --js_output_file=$@ --language_in ES5 temp2.js
	rm temp.js temp2.js
	wc buckets $@
learn: buckets
test:
	node main.js test bloom
test-release: classifier_bloom_release.js
	node main.js test bloom_release
.PHONY: learn test test-release
