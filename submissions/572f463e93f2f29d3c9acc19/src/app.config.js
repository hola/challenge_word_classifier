exports.bloomFilterConfig = {
    N: 662003,
    P: 0.01,
    // SIZE: 6500000, //calculated by http://hur.st/bloomfilter?n=662003&p=0.01
    // k: 7,
    SIZE: 62*1000*8,
    K: 1,
    INITIAL_SEED: 11,
};

exports.appConfig = {
    INT_SIZE: 4,
    WORDS_INPUT: './db/words.txt',
    DB_FILE_PATH: './db/bloom.db',
};
