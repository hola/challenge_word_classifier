package com.vx.dict;

import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.BitSet;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

import com.vx.dict.BloomFilter.CalcHash;
import com.vx.dict.mdag.MDAG;
import com.vx.dict.mdag.SimpleMDAGNode;

public class App {

    private static int wordLen;
    private static int minBlockChars;

    /*private static final int[] SHORT_SEEDS = new int[] {
            -1430844317, -876423888, 614549238, 1631079386, 1961457075,
            1100702623, -696235491, 207768464, 1416686734, -647039821, 1070874437
    };*/

    // 123123123, 555555555, 1231231232, 964588
    /*private static final int[] MEDIUM_SEEDS = new int[] {
            1379144620, 768044016, 545986582, -2039139031, 600493748, 1261249699,
            -820713184, 1852484732, -1099025190, -1460463607, 1525343010, -635974151
    };*/

    static {
        BloomFilter.calcHash = new CalcHash() {
            @Override
            public int[] createHashes(byte[] data, int hashes) {
                int[] result = new int[hashes];
                for (int i = 0; i < hashes; i++) {
                    int h;

                    //if (i == 1)
                        h = FNV1a.hash32(data);

                    //else {
                        /*int idx = i; // > 1 ? i - 1 : i;
                        int[] seeds;
                        if (BIT_SIZE < 16) seeds = SHORT_SEEDS;
                        else seeds = MEDIUM_SEEDS;
                        int seed = idx < seeds.length ? seeds[idx] : i;*/

                        //int seed = i == 0 ? HASH_SEED : result[i - 1];
                        //h = MurmurHash3.murmurhash3_x86_32(data, 0, data.length, seed);
                    //}
                    result[i] = reduceHashToXX(h);
                }
                return result;
            }

            @Override
            public int adjustToBitSetSize(int hash, int bitSetSize) {
                return hash; // already adjusted by reduceHashToXX()
            }};
    }

    public static void main(String[] args) throws IOException {
        logLn("Dictionary builder");
        if (args.length < 3) {
            logLn("Usage: MODE inputFile outputFile");
            logLn("MODE possible values: distinct, mdag, stat, subdict, prefix,");
            logLn("rootcounts, suffix, hash, release, generate, intersect");
            return;
        }
        String s = args[0];
        if ("distinct".equalsIgnoreCase(s)) buildDistinctDict(args);
        else if ("mdag".equalsIgnoreCase(s)) buildMDAG(args);
        else if ("stat".equalsIgnoreCase(s)) buildStatistics(args);
        else if ("subdict".equalsIgnoreCase(s)) buildSubDictionary(args);
        else if ("prefix".equalsIgnoreCase(s)) buildPrefixDict(args);
        else if ("rootcounts".equalsIgnoreCase(s)) buildRootCounts(args);
        else if ("rootsuffix".equalsIgnoreCase(s)) buildRootPrefixesOrSuffixes(false, args);
        else if ("rootprefix".equalsIgnoreCase(s)) buildRootPrefixesOrSuffixes(true, args);
        else if ("rootsearch".equalsIgnoreCase(s)) searchRootWithPrefixSuffix(args);
        else if ("hash".equalsIgnoreCase(s)) processHash(args);
        else if ("release".equalsIgnoreCase(s)) processRelease(args);
        else if ("generate".equalsIgnoreCase(s)) generate(args);
        else if ("intersect".equalsIgnoreCase(s)) intersect(args);
        else {
            logLn("MODE is unknown: " + s);
        }
    }

    private static List<String> loadFileAndSort(String fn) throws IOException {
        return loadFile(fn, true/*doSort*/);
    }

    private static List<String> loadFile(String fn, boolean doSort) throws IOException {
        List<String> strLst = new ArrayList<>();
        Files.lines(Paths.get(fn), StandardCharsets.UTF_8).forEach(strLst::add);
        if (doSort) Collections.sort(strLst);
        logLn(fn + " loaded: " + strLst.size() + " lines.");
        return strLst;
    }

    private static final Set<Character> VOWELS = new HashSet<Character>() {{
        addAll(Arrays.asList('a', 'e', 'i', 'o', 'u'));
    }};

    private static final Set<Character> CONSONANTS = new HashSet<Character>() {{
        addAll(Arrays.asList('b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n',
                             'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'));
    }};

    /*private static final Set<Character> ALPHABET = new HashSet<Character>() {{
        addAll(VOWELS);
        addAll(CONSONANTS);
    }};*/

    private static final Set<Character> ALPHABET = new HashSet<Character>() {{
        addAll(Arrays.asList('a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
                             'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'));
    }};

    private static String getConsonants(String s, int fromPos, int length) {
        if (s == null || s.length() < length || fromPos >= s.length()) return null;
        String rslt = "";
        Character prev = null;
        for (int i = fromPos; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (!CONSONANTS.contains(ch)) continue;
            if (prev != null && prev.equals(ch)) continue;
            rslt += ch;
            if (rslt.length() == length) return rslt;
            prev = ch;
        }
        return null;
    }

    private static void intersect(String[] args) throws IOException {
        if (args.length < 4) {
            logLn("Usage: intersect inputFile1 inputFile2 outputFile doMinus");
            return;
        }
        String in1Fn = args[1];
        String in2Fn = args[2];
        String outFn = args[3];
        boolean doMinus = args.length >= 5 ? Boolean.parseBoolean(args[4]) : false;

        List<String> input1 = loadFile(in1Fn, false/*doSort*/);
        List<String> input2 = loadFile(in2Fn, false/*doSort*/);
        Set<String> input2Set = new HashSet<>();
        input2Set.addAll(input2);

        List<String> rslt = new ArrayList<>(input1.size());
        if (!doMinus) {
            for (String s : input1) {
                if (input2Set.contains(s)) rslt.add(s);
            }
            logLn("Intersect rows: " + rslt.size());
        } else {
            Set<String> lst = new TreeSet<>();
            for (String s : input1) {
                if (!input2Set.contains(s)) rslt.add(s);
                else {
                    lst.add(s);
                }
            }
            logLn("Minus rows: " + rslt.size() + "; Contains true: " + lst.size());
            //for (String s : lst) logLn(s);
        }
        Files.write(Paths.get(outFn), rslt);
    }

    private static void generate(String[] args) throws IOException {
        if (args.length < 3) {
            logLn("Usage: generate inputFile outputFile");
            return;
        }
        String inFn = args[1];
        String outFn = args[2];
        //boolean isInputValid = args.length > 3 ? Boolean.parseBoolean(args[3]) : false;

        List<String> input = loadFile(inFn, false/*doSort*/);
        Set<String> inputSet = new HashSet<>();
        inputSet.addAll(input);

        Set<String> valid = new TreeSet<>();
        for (Character ch0 : ALPHABET) {
            for (Character ch1 : ALPHABET) {
                //for (Character ch2 : ALPHABET) {
                    //for (Character ch3 : ALPHABET) {
                        //for (Character ch4 : ALPHABET) {
                            String s = new String(new char[] { ch0, ch1 });
                            valid.add(s);
                        //}
                    //}
                //}
            }
        }
        /*List<String> validReverse = new ArrayList<>(valid.size());
        for (String s : valid) {
            validReverse.add(0, s);
        }*/

        BitSet rslt = new BitSet(valid.size());
        int i = 0;
        int j = 0;
        for (String s : valid) {
            boolean v = inputSet.contains(s);
            rslt.set(i, v);
            i++;
            if (v) j++;
        }
        logLn("Generate done, total bits: " + j);
        Files.write(Paths.get(outFn), rslt.toByteArray());
    }

    private static class DoubleStat {
        String doubleDouble;
        String beforeDouble;
        String doubleAfter;
        String preBeforeDouble;
        String doublePostAfter;
    }

    private static DoubleStat doubleStat(String s) {
        DoubleStat rslt = new DoubleStat();
        if (s == null || s.isEmpty()) return rslt;
        String dd = "";
        char prev = s.charAt(0);
        for (int i = 1; i < s.length(); i++) {
            char curr = s.charAt(i);
            if (curr == prev) {
                dd += curr;
                if (dd.length() == 2 && rslt.doubleDouble == null) {
                    rslt.doubleDouble = dd;
                }
                if (rslt.beforeDouble == null && i > 1) {
                    rslt.beforeDouble = new String(new char[] { s.charAt(i - 2), curr });
                }
                if (rslt.preBeforeDouble == null && i > 2) {
                    rslt.preBeforeDouble = new String(new char[] { s.charAt(i - 3), curr });
                }
                if (rslt.doubleAfter == null && (i + 1) < s.length()) {
                    rslt.doubleAfter = new String(new char[] { curr, s.charAt(i + 1) });
                }
                if (rslt.doublePostAfter == null && (i + 2) < s.length()) {
                    rslt.doublePostAfter = new String(new char[] { curr, s.charAt(i + 2) });
                }
            }
            prev = curr;
        }
        return rslt;
    }

    private static void buildStatistics(String[] args) throws IOException {
        if (args.length < 3) {
            logLn("Usage: stat inputFile outputFile");
            return;
        }

        Set<String> doubles = new HashSet<>();
        for (Character ch0 : ALPHABET) {
            for (Character ch1 : ALPHABET) {
                String s = new String(new char[] { ch0, ch1 });
                doubles.add(s);
            }
        }
        Map<String, Integer> doubleCounts = new TreeMap<>();
        for (String s : doubles) {
            doubleCounts.put(s, 0);
        }

        Set<String> triples = new HashSet<>();
        for (Character ch0 : ALPHABET) {
            for (Character ch1 : ALPHABET) {
                for (Character ch2 : ALPHABET) {
                    //for (Character ch3 : ALPHABET) {
                    //    for (Character ch4 : ALPHABET) {
                            String s = new String(new char[] { ch0, ch1, ch2 });
                            triples.add(s);
                    //    }
                    //}
                }
            }
        }
        Map<String, Integer> tripleCounts = new TreeMap<>();
        for (String s : triples) {
            tripleCounts.put(s, 0);
        }

        /*Set<String> fourths = new HashSet<>();
        for (Character ch0 : ALPHABET) {
            for (Character ch1 : ALPHABET) {
                for (Character ch2 : ALPHABET) {
                    for (Character ch3 : ALPHABET) {
                    //    for (Character ch4 : ALPHABET) {
                            String s = new String(new char[] { ch0, ch1, ch2, ch3 });
                            fourths.add(s);
                    //    }
                    }
                }
            }
        }
        Map<String, Integer> fourthCounts = new TreeMap<>();
        for (String s : fourths) {
            fourthCounts.put(s, 0);
        }*/

        String inFn = args[1];
        String outFn = args[2];
        List<String> strLst = loadFileAndSort(inFn);
        Map<Integer, Integer> lenCnt = new TreeMap<>();
        Set<String> prefix3 = new TreeSet<>();
        Set<String> suffix3 = new TreeSet<>();
        Set<String> prefix4 = new TreeSet<>();
        Set<String> consonants = new TreeSet<>();
        Set<String> prefixes456 = new TreeSet<>();
        Set<String> prefixes567 = new TreeSet<>();
        Set<String> prefixes678 = new TreeSet<>();
        Set<String> prefixes68 = new TreeSet<>();
        Set<String> prefixes67 = new TreeSet<>();
        Set<String> prefixes78 = new TreeSet<>();

        Set<String> doubleDoubles = new TreeSet<>();
        Set<String> beforeDoubles = new TreeSet<>();
        Set<String> preBeforeDoubles = new TreeSet<>();
        Set<String> doubleAfters = new TreeSet<>();
        Set<String> doublePostAfters = new TreeSet<>();
        int ddCnt = 0;
        int bdCnt = 0;
        int pbdCnt = 0;
        int daCnt = 0;
        int dpaCnt = 0;

        Set<String> prefix3_4 = new TreeSet<>();
        Set<String> suffix3_4 = new TreeSet<>();
        Set<String> prefix3_5 = new TreeSet<>();
        Set<String> suffix3_5 = new TreeSet<>();
        Set<String> prefix3_6 = new TreeSet<>();
        Set<String> suffix3_6 = new TreeSet<>();
        Set<String> prefix3_7 = new TreeSet<>();
        Set<String> suffix3_7 = new TreeSet<>();
        Set<String> prefix3_8 = new TreeSet<>();
        Set<String> suffix3_8 = new TreeSet<>();

        for (String s : strLst) {
            int len = s.length();
            Integer cnt = lenCnt.get(len);
            if (cnt == null) lenCnt.put(len, 1);
            else lenCnt.put(len, ++cnt);

            DoubleStat dStat = doubleStat(s);
            if (dStat.doubleDouble != null) {
                doubleDoubles.add(dStat.doubleDouble);
                ddCnt++;
            }
            if (dStat.beforeDouble != null) {
                beforeDoubles.add(dStat.beforeDouble);
                bdCnt++;
            }
            if (dStat.preBeforeDouble != null) {
                preBeforeDoubles.add(dStat.preBeforeDouble);
                pbdCnt++;
            }
            if (dStat.doubleAfter != null) {
                doubleAfters.add(dStat.doubleAfter);
                daCnt++;
            }
            if (dStat.doublePostAfter != null) {
                doublePostAfters.add(dStat.doublePostAfter);
                dpaCnt++;
            }

            String str = s;
            if (str.endsWith("$")) str = str.substring(0, str.length() - 1);

            if (str.length() >= 8) {
                String pre4 = str.substring(0, 4);
                prefix4.add(pre4);
            }

            if (str.length() >= 3) {
                String pre3 = str.substring(0, 3);
                String suf3 = str.substring(str.length() - 3);
//                prefix3.add(pre3);
//                suffix3.add(suf3);
                if (str.length() >= 5 && str.length() <= 7) {
                    prefix3.add(pre3);
                    suffix3.add(suf3);
                }

                if (str.length() >= 8) {
                    prefix3_8.add(pre3);
                    suffix3_8.add(suf3);
                } else {
                    switch (str.length()) {
                    case 4:
                        prefix3_4.add(pre3);
                        suffix3_4.add(suf3);
                        break;
                    case 5:
                        prefix3_5.add(pre3);
                        suffix3_5.add(suf3);
                        break;
                    case 6:
                        prefix3_6.add(pre3);
                        suffix3_6.add(suf3);
                        break;
                    case 7:
                        prefix3_7.add(pre3);
                        suffix3_7.add(suf3);
                        break;
                    }
                }
            }

            if (str.length() <= 7) str = "";
            else str = str.substring(3, str.length() - 3); // prefix3, suffix3

            if (str.length() >= 2) {
                for (Entry<String, Integer> j : doubleCounts.entrySet()) {
                    if (str.contains(j.getKey())) j.setValue(j.getValue() + 1);
                }
            }
            if (str.length() >= 3) {
                for (Entry<String, Integer> j : tripleCounts.entrySet()) {
                    if (str.contains(j.getKey())) j.setValue(j.getValue() + 1);
                }
                String cons = getConsonants(str, 0, 3);
                if (cons != null) consonants.add(cons);

                prefixes456.add(str.substring(0, 3));
            }
            if (str.length() >= 4) {
                prefixes567.add(str.substring(1, 4));
            }
            if (str.length() >= 5) {
                prefixes678.add(str.substring(2, 5));
                String p68 = new String(new char[] { str.charAt(2), str.charAt(4) });
                String p67 = new String(new char[] { str.charAt(2), str.charAt(3) });
                String p78 = new String(new char[] { str.charAt(3), str.charAt(4) });
                prefixes68.add(p68);
                prefixes67.add(p67);
                prefixes78.add(p78);
            }
        }
        List<String> rslt = new ArrayList<>();
        for (Entry<Integer, Integer> j : lenCnt.entrySet()) {
            String s = j.getKey().toString();
            if (s.length() == 1) s = "0" + s;
            rslt.add("Length: " + s + "; words: " + j.getValue());
        }
        rslt.add("");
        List<String> doublesSel = new ArrayList<>();
        int doublesTotal = 0;
        for (Entry<String, Integer> j : doubleCounts.entrySet()) {
            if (j.getValue() <= 0) {
                rslt.add(j.getKey() + " = " + j.getValue());
                doublesTotal += j.getValue();
                doublesSel.add(j.getKey());
            }
        }
        rslt.add("Total doubles lines: " + doublesTotal);
        /*List<String> doublesSelWords = new ArrayList<>();
        for (String s : strLst) {
            for (String sel : doublesSel) {
                if (s.contains(sel)) {
                    doublesSelWords.add(s);
                    break;
                }
            }
        }
        rslt.addAll(doublesSelWords);*/

        rslt.add("");
        List<String> triplesSel = new ArrayList<>();
        int tripleTotal = 0;
        for (Entry<String, Integer> j : tripleCounts.entrySet()) {
            if (j.getValue() <= 0) {
                rslt.add(j.getKey() + " = " + j.getValue());
                tripleTotal += j.getValue();
                triplesSel.add(j.getKey());
            }
        }
        rslt.add("Total triples lines: " + tripleTotal);
        /*List<String> triplesSelWords = new ArrayList<>();
        for (String s : strLst) {
            for (String sel : triplesSel) {
                if (s.contains(sel)) {
                    triplesSelWords.add(s);
                    break;
                }
            }
        }
        rslt.addAll(triplesSelWords);*/

        /*rslt.add("");
        rslt.add("Fourths");
        List<String> fourthsSel = new ArrayList<>();
        int fourthTotal = 0;
        for (Entry<String, Integer> j : fourthCounts.entrySet()) {
            if (j.getValue() <= 0) {
                rslt.add(j.getKey() + " = " + j.getValue());
                fourthTotal += j.getValue();
                fourthsSel.add(j.getKey());
            }
        }
        rslt.add("Total fourths lines: " + fourthTotal);*/

        rslt.add("");
        rslt.add("Consonants");
        for (String s : consonants) rslt.add(s);

        rslt.add("");
        rslt.add("Prefixes456");
        for (String s : prefixes456) rslt.add(s);

        rslt.add("");
        rslt.add("Prefixes567");
        for (String s : prefixes567) rslt.add(s);

        rslt.add("");
        rslt.add("Prefixes678");
        for (String s : prefixes678) rslt.add(s);

        rslt.add("");
        rslt.add("Prefixes68");
        for (String s : prefixes68) rslt.add(s);

        rslt.add("");
        rslt.add("Prefixes67");
        for (String s : prefixes67) rslt.add(s);

        rslt.add("");
        rslt.add("Prefixes78");
        for (String s : prefixes78) rslt.add(s);

        rslt.add("");
        rslt.add("DoubleDouble words: " + ddCnt);
        for (String s : doubleDoubles) rslt.add(s);

        rslt.add("");
        rslt.add("BeforeDouble words: " + bdCnt);
        for (String s : beforeDoubles) rslt.add(s);

        rslt.add("");
        rslt.add("PreBeforeDouble words: " + pbdCnt);
        for (String s : preBeforeDoubles) rslt.add(s);

        rslt.add("");
        rslt.add("DoubleAfter words: " + daCnt);
        for (String s : doubleAfters) rslt.add(s);

        rslt.add("");
        rslt.add("DoublePostAfter words: " + dpaCnt);
        for (String s : doublePostAfters) rslt.add(s);

        rslt.add("");
        rslt.add("Prefix3");
        for (String s : prefix3) rslt.add(s);

        rslt.add("");
        rslt.add("Prefix4");
        for (String s : prefix4) rslt.add(s);

        rslt.add("");
        rslt.add("Suffix3");
        for (String s : suffix3) rslt.add(s);

        rslt.add("");
        rslt.add("Prefix3_4");
        for (String s : prefix3_4) rslt.add(s);

        rslt.add("");
        rslt.add("Suffix3_4");
        for (String s : suffix3_4) rslt.add(s);

        rslt.add("");
        rslt.add("Prefix3_5");
        for (String s : prefix3_5) rslt.add(s);

        rslt.add("");
        rslt.add("Suffix3_5");
        for (String s : suffix3_5) rslt.add(s);

        rslt.add("");
        rslt.add("Prefix3_6");
        for (String s : prefix3_6) rslt.add(s);

        rslt.add("");
        rslt.add("Suffix3_6");
        for (String s : suffix3_6) rslt.add(s);

        rslt.add("");
        rslt.add("Prefix3_7");
        for (String s : prefix3_7) rslt.add(s);

        rslt.add("");
        rslt.add("Suffix3_7");
        for (String s : suffix3_7) rslt.add(s);

        rslt.add("");
        rslt.add("Prefix3_8");
        for (String s : prefix3_8) rslt.add(s);

        rslt.add("");
        rslt.add("Suffix3_8");
        for (String s : suffix3_8) rslt.add(s);

        logLn("Statistics done.");
        Files.write(Paths.get(outFn), rslt);
    }

    private static void buildSubDictionary(String[] args) throws IOException {
        if (args.length < 4) {
            logLn("Usage: subdict inputFile outputFile 5,8,10+");
            return;
        }
        String inFn = args[1];
        String outFn = args[2];

        String wordLengths = args[3];
        String[] arr = wordLengths.split(",");
        Set<Integer> lens = new HashSet<>();
        for (int i = 0; i < arr.length; i++) {
            String s = arr[i].trim();
            boolean plus = false;
            if (s.endsWith("+")) {
                plus = true;
                s = s.substring(0, s.length() - 1);
            }
            int n = Integer.parseInt(s);
            lens.add(n);
            if (plus) {
                for (int j = n + 1; j < 100; j++) {
                    lens.add(j);
                }
            }
        }

        List<String> strLst = loadFileAndSort(inFn);
        List<String> rslt = new ArrayList<>();
        for (String s : strLst) {
            if (lens.contains(s.length())) rslt.add(s);
        }
        logLn("SubDictionary lines: " + rslt.size());
        Files.write(Paths.get(outFn), rslt);
    }

    private static void buildDistinctDict(String[] args) throws IOException {
        if (args.length < 3) {
            logLn("Usage: distinct inputFile outputFile cutEachLineToNchars optimize$ suffix");
            return;
        }
        String inFn = args[1];
        String outFn = args[2];
        Integer cutLen = args.length > 3 ? Integer.parseInt(args[3]) : null;
        boolean optimizeDollar = args.length > 4 ? Boolean.parseBoolean(args[4]) : false;
        boolean needSuffix = args.length > 5 ? Boolean.parseBoolean(args[5]) : false;

        List<String> strLst = loadFileAndSort(inFn);
        Set<String> distinct = !needSuffix ? new LinkedHashSet<>(strLst.size()) : new TreeSet<>();
        for (String s : strLst) {
            if (s.isEmpty() || s.trim().isEmpty()) continue;

            //if (!s.endsWith("$")) continue;

            /*if (s.length() < 9) continue;
            String str = s.substring(7, 9);
            distinct.add(str);
            continue;*/

            /*String str = new String(new char[] { s.charAt(0), s.charAt(s.length() - 2) });
            distinct.add(str);
            continue;*/

            if (!needSuffix) {
                if (cutLen != null && cutLen > 0) s = s.substring(0, cutLen);
            } else if (cutLen != null && cutLen > 0) {
                String suffix;
                if (s.endsWith("$")) {
                    suffix = s.substring(s.length() - 1 - cutLen, s.length() - 1);
                } else {
                    suffix = s.substring(s.length() - cutLen);
                }
                if (!cutLen.equals(suffix.length())) continue;
                s = suffix;
            } else {
                continue;
            }
            distinct.add(s);
        }
        logLn("Distinct lines: " + distinct.size());

        if (optimizeDollar) { // abc & abc's case -> abc can be removed
            int removedDollarCnt = 0;
            Set<String> rslt = new LinkedHashSet<>(distinct.size());
            Set<String> rsltDollarOnly = new LinkedHashSet<>();
            for (String s : distinct) {
                if (s.endsWith("$")) {
                    String str = s.substring(0, s.length() - 1);
                    if (distinct.contains(str)) {
                        rslt.remove(str);
                        rslt.add(s);
                        removedDollarCnt++;
                    } else {
                        rsltDollarOnly.add(s);
                    }
                } else {
                    rslt.add(s);
                }
            }
            if (removedDollarCnt > 0) {
                distinct = rslt;
                logLn("Removed $ lines: " + removedDollarCnt);
                Files.write(Paths.get(addSuffixToFileName(outFn, "-$only")), rsltDollarOnly);
            }
        }

        Files.write(Paths.get(outFn), distinct);
    }

    private static void buildMDAG(String[] args) throws IOException {
        if (args.length < 3) {
            logLn("Usage: distinct inputFile outputFile");
            return;
        }
        String inFn = args[1];
        String outFn = args[2];
        List<String> strLst = loadFileAndSort(inFn);
        MDAG mdag = new MDAG(strLst);
        mdag.simplify();
        SimpleMDAGNode[] arr = mdag.getSimpleMDAGArray();
        logLn("MDAG array length: " + arr.length);
    }

    private static class Block {
        public final int beg;
        public final int end;
        public final String str;

        public Block(int beg, int end, String str) {
            this.beg = beg;
            this.end = end;
            this.str = str;
        }

        public int getBlockLines() {
            return end - beg + 1;
        }

        public int getBlockSize() {
            int blockLines = getBlockLines();
            return blockLines * str.length();
        }
    }

    private static void buildPrefixDict(String[] args) throws IOException {
        if (args.length < 6) {
            logLn("Usage: inputFile outputFile doInputSort wordLength minBlockChars showStatistics");
            return;
        }
        String inFn = args[1];
        String outFn = args[2];
        boolean doInSort = "true".equalsIgnoreCase(args[3]);
        wordLen = Integer.parseUnsignedInt(args[4]);
        minBlockChars = Integer.parseUnsignedInt(args[5]);
        boolean showStatistics = args.length >= 6 ? "true".equalsIgnoreCase(args[6]) : false;

        List<String> strLst = loadFile(inFn, doInSort);
        List<Block> rslt = new ArrayList<>(strLst.size() / 100);

        int i = 0;
        while (i < strLst.size()) {
            int len = wordLen;
            Block blk = findBlock(i, len, strLst);
            if (blk == null) {
                i++;
                continue;
            }
            List<Block> blocks = new ArrayList<>();
            blocks.add(blk);
            while (true) {
                Block nextBlk = findBlock(blk.beg, ++len, strLst);
                if (nextBlk == null) break;
                blocks.add(nextBlk);
            }
            Block maxBlk = blocks.get(0);
            for (int j = 1; j < blocks.size(); j++) {
                if (blocks.get(j).getBlockSize() > maxBlk.getBlockSize()) {
                    maxBlk = blocks.get(j);
                }
            }
            rslt.add(maxBlk);
            i = maxBlk.end + 1;
        }
        Map<Integer, List<Block>> r = new TreeMap<>();
        for (Block j : rslt) {
            List<Block> lst = r.get(j.getBlockSize());
            if (lst == null) lst = new ArrayList<>();
            lst.add(j);
            r.put(j.getBlockSize(), lst);
        }
        int total = 0;
        int lines = 0;
        int maxLines = 0;
        String maxLinesStr = null;
        List<String> outLst = new ArrayList<>();
        for (Entry<Integer, List<Block>> j : r.entrySet()) {
            List<Block> lst = j.getValue();
            for (int k = lst.size() - 1; k >= 0; k--) {
                Block curBlk = lst.get(k);
                String s = curBlk.str;
                if (showStatistics) {
                    s = j.getKey() + " -> " + s;
                }
                outLst.add(0, s);

                total += curBlk.getBlockSize();
                lines += curBlk.getBlockLines();
                if (curBlk.getBlockLines() > maxLines) {
                    maxLines = curBlk.getBlockLines();
                    maxLinesStr = curBlk.str;
                }
            }
        }

        logLn("Dictionary lines: " + outLst.size() + "; Total blocks size: " + total
                + "; Total lines: " + lines
                + "; Max block's # of lines: " + maxLines + "  " + maxLinesStr);
        Files.write(Paths.get(outFn), outLst);

        List<String> dictL2 = new ArrayList<>(strLst.size());
        i = 0;
        while (i < strLst.size()) {
            Block blk = null;
            for (Block b : rslt) {
                if (i >= b.beg && i <= b.end) {
                    blk = b;
                    break;
                }
            }
            if (blk == null) dictL2.add(strLst.get(i));
            else {
                String s = strLst.get(i);
                dictL2.add(s.substring(blk.str.length()));
            }
            i++;
        }
        String s = addSuffixToFileName(outFn, "-dictL2");
        Files.write(Paths.get(s), dictL2);
    }

    private static String addSuffixToFileName(String fn, String suffix) {
        String s = fn;
        int i = fn.lastIndexOf('.');
        if (i >= 0) s = s.substring(0, i) + suffix + s.substring(i);
        else s += suffix;
        return s;
    }

    private static Block findBlock(int startIdx, int wordLen, List<String> strLst) {
        String str = strLst.get(startIdx);
        if (str.length() < wordLen) return null;
        str = str.substring(0, wordLen);
        for (int i = startIdx + 1; i < strLst.size(); i++) {
            String s = strLst.get(i);
            if (!s.startsWith(str)) {
                int blockLines = i - startIdx;
                if (blockLines > 1 && blockLines * wordLen >= minBlockChars) {
                    return new Block(startIdx, i - 1, str);
                } else {
                    return null;
                }
            }
        }
        int blockLines = strLst.size() - startIdx;
        if (blockLines > 1 && blockLines * wordLen >= minBlockChars) {
            return new Block(startIdx, strLst.size() - 1, str);
        } else {
            return null;
        }
    }

    private static void buildRootCounts(String[] args) throws IOException {
        if (args.length < 5) {
            logLn("Usage: rootcounts minRootLen rootsFile inputFile outputFile");
            return;
        }
        int minRootLen = Integer.parseInt(args[1]);
        String rootsFn = args[2];
        String inFn = args[3];
        String outFn = args[4];
        List<String> strLst = loadFile(inFn, false/*doSort*/);
        List<String> roots = loadFile(rootsFn, false/*doSort*/);
        Map<Integer, List<String>> counts = new TreeMap<>();
        for (String root : roots) {
            if (root == null || root.isEmpty() || root.trim().isEmpty()) continue;
            if (root.length() < minRootLen) continue;
            int cnt = 0;
            for (String s : strLst) {
                if (s.contains(root)) cnt++;
            }
            List<String> lst = counts.get(cnt);
            if (lst == null) lst = new ArrayList<>();
            lst.add(root);
            counts.put(cnt, lst);
        }
        List<String> rslt = new ArrayList<>(counts.size());
        for (Entry<Integer, List<String>> j : counts.entrySet()) {
            if (j.getKey() < 400) continue;
            List<String> lst = j.getValue();
            for (int i = lst.size() - 1; i >= 0; i--) {
                rslt.add(0, lst.get(i) /*+ " -> " + j.getKey()*/);
            }
        }
        logLn("RootCounts lines: " + rslt.size());
        Files.write(Paths.get(outFn), rslt);
    }

    private static void buildRootPrefixesOrSuffixes(boolean isPrefix, String[] args) throws IOException {
        if (args.length < 4) {
            if (isPrefix) logLn("Usage: rootprefix rootsFile inputFile outputFile");
            else logLn("Usage: rootsuffix rootsFile inputFile outputFile");
            return;
        }
        String rootsFn = args[1];
        String inFn = args[2];
        String outFn = args[3];
        List<String> strLst = loadFile(inFn, false/*doSort*/);
        List<String> roots = loadFile(rootsFn, false/*doSort*/);
        Map<String, Integer> distinct = new HashMap<>();
        for (String root : roots) {
            if (root == null || root.isEmpty() || root.trim().isEmpty()) continue;
            for (String s : strLst) {
                int j = s.indexOf(root);
                if (j == -1) continue;
                String substr = isPrefix ? s.substring(0, j) : s.substring(j + root.length());
                Integer cnt = distinct.get(substr);
                if (cnt == null) cnt = 1;
                else cnt++;
                distinct.put(substr, cnt);
            }
        }
        Map<Integer, List<String>> rslt = new TreeMap<>();
        for (Entry<String, Integer> j : distinct.entrySet()) {
            List<String> lst = rslt.get(j.getValue());
            if (lst == null) lst = new ArrayList<>();
            lst.add(j.getKey());
            rslt.put(j.getValue(), lst);
        }
        List<String> outLst = new ArrayList<>(rslt.size());
        for (Entry<Integer, List<String>> j : rslt.entrySet()) {
            int cnt = j.getKey();
            List<String> lst = j.getValue();
            for (int i = lst.size() - 1; i >= 0; i--) {
                outLst.add(0, lst.get(i) + " -> " + cnt);
            }
        }
        logLn((isPrefix ? "Prefixes" : "Suffixes") + " count: " + rslt.size());
        Files.write(Paths.get(outFn), outLst);
    }

    private static Set<String> commaStr(String s) {
        Set<String> rslt = new HashSet<>();
        if (s == null || s.isEmpty()) return rslt;
        String[] arr = s.split(",");
        for (String j : arr) {
            String str = j.trim();
            if ("^".equals(str)) str = "";
            rslt.add(str);
        }
        return rslt;
    }

    private static List<String> extendRoot(Set<String> prefixes, Set<String> suffixes, String root) {
        List<String> rslt = new ArrayList<>();
        for (String pre : prefixes) {
            for (String suf : suffixes) {
                rslt.add(pre + root + suf);
            }
        }
        return rslt;
    }

    private static void searchRootWithPrefixSuffix(String[] args) throws IOException {
        if (args.length < 4) {
            logLn("Usage: rootsearch rootsFile inputFile outputFile prefixes suffixes");
            logLn("prefixes and suffixes may have special symbol ^ means empty.");
            return;
        }
        String rootsFn = args[1];
        String inFn = args[2];
        String outFn = args[3];
        Set<String> prefixes = args.length > 4 ? commaStr(args[4]) : new HashSet<String>() {{ add(""); }};
        Set<String> suffixes = args.length > 5 ? commaStr(args[5]) : new HashSet<String>() {{ add(""); }};

        List<String> strLst = loadFile(inFn, false/*doSort*/);
        List<String> roots = loadFile(rootsFn, false/*doSort*/);

        List<String> rslt = new ArrayList<>(roots.size());
        Set<String> strSet = new HashSet<>(strLst);
        for (String root : roots) {
            if (root == null || root.isEmpty() || root.trim().isEmpty()) continue;
            List<String> words = extendRoot(prefixes, suffixes, root);
            boolean ok = true;
            for (String s : words) {
                if (!strSet.contains(s)) {
                    ok = false;
                    break;
                }
            }
            if (ok) rslt.add(root);
        }
        logLn("Valid roots count: " + rslt.size());
        Files.write(Paths.get(outFn), rslt);
    }

    /*private static byte[] compactStr(byte[] s) {
        BitSet bits = new BitSet(s.length * 5);
        int i = 0;
        for (int j = 0; j < s.length; j++) {
            byte b = s[j];
            char ch = (char) b;
            if (ch == '\'') b = 26;
            else if (ch == '$') b = 27;
            else b = (byte) (b - 'a');
            b = (byte) (b & 0x1f);
            for (int k = 0; k < 5; k++) {
                int mask = 1 << k;
                bits.set(i, (b & mask) > 0);
                i++;
            }
        }
        return bits.toByteArray();
    }*/

    private static void processHash(String[] args) throws IOException {
        if (args.length < 4) {
            logLn("Usage: hash inputFile outputFile testFile");
            return;
        }
        String inFn = args[1];
        String outFn = args[2];
        String testFn = args[3];

        Set<Integer> hashes = new HashSet<>();
        List<String> strLst = loadFileAndSort(inFn);
        List<String> rslt = new ArrayList<>();

        //Random rnd = new Random();
        //for (int z = 0; z < 1000; z++) {
        //    hashes.clear();
        //    int seed = rnd.nextInt();

            int collision = 0;
            for (String s : strLst) {
                byte[] arr = s.getBytes(dictCharset);
                //arr = compactStr(arr);

                int h = MurmurHash3.murmurhash3_x86_32(arr, 0, arr.length, HASH_SEED);
                //int h = FNV1a.hash32(arr);

                h = reduceHashToXX(h);

                if (hashes.contains(h)) {
                    collision++;
                    rslt.add(s);
                }
                else hashes.add(h);
            }
        //    if (collision > 169000) logLn("Collisions: " + collision + "; Seed: " + seed);
        //}

        logLn("Collisions: " + collision);
        Files.write(Paths.get(outFn), rslt);

        double falsePositiveProbability = 0.7d;
        double bitsPerElement = Math.ceil(
                -(Math.log(falsePositiveProbability) / Math.log(2))) / Math.log(2); // c = k / ln(2)
        double numberOfHashFuncts = Math.ceil(
                -(Math.log(falsePositiveProbability) / Math.log(2))); // k = ceil(-log_2(false prob.))

        int expectedNumberOfElements = 484789;
        int bitSetSize = (int) Math.ceil(bitsPerElement * expectedNumberOfElements);

        logLn("bitsPerElement: " + bitsPerElement + "   numberOfHashFuncts: " + numberOfHashFuncts
                + "   bitSetSize: " + (bitSetSize / 8) + " bytes");

        BloomFilter<String> bloom = new BloomFilter<>(BIT_MAX, expectedNumberOfElements);
        for (String s : strLst) {
            bloom.add(s);
        }
        BitSet fltr = bloom.getBitSet();
        SparseBitSet sparseBits = new SparseBitSet(fltr.length());
        BitSet inverseFltr = new BitSet(fltr.length());
        int bit1Cnt = 0;
        for (int i = 0; i < fltr.length(); i++) {
            boolean v = fltr.get(i);
            if (v) bit1Cnt++;
            inverseFltr.set(i, !v);
            sparseBits.set(i, !v);
        }
        int inverseBit1Cnt = 0;
        for (int i = 0; i < inverseFltr.length(); i++) {
            boolean v = inverseFltr.get(i);
            if (v) inverseBit1Cnt++;
        }
        Files.write(Paths.get(outFn), inverseFltr.toByteArray());
        logLn("Bloom bitset 1 count: " + bit1Cnt + "; inverse bitset 1 count: " + inverseBit1Cnt);
        logLn("SparseBitSet statistics: " + sparseBits.statistics());

        /*FileOutputStream fout = new FileOutputStream(outFn);
        ObjectOutputStream oos = new ObjectOutputStream(fout);
        oos.writeObject(sparseBits);
        oos.close();*/

        List<String> invalid2 = loadFile("c:\\Users\\slavap\\Documents\\jqm4gwt\\dict\\misc\\invalid-doubles.txt", false/*doSort*/);
        List<String> invalid3 = loadFile("c:\\Users\\slavap\\Documents\\jqm4gwt\\dict\\misc\\invalid-triples.txt", false/*doSort*/);
        List<String> invalid4 = loadFile("c:\\Users\\slavap\\Documents\\jqm4gwt\\dict\\misc\\invalid4.txt", false/*doSort*/);
        List<String> valid5 = loadFile("c:\\Users\\slavap\\Documents\\jqm4gwt\\dict\\misc\\valid5.txt", false/*doSort*/);

        List<String> prefix3 = loadFile("c:\\Users\\slavap\\Documents\\jqm4gwt\\dict\\misc\\prefix3.txt", false/*doSort*/);
        List<String> prefix4 = loadFile("c:\\Users\\slavap\\Documents\\jqm4gwt\\dict\\misc\\prefix4.txt", false/*doSort*/);

        List<String> invalid2verify = loadFile("c:\\Users\\slavap\\Documents\\jqm4gwt\\dict\\misc\\invalid2verify.txt", false/*doSort*/);
        List<String> subdictValid2 = loadFile("c:\\Users\\slavap\\Documents\\jqm4gwt\\dict\\misc\\subdictValid2.txt", false/*doSort*/);
        Set<String> setValid2 = new HashSet<>();
        setValid2.addAll(subdictValid2);

        List<String> invalid3verify = loadFile("c:\\Users\\slavap\\Documents\\jqm4gwt\\dict\\misc\\invalid3verify.txt", false/*doSort*/);
        List<String> subdictValid3 = loadFile("c:\\Users\\slavap\\Documents\\jqm4gwt\\dict\\misc\\subdictValid3.txt", false/*doSort*/);
        Set<String> setValid3 = new HashSet<>();
        setValid3.addAll(subdictValid3);

        List<String> fails = new ArrayList<>();
        List<String> testLst = loadFile(testFn, false/*doSort*/);
        int all = 0;
        int bloomCnt = 0;
        int bloomFail = 0;
        int invalid2Cnt = 0;
        int invalid2verifyCnt = 0;
        int invalid3Cnt = 0;
        int invalid3verifyCnt = 0;
        int invalid4Cnt = 0;
        int valid5Cnt = 0;

        int prefix3Cnt = 0;
        int prefix4Cnt = 0;

        for (String s : testLst) {
            s = s.trim();
            if (s.endsWith("'s")) s = s.substring(0, s.length() - 2) + '$';
            if (s.indexOf('\'') >= 0) continue; // quotes dictionary
            if (s.length() == 1) continue; // a-z OK
            if (s.length() == 2 && s.endsWith("$")) continue; // a$-z$ OK
            //if (s.length() >= 20) continue;
            if (s.length() < 4 || s.length() > 22) continue;
            all++;

            boolean found = false;
            /*for (String str : valid5) {
                if (s.contains(str)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                valid5Cnt++;
                continue;
            }*/

            boolean invalid = false;
            for (String str : invalid2) {
                if (s.contains(str)) {
                    invalid2Cnt++;
                    invalid = true;
                    break;
                }
            }
            if (invalid) continue;

            for (String str : invalid3) {
                if (s.contains(str)) {
                    invalid3Cnt++;
                    invalid = true;
                    break;
                }
            }
            if (invalid) continue;

            found = false;
            for (String str : prefix4) {
                if (s.startsWith(str)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                prefix4Cnt++;
                continue;
            }

            found = false;
            for (String str : prefix3) {
                if (s.startsWith(str)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                prefix3Cnt++;
                continue;
            }

            /*for (String str : invalid4) {
                if (s.contains(str)) {
                    invalid4Cnt++;
                    invalid = true;
                    break;
                }
            }
            if (invalid) continue;*/

            for (String str : invalid2verify) {
                if (s.contains(str) && !setValid2.contains(s)) {
                    invalid2verifyCnt++;
                    invalid = true;
                    break;
                }
            }
            if (invalid) continue;

            for (String str : invalid3verify) {
                if (s.contains(str) && !setValid3.contains(s)) {
                    invalid3verifyCnt++;
                    invalid = true;
                    break;
                }
            }
            if (invalid) continue;

            bloomCnt++;
            if (bloom.contains(s)) {
                bloomFail++;
                fails.add(s);
            }
        }
        logLn("Total lines: " + all);
        logLn("Invalid2 total: " + invalid2Cnt
                + "; Invalid3 total: " + invalid3Cnt
                + "; valid5 total: " + valid5Cnt
                + "; Invalid2verify total: " + invalid2verifyCnt
                + "; Invalid3verify total: " + invalid3verifyCnt
                + "; Invalid4 total: " + invalid4Cnt);
        logLn("Prefix3: " + prefix3Cnt + "; Prefix4: " + prefix4Cnt);
        logLn("Bloom total lines: " + bloomCnt + "; Failures: " + bloomFail);

        //Files.write(Paths.get(outFn), fails);
    }

    private static void processRelease(String[] args) throws IOException {
        if (args.length < 4) {
            logLn("Usage: release inputFile outputFile testFile");
            return;
        }
        String inFn = args[1];
        String outFn = args[2];
        String testFn = args[3];

        List<String> strLst = loadFileAndSort(inFn);
        List<String> testLst = loadFile(testFn, false/*doSort*/);
        List<String> rslt = new ArrayList<>();

        //BloomFilter<String> bloom = new BloomFilter<>(BIT_MAX, 622291/*expectedNumberOfElements*/);
        BitSet bloom = new BitSet(BIT_MAX);
        for (String s : strLst) {
            int h = calcHash(s.getBytes(dictCharset));
            h = reduceHashToXX(h);
            bloom.set(h);
        }
        BitSet fltr = bloom;
        int bit1Cnt = 0;
        for (int i = 0; i < fltr.length(); i++) {
            boolean v = fltr.get(i);
            if (v) bit1Cnt++;
        }
        Files.write(Paths.get(outFn), fltr.toByteArray());
        logLn("Bloom bitset 1 count: " + bit1Cnt + "; length: " + fltr.length());

        /*BitSet test = new BitSet(64);
        test.set(0);
        test.set(7);
        test.set(9);
        test.set(14);
        test.set(18);
        test.set(27);
        test.set(36);
        test.set(45);
        test.set(48);
        test.set(56);
        test.set(57);
        test.set(58);
        test.set(63);
        Files.write(Paths.get(outFn), test.toByteArray());*/

        final String releasePath = "c:\\Users\\slavap\\Documents\\jqm4gwt\\dict\\misc\\final\\";

        List<String> wordsWithQuotes = loadFile(releasePath + "words_with_quotes.txt", false/*doSort*/);
        List<String> subdict2 = loadFile(releasePath + "subdict2.txt", false/*doSort*/);
        List<String> subdict3DollarOnly = loadFile(releasePath + "subdict3-$only.txt", false/*doSort*/);
        List<String> subdict3 = loadFile(releasePath + "subdict3-no$.txt", false/*doSort*/);
        List<String> subdict4DollarOnly = loadFile(releasePath + "subdict4-$only.txt", false/*doSort*/);
        List<String> subdict21Plus = loadFile(releasePath + "subdict21+_few20added.txt", false/*doSort*/);

        List<String> prefix4 = loadFile(releasePath + "prefix4-8+.txt", false/*doSort*/);

        List<String> prefix3_4_7 = loadFile(releasePath + "prefix3-4-7.txt", false/*doSort*/);

//        List<String> prefix3_4 = loadFile(releasePath + "prefix3_4.txt", false/*doSort*/);
//        List<String> prefix3_5 = loadFile(releasePath + "prefix3_5.txt", false/*doSort*/);
//        List<String> prefix3_6 = loadFile(releasePath + "prefix3_6.txt", false/*doSort*/);
//        List<String> prefix3_7 = loadFile(releasePath + "prefix3_7.txt", false/*doSort*/);
//        List<String> prefix3_8 = loadFile(releasePath + "prefix3_8.txt", false/*doSort*/);

        List<String> suffix3_8Plus = loadFile(releasePath + "suffix3-8+.txt", false/*doSort*/);
        List<String> suffix3_5_7 = loadFile(releasePath + "suffix3-5-7.txt", false/*doSort*/);

//        List<String> suffix3_4 = loadFile(releasePath + "suffix3_4.txt", false/*doSort*/);
//        List<String> suffix3_5 = loadFile(releasePath + "suffix3_5.txt", false/*doSort*/);
//        List<String> suffix3_6 = loadFile(releasePath + "suffix3_6.txt", false/*doSort*/);
//        List<String> suffix3_7 = loadFile(releasePath + "suffix3_7.txt", false/*doSort*/);
//        List<String> suffix3_8 = loadFile(releasePath + "suffix3_8.txt", false/*doSort*/);

        //List<String> prefix456 = loadFile(releasePath + "prefix456.txt", false/*doSort*/);
        //List<String> prefix567 = loadFile(releasePath + "prefix567.txt", false/*doSort*/);
        List<String> prefix678 = loadFile(releasePath + "prefix678.txt", false/*doSort*/);

        List<String> invalid3 = loadFile(releasePath + "invalid3.txt", false/*doSort*/);
        //List<String> invalid2 = loadFile(releasePath + "invalid2-5_22-3_3.txt", false/*doSort*/);

        Set<String> setPrefix4 = new HashSet<>(prefix4.size());
        setPrefix4.addAll(prefix4);

        Set<String> setPrefix3_4_7 = new HashSet<>(prefix3_4_7.size());
        setPrefix3_4_7.addAll(prefix3_4_7);

        /*Set<String> setPrefix3_4 = new HashSet<>(prefix3_4.size());
        setPrefix3_4.addAll(prefix3_4);
        Set<String> setPrefix3_5 = new HashSet<>(prefix3_5.size());
        setPrefix3_5.addAll(prefix3_5);
        Set<String> setPrefix3_6 = new HashSet<>(prefix3_6.size());
        setPrefix3_6.addAll(prefix3_6);
        Set<String> setPrefix3_7 = new HashSet<>(prefix3_7.size());
        setPrefix3_7.addAll(prefix3_7);
        Set<String> setPrefix3_8 = new HashSet<>(prefix3_8.size());
        setPrefix3_8.addAll(prefix3_8);*/

        Set<String> setSuffix3_8Plus = new HashSet<>(suffix3_8Plus.size());
        setSuffix3_8Plus.addAll(suffix3_8Plus);
        Set<String> setSuffix3_5_7 = new HashSet<>(suffix3_5_7.size());
        setSuffix3_5_7.addAll(suffix3_5_7);

        /*Set<String> setSuffix3_4 = new HashSet<>(suffix3_4.size());
        setSuffix3_4.addAll(suffix3_4);
        Set<String> setSuffix3_5 = new HashSet<>(suffix3_5.size());
        setSuffix3_5.addAll(suffix3_5);
        Set<String> setSuffix3_6 = new HashSet<>(suffix3_6.size());
        setSuffix3_6.addAll(suffix3_6);
        Set<String> setSuffix3_7 = new HashSet<>(suffix3_7.size());
        setSuffix3_7.addAll(suffix3_7);
        Set<String> setSuffix3_8 = new HashSet<>(suffix3_8.size());
        setSuffix3_8.addAll(suffix3_8);*/

        /*Set<String> setPrefix456 = new HashSet<>(prefix456.size());
        setPrefix456.addAll(prefix456);
        Set<String> setPrefix567 = new HashSet<>(prefix567.size());
        setPrefix567.addAll(prefix567);*/
        Set<String> setPrefix678 = new HashSet<>(prefix678.size());
        setPrefix678.addAll(prefix678);

        List<String> dd = loadFile(releasePath + "doubleDouble.txt", false/*doSort*/);
        Set<String> setDd = new HashSet<>(dd.size());
        setDd.addAll(dd);
        List<String> beforeDouble = loadFile(releasePath + "beforeDouble.txt", false/*doSort*/);
        Set<String> setBd = new HashSet<>(beforeDouble.size());
        setBd.addAll(beforeDouble);
        List<String> doubleAfter = loadFile(releasePath + "doubleAfter.txt", false/*doSort*/);
        Set<String> setDa = new HashSet<>(doubleAfter.size());
        setDa.addAll(doubleAfter);
        List<String> preBeforeDouble = loadFile(releasePath + "preBeforeDouble.txt", false/*doSort*/);
        Set<String> setPbd = new HashSet<>(preBeforeDouble.size());
        setPbd.addAll(preBeforeDouble);
        List<String> doublePostAfter = loadFile(releasePath + "doublePostAfter.txt", false/*doSort*/);
        Set<String> setDpa = new HashSet<>(doublePostAfter.size());
        setDpa.addAll(doublePostAfter);

        List<String> bloomPositive = new ArrayList<>();

        int all = 0;
        int all4_20 = 0;
        int correct = 0;
        int incorrect = 0;

        int bloomCnt = 0;
        int bloomPositiveCnt = 0;
        int bloomNegativeCnt = 0;
        int bloomDollar = 0;
        Map<Integer, Integer> bloomDollarLen = new TreeMap<>();

        int invalid3Cnt = 0;
        //int invalid2Cnt = 0;

        int suffix3_8PlusCnt = 0;
        int suffix3_5_7Cnt = 0;
        int prefix3_4_7Cnt = 0;
        int prefix4Cnt = 0;

        //int prefix456Cnt = 0;
        //int prefix567Cnt = 0;
        int prefix678Cnt = 0;

        int ddCnt = 0;
        int beforeDoubleCnt = 0;
        int doubleAfterCnt = 0;
        int preBeforeDoubleCnt = 0;
        int doublePostAfterCnt = 0;

        List<String> answerYes = new ArrayList<>();
        List<String> answerNo = new ArrayList<>();

        for (String s : testLst) {
            s = s.trim();
            if (s.isEmpty()) continue;

            all++;
            final boolean endsWithDollar;
            if (s.endsWith("'s")) {
                s = s.substring(0, s.length() - 2) + '$';
                endsWithDollar = true;
            } else {
                endsWithDollar = false;
            }

            if (s.indexOf('\'') >= 0) { // quotes dictionary
                if (wordsWithQuotes.indexOf(s) >= 0) {
                    correct++;
                    answerYes.add(s);
                } else {
                    incorrect++;
                    answerNo.add(s);
                }
                continue;
            }
            if (s.length() == 1) { // a-z OK
                char ch = s.charAt(0);
                if (ch >= 'a' && ch <= 'z') {
                    correct++;
                    answerYes.add(s);
                } else {
                    incorrect++;
                    answerNo.add(s);
                }
                continue;
            }
            if (s.length() == 2 && endsWithDollar) { // a$-z$ OK
                correct++;
                answerYes.add(s);
                continue;
            }
            if (s.length() == 2) {
                if (subdict2.indexOf(s) >= 0) {
                    correct++;
                    answerYes.add(s);
                } else {
                    incorrect++;
                    answerNo.add(s);
                }
                continue;
            }
            if (s.length() == 3 && endsWithDollar) {
                if (subdict3DollarOnly.indexOf(s) >= 0) {
                    correct++;
                    answerYes.add(s);
                } else {
                    incorrect++;
                    answerNo.add(s);
                }
                continue;
            }
            if (s.length() == 3) {
                if (subdict3.indexOf(s) >= 0) {
                    correct++;
                    answerYes.add(s);
                } else {
                    incorrect++;
                    answerNo.add(s);
                }
                continue;
            }
            if (s.length() == 4 && endsWithDollar) {
                if (subdict4DollarOnly.indexOf(s) >= 0) {
                    correct++;
                    answerYes.add(s);
                } else {
                    incorrect++;
                    answerNo.add(s);
                }
                continue;
            }

            if (s.length() == 20 && !endsWithDollar) {
                if (subdict21Plus.indexOf(s) >= 0) {
                    correct++;
                    answerYes.add(s);
                    continue;
                }
            }
            if (s.length() >= 21) {
                if (subdict21Plus.indexOf(s) >= 0) {
                    correct++;
                    answerYes.add(s);
                } else {
                    incorrect++;
                    answerNo.add(s);
                }
                continue;
            }

            /*DoubleStat dStat = doubleStat(s);
            if (dStat.doubleDouble != null) {
                if (!setDd.contains(dStat.doubleDouble)) {
                    incorrect++;
                    ddCnt++;
                    answerNo.add(s);
                    continue;
                }
            }
            if (dStat.beforeDouble != null) {
                if (!setBd.contains(dStat.beforeDouble)) {
                    incorrect++;
                    beforeDoubleCnt++;
                    answerNo.add(s);
                    continue;
                }
            }*/
            /*if (dStat.doubleAfter != null) {
                if (!setDa.contains(dStat.doubleAfter)) {
                    incorrect++;
                    doubleAfterCnt++;
                    continue;
                }
            }
            if (dStat.preBeforeDouble != null) {
                if (!setPbd.contains(dStat.preBeforeDouble)) {
                    incorrect++;
                    preBeforeDoubleCnt++;
                    continue;
                }
            }
            if (dStat.doublePostAfter != null) {
                if (!setDpa.contains(dStat.doublePostAfter)) {
                    incorrect++;
                    doublePostAfterCnt++;
                    continue;
                }
            }*/

            all4_20++;

            int suffixIdx = endsWithDollar ? s.length() - 4 : s.length() - 3;
            int len = suffixIdx + 3;

            if (len >= 4 && len <= 7) {
                String pre3 = s.substring(0, 3);
                if (!setPrefix3_4_7.contains(pre3)) {
                    incorrect++;
                    prefix3_4_7Cnt++;
                    answerNo.add(s);
                    continue;
                }
            }

            if (len >= 8) {
                String pre4 = s.substring(0, 4);
                if (!setPrefix4.contains(pre4)) {
                    incorrect++;
                    prefix4Cnt++;
                    answerNo.add(s);
                    continue;
                }
            }

            /*Set<String> setPrefixByLen = null;
            if (len >= 8) setPrefixByLen = setPrefix3_8;
            else {
                switch (len) {
                case 4:
                    setPrefixByLen = setPrefix3_4;
                    break;
                case 5:
                    setPrefixByLen = setPrefix3_5;
                    break;
                case 6:
                    setPrefixByLen = setPrefix3_6;
                    break;
                case 7:
                    setPrefixByLen = setPrefix3_7;
                    break;
                }
            }
            if (!setPrefixByLen.contains(prefix)) {
                incorrect++;
                prefix3Cnt++;
                continue;
            }*/

            final String body = suffixIdx > 3 ? s.substring(3, suffixIdx) : "";
            String suffix = s.substring(suffixIdx, suffixIdx + 3);
            if (len >= 8 && !setSuffix3_8Plus.contains(suffix)) {
                incorrect++;
                suffix3_8PlusCnt++;
                answerNo.add(s);
                continue;
            }
            if (len >= 5 && len <= 7 && !setSuffix3_5_7.contains(suffix)) {
                incorrect++;
                suffix3_5_7Cnt++;
                answerNo.add(s);
                continue;
            }

            /*Set<String> setSuffixByLen = null;
            if (len >= 8) setSuffixByLen = setSuffix3_8;
            else {
                switch (len) {
                case 4:
                    setSuffixByLen = setSuffix3_4;
                    break;
                case 5:
                    setSuffixByLen = setSuffix3_5;
                    break;
                case 6:
                    setSuffixByLen = setSuffix3_6;
                    break;
                case 7:
                    setSuffixByLen = setSuffix3_7;
                    break;
                }
            }
            if (!setSuffixByLen.contains(suffix)) {
                incorrect++;
                suffix3Cnt++;
                continue;
            }*/

            /*if (body.length() >= 3) {
                String pre456 = body.substring(0, 3);
                if (!setPrefix456.contains(pre456)) {
                    incorrect++;
                    prefix456Cnt++;
                    continue;
                }
            }
            if (body.length() >= 4) {
                String pre567 = body.substring(1, 4);
                if (!setPrefix567.contains(pre567)) {
                    incorrect++;
                    prefix567Cnt++;
                    continue;
                }
            }*/
            if (body.length() >= 5) {
                /*String pre678 = body.substring(2, 5);
                if (!setPrefix678.contains(pre678)) {
                    incorrect++;
                    prefix678Cnt++;
                    continue;
                }*/
            }

            /*if (body.length() >= 3) {
                boolean ok = true;
                for (String j : invalid3) {
                    if (body.contains(j)) {
                        ok = false;
                        break;
                    }
                }
                if (!ok) {
                    incorrect++;
                    invalid3Cnt++;
                    continue;
                }
            }*/
            if (body.length() >= 2) {
                /*boolean ok = true;
                for (String j : invalid2) {
                    if (body.contains(j)) {
                        ok = false;
                        break;
                    }
                }
                if (!ok) {
                    incorrect++;
                    invalid2Cnt++;
                    continue;
                }*/
            }

            if (endsWithDollar) {

                /*if (body.length() >= 4) {
                    String pre567 = body.substring(1, 4);
                    if (!setPrefix567Dollar.contains(pre567)) {
                        incorrect++;
                        prefix567DollarCnt++;
                        continue;
                    }
                }*/

                if (body.length() >= 3) {
                    /*boolean ok = true;
                    for (String j : invalid3Dollar) {
                        if (body.contains(j)) {
                            ok = false;
                            break;
                        }
                    }
                    if (!ok) {
                        incorrect++;
                        invalid3DollarCnt++;
                        continue;
                    }*/
                }
                if (body.length() >= 2) {
                    /*boolean ok = true;
                    for (String j : invalid2Dollar) {
                        if (body.contains(j)) {
                            ok = false;
                            break;
                        }
                    }
                    if (!ok) {
                        incorrect++;
                        invalid2DollarCnt++;
                        continue;
                    }*/
                }

                //if (setPrefix3Dollar.contains(prefix) && setSuffix3Dollar.contains(suffix)) {

//                    s = s.substring(0, s.length() - 1);
//                    bloomDollar++;
//                    Integer cnt = bloomDollarLen.get(s.length());
//                    if (cnt == null) cnt = 1;
//                    else cnt++;
//                    bloomDollarLen.put(s.length(), cnt);

                /*} else {
                    incorrect++;
                    if (setPrefix3Dollar.contains(prefix)) incorrectDollarSuffix++;
                    else incorrectDollarPrefix++;
                    continue;
                }*/
            }

            bloomCnt++;
            int h = calcHash(s.getBytes(dictCharset));
            h = reduceHashToXX(h);
            if (bloom.get(h)) {
                bloomPositiveCnt++;
                bloomPositive.add(s);
                answerYes.add(s);
            } else {
                bloomNegativeCnt++;
                answerNo.add(s);
            }
        }
        //logLn(String.valueOf(calcHash("goga's".getBytes())));
        logLn("Total lines: " + all + "; 4-20 lines: " + all4_20);
        logLn("Correct: " + correct + "; Incorrect: " + incorrect); // + "; Bloom$: " + bloomDollar);
        logLn("Bloom count: " + bloomCnt + "; Positive: " + bloomPositiveCnt + "; Negative: " + bloomNegativeCnt);
        logLn("Invalid3: " + invalid3Cnt); // + "; Invalid2: " + invalid2Cnt);
        logLn("Prefix3-4-7: " + prefix3_4_7Cnt
                + "; Suffix3-5-7: " + suffix3_5_7Cnt
                + "; Prefix4-8+: " + prefix4Cnt
                + "; Suffix3-8+: " + suffix3_8PlusCnt
                );
        //logLn("Prefix456: " + prefix456Cnt + "; Prefix567: " + prefix567Cnt);
        logLn("Prefix678: " + prefix678Cnt);
        logLn("DoubleDouble: " + ddCnt + "; BeforeDouble: " + beforeDoubleCnt
                + "; DoubleAfter: " + doubleAfterCnt);
        logLn("PreBeforeDouble: " + preBeforeDoubleCnt + "; DoublePostAfter: " + doublePostAfterCnt);

        /*logLn("Bloom$ details:");
        for (Entry<Integer, Integer> j : bloomDollarLen.entrySet()) {
            logLn(j.getKey() + " = " + j.getValue());
        }*/

        //Files.write(Paths.get(outFn), bloomPositive);

        logLn("Yes: " + answerYes.size());
        //for (String str : answerYes) logLn(str);
        logLn("No: " + answerNo.size());
        //for (String str : answerNo) logLn(str);
    }

    private static int calcHash(byte[] data) {

        return FNV1a.hash32(data);

        // See http://papa.bretmulvey.com/post/124027987928/hash-functions
        /*final int p = 16777619;
        int hash = Integer.parseUnsignedInt("2166136261");
        for (byte b : data) {
            hash = (hash ^ b) * p;
        }
        hash += hash << 13;
        hash ^= hash >> 7;
        hash += hash << 3;
        hash ^= hash >> 17;
        hash += hash << 5;
        return hash;*/
    }

    private static final int BIT_SIZE = 19;
    private static final int BIT_MAX =  429000; //(int) Math.pow(2, BIT_SIZE);
    private static final int BIT_MASK = 0x7ffff;
    private static final int HASH_SEED = 1105959967;

    private static final int FNV1_32_INIT = 0x811c9dc5;
    private static final int FNV1_PRIME_32 = 16777619;

    private static final long RETRY_LEVEL_LONG = (0xffffffffL / BIT_MAX) * BIT_MAX;
    private static final int RETRY_LEVEL = Integer.parseUnsignedInt(
            Long.toUnsignedString(RETRY_LEVEL_LONG));

    private static int reduceHashToXX(int hash) {
        //int hiBits = hash >>> (32 - BIT_SIZE);
        //int n = (hash & BIT_MASK) ^ hiBits;

        /*int cmp = Integer.compareUnsigned(hash, RETRY_LEVEL);
        while (cmp >= 0) {
            int h = hash * FNV1_PRIME_32;
            long l = Long.parseUnsignedLong(Integer.toUnsignedString(h));
            l += FNV1_32_INIT;
            hash = (int) l;
            cmp = Integer.compareUnsigned(hash, RETRY_LEVEL);
        }*/

        int n = Integer.remainderUnsigned(hash, BIT_MAX); // if BIT_MAX is not 2^n OR good in case BIT_SIZE < 16

        return n;
    }

    private static final Charset dictCharset = Charset.forName("UTF-8"); //"US-ASCII");

    private static void logLn(String s) {
        System.out.println(s);
    }
}
