package com.dzhang.filter;

/**
 * Author:  daniel
 * Date:    23/5/16
 */
public class LongFilter extends BloomFilter {
    private int size;
    public LongFilter(int m, int size) {
        super(m, 1);
        this.size = size;
    }

    @Override
    String process(String word) {

        if(word.length() >= size){
            return word.substring(size);
        }else {
            return "";
        }
    }
    @Override
    public String getHeader() {
        return "\tLong M\tLong K\tLong Size";
    }

    public String toString(){
        return super.toString() + size;
    }
}
