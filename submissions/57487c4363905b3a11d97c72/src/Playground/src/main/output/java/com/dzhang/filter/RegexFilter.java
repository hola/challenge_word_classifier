package com.dzhang.filter;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Author:  daniel
 * Date:    25/5/16
 */
public class RegexFilter extends BloomFilter {
    private Pattern pattern1;
    private Pattern pattern2;
    private int constantLength, maxLength;

    public RegexFilter(int constantLength, int maxLength) {
        super(8, 1);
        this.constantLength = constantLength;
        this.maxLength = maxLength;
        pattern1 = Pattern.compile("[bcdfghjklmnpqrstvwxz]{" + constantLength + ",}");
        pattern2 = Pattern.compile("^.{" + maxLength + ",}$");
    }

    @Override
    String process(String word) {
        return null;
    }

    @Override
    public String getHeader() {
        return "\tConstantLength\tMaxLength";
    }

    public void add(String word) {}

    public boolean check(String word) {
        return !pattern1.matcher(word).find() && !pattern2.matcher(word).find();
    }

    @Override
    public List<Byte> export(){
        return new ArrayList<>();
    }
    @Override
    public String toString() {
        return "\t" + constantLength + "\t" + maxLength;
    }
}
