node make_stat.js --limit=1 --diff --output=data1 --false_positives=1.3 words1.txt false-positives.txt
node make_stat.js --limit=1 --output=data2 words2.txt 
node pack.js data1 data2 data

