#!/bin/sh

minify () {
  curl -s \
    -d compilation_level=ADVANCED_OPTIMIZATIONS \
    -d output_format=text \
    -d output_info=compiled_code \
    --data-urlencode "js_code@${1}" \
    http://closure-compiler.appspot.com/compile \
    > "${2}"
}

# minify $1
minify $1 $2

#minify PorterStemmer1980
