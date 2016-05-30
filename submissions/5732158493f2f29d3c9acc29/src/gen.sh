node genhash.js $1 hashes
gzip -fk9 hashes
rm hashes
echo Resulting file size: $(wc -c <hashes.gz) bytes