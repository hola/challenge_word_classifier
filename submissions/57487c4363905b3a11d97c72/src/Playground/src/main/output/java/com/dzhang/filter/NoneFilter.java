package com.dzhang.filter;

/**
 * Author:  daniel
 * Date:    25/5/16
 */
public class NoneFilter extends BloomFilter {
    public NoneFilter() {
        super(8, 1);
    }

    @Override
    String process(String word) {
        return null;
    }

    @Override
    public String getHeader() {
        return "\tnull\tnull";
    }

    public void add(String word) {}

    public boolean check(String word) {
        return true;
    }

    @Override
    public String toString(){
        return "\t\t";
    }
}
