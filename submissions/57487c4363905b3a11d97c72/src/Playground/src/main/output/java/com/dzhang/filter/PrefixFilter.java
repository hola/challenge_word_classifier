package com.dzhang.filter;

/**
 * Author:  daniel
 * Date:    23/5/16
 */
public class PrefixFilter extends BloomFilter {
    private int prefix;
    public PrefixFilter(int m, int prefix) {
        super(m, 1);
        this.prefix = prefix;
    }

    @Override
    String process(String word) {
        return (word + "{{{{{{").substring(0, prefix);
    }
    @Override
    public String getHeader() {
        return "\tPrefix M\tPrefix";
    }

    public String toString(){
        return super.toString() + prefix;
    }
}
