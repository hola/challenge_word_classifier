package com.dzhang;

import com.dzhang.filter.*;

import java.io.IOException;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Semaphore;

/**
 * Author:  dzhang
 * Date:    5/17/2016
 */
public class PlayGround {
    private static boolean printHeader = false;
    private BloomFilter[] filters;
    private static DateFormat df = new SimpleDateFormat("hh:mm:ss");

    public static void main(String[] args) throws Exception {
        List<BloomFilter> prefixFilters = new ArrayList<>();
        List<BloomFilter> suffixFilters = new ArrayList<>();
        List<BloomFilter> vowelFilters = new ArrayList<>();
        List<BloomFilter> constantFilters = new ArrayList<>();
        List<BloomFilter> lengthFilters = new ArrayList<>();
        List<BloomFilter> longFilters = new ArrayList<>();
        List<BloomFilter> regExFilters = new ArrayList<>();
        List<BloomFilter> miscRegExFilters = new ArrayList<>();

        List<String> dictionary = Utils.loadDictionary();
        List<Map<String, Boolean>> testData = Utils.loadTestData();

        BloomFilter filter;

//        filter = new PrefixFilter(410_000, 6);
//        dictionary.forEach(filter::add);
//        prefixFilters.add(filter);
//
//        filter = new SuffixFilter(100_000, 8);
//        dictionary.forEach(filter::add);
//        suffixFilters.add(filter);
//
//        filter = new LengthFilter(20_000, 4);
//        dictionary.forEach(filter::add);
//        lengthFilters.add(filter);
//
//        filter = new RegexFilter(6, 19);
//        dictionary.forEach(filter::add);
//        regExFilters.add(filter);

        for (int m = 380_000; m <= 380_000; m += 5_000) {
            for (int n = 6; n <= 6; n++) {
                filter = new PrefixFilter(m, n);
                dictionary.forEach(filter::add);
                prefixFilters.add(filter);
            }
        }

        for (int m = 130_000; m <= 130_000; m += 5_000) {
            for (int n = 8; n <= 8; n += 1) {
                filter = new SuffixFilter(m, n);
                dictionary.forEach(filter::add);
                suffixFilters.add(filter);
            }
        }

        for (int m = 1_000; m <= 1_000; m += 10_000) {
            for (int n = 3; n <= 3; n += 1) {
                filter = new VowelFilter(m, n);
                dictionary.forEach(filter::add);
                vowelFilters.add(filter);
            }
        }

        for (int m = 10_000; m <= 10_000; m += 1_000) {
            for (int n = 4; n <= 4; n += 1) {
                filter = new ConstantFilter(m, n);
                dictionary.forEach(filter::add);
                constantFilters.add(filter);
            }
        }

        for (int m = 20_000; m <= 20_000; m += 1_000) {
            for (int min = 4; min <= 4; min++) {
                filter = new LengthFilter(m, min);
                dictionary.forEach(filter::add);
                lengthFilters.add(filter);
            }
        }
        for (int m = 8_000; m <= 8_000; m += 1_000) {
            for (int min = 12; min <= 12; min++) {
                filter = new LongFilter(m, min);
                dictionary.forEach(filter::add);
                longFilters.add(filter);
            }
        }
        for (int m = 6; m <= 6; m++) {
            for (int n = 22; n <= 22; n++) {
                filter = new RegexFilter(m, n);
                regExFilters.add(filter);
            }
        }
        miscRegExFilters.add(new MiscRegexFilter());

        filter = new NoneFilter();
//        prefixFilters.add(filter);
//        suffixFilters.add(filter);
//        vowelFilters.add(filter);
//        constantFilters.add(filter);
//        lengthFilters.add(filter);
//        longFilters.add(filter);
//        regExFilters.add(filter);
//        miscRegExFilters.add(filter);

//        Semaphore semaphore = new Semaphore(1);
        Semaphore semaphore = new Semaphore(Runtime.getRuntime().availableProcessors());

        for (BloomFilter prefixFilter : prefixFilters) {
            for (BloomFilter suffixFilter : suffixFilters) {
                for (BloomFilter vowelFilter : vowelFilters) {
                    for (BloomFilter constantsFilter : constantFilters) {
                        for (BloomFilter lengthFilter : lengthFilters) {
                            for (BloomFilter longFilter : longFilters) {
                                for (BloomFilter regExFilter : regExFilters) {
                                    for (BloomFilter miscRegExFilter : miscRegExFilters) {
                                        while (!semaphore.tryAcquire()) {
                                        }
                                        new Thread(() -> {
                                            PlayGround play = new PlayGround(
                                                    prefixFilter
                                                    , suffixFilter
                                                    , vowelFilter
                                                    , constantsFilter
                                                    , lengthFilter
                                                    , longFilter
                                                    , regExFilter
                                                    , miscRegExFilter
                                            );
                                            try {
                                                play.test(testData);
                                            } catch (IOException x) {
                                                x.printStackTrace();
                                            }
                                            semaphore.release();
                                        }).start();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    private void test(List<Map<String, Boolean>> testData) throws IOException {
        int tt = 0;
        int tf = 0;
        int ft = 0;
        int ff = 0;
        for (Map<String, Boolean> map : testData) {
            for (String word : map.keySet()) {
                if (test(word)) {
                    if (map.get(word)) {
                        tt++;
                    } else {
                        ft++;
//                        System.out.println(word);
                    }
                } else {
                    if (map.get(word)) {
                        ff++;
//                        System.out.println(word);
                    } else {
                        tf++;
                    }
                }
            }
        }
        long size = Utils.export(Math.random() + "", filters);
        if (size < 65_000 &&  (tt + tf) * 100.0 / (tt + tf + ft + ff) > 78.9) {
            StringBuilder config = new StringBuilder();
            for (BloomFilter filter : filters) {
                config.append(filter);
            }
            System.out.printf("%d\t%2.5f%%\t%s%s\n", size, (tt + tf) * 100.0 / (tt + tf + ft + ff), df.format(new Date()), config);
        }
    }

    private boolean test(String word) {
        for (BloomFilter filter : filters) {
            if (!filter.check(word)) {
                return false;
            }
        }
        return true;
    }

    private PlayGround(BloomFilter... filters) {
        this.filters = filters;
        if (!printHeader) {
            printHeader = true;
            StringBuilder headers = new StringBuilder();
            for (BloomFilter filter : filters) {
                headers.append(filter.getHeader());
            }
            System.out.printf("size\taccuracy\ttime%s\n", headers);
        }
    }
}
