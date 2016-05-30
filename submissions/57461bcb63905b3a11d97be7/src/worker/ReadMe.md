# run.sh
To download one random test block to folder "test_data".
Usage:
for i in {1..10000}; do echo $i && ./run.sh; done

# readtest.js
To read all test bloks from folder "test_data" to stdout in compact format.
Usage:
node readtest.js > all_test.txt

# test_filter_async.js
To select and remove suffixes and prefixes in words.
Needed files:
"all_test_1M.txt".
"all_test_20M.txt".
"words.txt".

# seed_async.js
To produce the selection parameters for hash-function for the Bloom filter.
Needed files:
"all_test_1M.txt".
"words.txt".

# run.js
To save data for solution.js. Fast test runner.
Needed files:
"all_test_20M.txt".
"solution.js".
"words.txt".
