package com.dzhang.filter;

/**
 * Author:  daniel
 * Date:    23/5/16
 */
public class LengthFilter extends BloomFilter {
    private int length;
    public LengthFilter(int m, int length) {
        super(m, 1);
        this.length = length;
    }

    @Override
    String process(String word) {

        if(length < word.length()){
            return "";
        }else {
            return word;
        }
    }
    @Override
    public String getHeader() {
        return "\tLength M\tLength";
    }

    public String toString(){
        return super.toString() + length;
    }
}
