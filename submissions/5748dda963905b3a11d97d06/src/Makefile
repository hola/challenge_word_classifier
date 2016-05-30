data.gz: Makefile solution.src.js gen.js words.js
	@docker run -it --rm -v "`pwd`":/code minty/uglifyjs --compress --mangle --screw-ie8 -d -o solution.min.js -- solution.src.js
	@docker run -it --rm -v "`pwd`":/code/ -w /code --entrypoint node minty/uglifyjs gen.js
	@advdef -z -4 data.gz >/dev/null
	@echo -n "Total size: "
	@echo `stat -c%s data.gz` + `stat -c%s solution.js` | bc
	

