node "node_modules\uglify-js\bin\uglifyjs" -c -mt --mangle-props -o solution.inner.js solution.middle.js

REM powershell -Command "(gc solution.js) -replace 'exports.a=function', 'exports.init=function' | Out-File -encoding ASCII solution.js"

timeout 1

copy data /b + solution.inner.js /b data2

"D:\Program Files (x86)\GnuWin32\bin\gzip.exe" -c -f -k -9 data2 > data.gz