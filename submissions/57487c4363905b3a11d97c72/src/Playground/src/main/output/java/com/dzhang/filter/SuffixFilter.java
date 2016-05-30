package com.dzhang.filter;

/**
 * Author:  dzhang
 * Date:    5/24/2016
 */
public class SuffixFilter extends BloomFilter {
    private int suffix;

    public SuffixFilter(int m, int suffix) {
        super(m, 1);
        this.suffix = suffix;
    }

    @Override
    String process(String word) {
        return new StringBuilder((word + "{{{{{{{{").substring(suffix)).reverse().toString();
    }

    @Override
    public String getHeader() {
        return "\tSuffix M\tSuffix";
    }

    public String toString() {
        return super.toString() + suffix;
    }
}
