call nodejs gzip.js %1

if 1%1 == 1 goto :eof

copy %1.gz solution\data.gz