package com.dzhang.filter;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Author:  daniel
 * Date:    25/5/16
 */
public class MiscRegexFilter extends BloomFilter {
    Pattern pattern;

    public MiscRegexFilter() {
        super(8, 1);
        pattern = Pattern.compile("'[sdt]$");
    }

    @Override
    String process(String word) {
        return null;
    }

    @Override
    public String getHeader() {
        return "\tSReg\tSnull";
    }

    public void add(String word) {
    }

    public boolean check(String word) {
//        int count = 0;
//        if (word.contains("q")) {
//            count++;
//        }
//        if (word.contains("j")) {
//            count++;
//        }
//        if (word.contains("x")) {
//            count++;
//        }
//        if (word.contains("z")) {
//            count++;
//        }
//        if (count > 1) {
//            return false;
//        }
//        if(word.length() - word.replaceAll("[qjxz]", "").length() > 4){
//            return false;
//        }


        return !word.contains("'") || pattern.matcher(word).find();
    }

    @Override
    public List<Byte> export(){
        return new ArrayList<>();
    }

    @Override
    public String toString() {
        return "\tYes\tYes";
    }
}
