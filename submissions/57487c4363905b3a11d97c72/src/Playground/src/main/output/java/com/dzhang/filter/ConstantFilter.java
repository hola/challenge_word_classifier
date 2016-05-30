package com.dzhang.filter;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Author:  daniel
 * Date:    23/5/16
 */
public class ConstantFilter extends BloomFilter {
    private Pattern pattern;
    private int constant;
    public ConstantFilter(int m, int constant) {
        super(m, 1);
        this.constant = constant;
        pattern = Pattern.compile("[bcdfghjklmnpqrstvwxz]{" + constant + ",}");
    }


    @Override
    String process(String word) {
        Matcher matcher = pattern.matcher(word);
        if (matcher.find()) {
            return word.substring(matcher.start(), matcher.end());
        }
        return "";
    }
    @Override
    public String getHeader() {
        return "\tConstant M\tConstant N";
    }

    public String toString(){
        return "\t" + M + "\t" + constant;
    }
}
