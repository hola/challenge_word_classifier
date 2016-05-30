package com.dzhang.filter;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Author:  dzhang
 * Date:    5/17/2016
 */
public abstract class BloomFilter {
    // width of bitmap
    int M;
    private int K;

    // bitMaps of bloom filter
    private boolean[] bitMap;
    private int[] bitCount;

    private Set<String> set;

    private int count, ft;
    private double ftRate;


    public BloomFilter(int m, int k) {
        M = m / 8 * 8;
        K = k;
        bitMap = new boolean[M];
        bitCount = new int[M];
        set = new HashSet<>();
    }

    public void add(String word) {
        word = process(word);
        set.add(word);
        for (int k = 0; k < K; k++) {
            bitMap[hash(word)] = true;
            bitCount[hash(word)]++;
            word = "'" + word;
        }
    }

    private int hash(String word) {
        long hash = -5;
        for (int i = 0; i < word.length(); i++) {
            hash = hash * 97 % M + word.charAt(i);
            switch (word.charAt(i)) {
                case '\'':
                    hash += 28;
                    break;
                case '{':
                    hash += 27;
                    break;
                default:
                    hash += word.charAt(i) - 96;
                    break;
            }
        }
        return (int) (Math.abs(hash) % M);
    }

    public boolean check(String word) {
        count++;
        word = process(word);
        for (int k = 0; k < K; k++) {
            int hash = hash(word);
            if (!bitMap[hash]) {
                return false;
            }
            word = "'" + word;
        }
        if (!set.contains(word.substring(1))) {
            ft++;
            ftRate = (ft + 0.0) / count;
        }
        return true;
    }

    public List<Byte> export() {
        List<Byte> bytes = new ArrayList<>();
        for (int b = 0; b < M; b += 8) {
            Integer value = 0;
            for (int i = 0; i < 8; i++) {
                if (bitMap[b + i]) {
                    value |= (1 << i);
                }
            }
            bytes.add(value.byteValue());
        }
        return bytes;
    }

    abstract String process(String word);

    abstract public String getHeader();

    @Override
    public String toString(){
        return String.format("\t%d\t", M);
    }
}
