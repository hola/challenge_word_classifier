package com.dzhang.filter;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Author:  daniel
 * Date:    23/5/16
 */
public class VowelFilter extends BloomFilter {
    private int vowel;
    private Pattern pattern;
    public VowelFilter(int m, int vowel) {
        super(m, 1);
        this.vowel = vowel;
        pattern = Pattern.compile("[aeuio]{" + vowel + ",}");
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
        return "\tVowel M\tVowel N";
    }

    public String toString(){
        return super.toString() + vowel;
    }
}
