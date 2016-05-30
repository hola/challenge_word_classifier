/**
 * MDAG is a Java library capable of constructing character-sequence-storing,
 * directed acyclic graphs of minimal size.
 *
 *  Copyright (C) 2012 Kevin Lawson <Klawson88@gmail.com>
 *
 * Licensed to the Apache Software Foundation (ASF) under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * The ASF licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.quinto.dawg;

import org.quinto.dawg.util.Permutations;
import org.quinto.dawg.util.Serializer;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.NavigableSet;
import java.util.NoSuchElementException;
import java.util.Random;
import java.util.Set;
import java.util.TreeSet;
import static org.junit.Assert.assertArrayEquals;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import org.junit.Test;

public class DAWGSimpleTest {
    private static final Random RANDOM = new Random(System.nanoTime());
    
    @Test
    public void compress() {
        String words[] = {
            "a", "xes", "xe", "as"
        };
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.addAll(words);
        CompressedDAWGSet cdawg = dawg.compress();
        if (cdawg instanceof CompressedDAWGSetLargeAlphabet) {
            assertArrayEquals(new int[]{
                '\0', 3,                                        2,
                'a',  9  | CompressedDAWGNode.ACCEPT_NODE_MASK, 1,
                'x',  12,                                       1,
                's',  12 | CompressedDAWGNode.ACCEPT_NODE_MASK, 0,
                'e',  9  | CompressedDAWGNode.ACCEPT_NODE_MASK, 1
            }, cdawg.outgoingData);
        } else {
            assertArrayEquals(new int[]{
                2,                                       9,
                6 | CompressedDAWGNode.ACCEPT_NODE_MASK, 4,
                8,                                       2,
                8 | CompressedDAWGNode.ACCEPT_NODE_MASK, 0,
                6 | CompressedDAWGNode.ACCEPT_NODE_MASK, 4
            }, cdawg.outgoingData);
        }
        assertEquals(cdawg, dawg.compress());
        
        assertEquals(1, cdawg.getNodesBySuffix("a").size());
        assertEquals(1, cdawg.getNodesBySuffix("s").size());
        assertEquals(1, cdawg.getNodesBySuffix("e").size());
        assertEquals(0, cdawg.getNodesBySuffix("x").size());
        assertEquals(1, cdawg.getNodesBySuffix("as").size());
        assertEquals(1, cdawg.getNodesBySuffix("es").size());
        assertEquals(1, cdawg.getNodesBySuffix("xe").size());
        assertEquals(1, cdawg.getNodesBySuffix("xes").size());
        assertEquals(0, cdawg.getNodesBySuffix("b").size());
        assertEquals(0, cdawg.getNodesBySuffix("bb").size());
        assertEquals(0, cdawg.getNodesBySuffix("bbb").size());
        assertEquals(0, cdawg.getNodesBySuffix("bbbb").size());
        assertEquals(0, cdawg.getNodesBySuffix("xs").size());
        assertEquals(0, cdawg.getNodesBySuffix("xb").size());
        assertEquals(0, cdawg.getNodesBySuffix("bs").size());
        assertEquals(0, cdawg.getNodesBySuffix("aes").size());
        assertEquals(0, cdawg.getNodesBySuffix("bes").size());
        assertEquals(0, cdawg.getNodesBySuffix("axes").size());
        assertEquals(0, cdawg.getNodesBySuffix("bxes").size());
        
        Set<String> expected = new HashSet<String>(Arrays.asList("as", "xes"));
        Set<String> actual = new HashSet<String>();
        for (String word : dawg.getStringsEndingWith("s"))
            actual.add(word);
        assertEquals(expected, actual);
        
        actual = new HashSet<String>();
        for (String word : cdawg.getStringsEndingWith("s"))
            actual.add(word);
        assertEquals(expected, actual);
    }
    
    @Test
    public void addSimple() {
        String words[] = {
            "a", "xes", "xe", "xs"
        };
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.addAll(words);
        Arrays.sort(words);
        CompressedDAWGSet cdawg = dawg.compress();
        if (cdawg instanceof CompressedDAWGSetLargeAlphabet) {
            assertArrayEquals(new int[]{
                '\0', 3,                                        2,
                'a',  9  | CompressedDAWGNode.ACCEPT_NODE_MASK, 0,
                'x',  9,                                        2,
                'e',  15 | CompressedDAWGNode.ACCEPT_NODE_MASK, 1,
                's',  9  | CompressedDAWGNode.ACCEPT_NODE_MASK, 0,
                's',  9  | CompressedDAWGNode.ACCEPT_NODE_MASK, 0
            }, cdawg.outgoingData);
        } else {
            assertArrayEquals(new int[]{
                2,                                        9,
                6  | CompressedDAWGNode.ACCEPT_NODE_MASK, 0,
                6,                                        6,
                10 | CompressedDAWGNode.ACCEPT_NODE_MASK, 4,
                6  | CompressedDAWGNode.ACCEPT_NODE_MASK, 0,
                6  | CompressedDAWGNode.ACCEPT_NODE_MASK, 0
            }, cdawg.outgoingData);
        }
        assertEquals(cdawg, dawg.compress());
        
        assertEquals(2, cdawg.getNodesBySuffix("s").size());
        assertEquals(1, cdawg.getNodesBySuffix("xs").size());
        assertEquals(1, cdawg.getNodesBySuffix("es").size());
        assertEquals(1, cdawg.getNodesBySuffix("xes").size());

        int i = 0;
        for (String word : dawg.getAllStrings())
            assertEquals(words[i++], word);
        assertEquals(words.length, i);

        i = 0;
        for (String word : cdawg.getAllStrings())
            assertEquals(words[i++], word);
        assertEquals(words.length, i);

        String wordsXe[] = {"xe", "xes"};
        i = 0;
        for (String word : dawg.getStringsStartingWith("xe"))
            assertEquals(wordsXe[i++], word);
        
        i = 0;
        for (String word : cdawg.getStringsStartingWith("xe"))
            assertEquals(wordsXe[i++], word);

        String wordsS[] = {"xes", "xs"};
        Set<String> expected = new HashSet<String>(Arrays.asList(wordsS));
        Set<String> actual = new HashSet<String>();
        for (String word : dawg.getStringsEndingWith("s"))
            actual.add(word);
        assertEquals(expected, actual);
        
        actual = new HashSet<String>();
        for (String word : cdawg.getStringsEndingWith("s"))
            actual.add(word);
        assertEquals(expected, actual);
        
        assertEquals(4, dawg.size());
        assertEquals(4, dawg.getNodeCount());
        assertEquals(5, dawg.getTransitionCount());
        
        assertEquals(4, cdawg.size());
        assertEquals(4, cdawg.getNodeCount());
        assertEquals(5, cdawg.getTransitionCount());
        
        // Non-existent.
        dawg.remove("b");
        assertEquals(cdawg, dawg.compress());
        cdawg = dawg.compress();

        i = 0;
        for (String word : dawg.getAllStrings())
            assertEquals(words[i++], word);
        assertEquals(words.length, i);

        i = 0;
        for (String word : cdawg.getAllStrings())
            assertEquals(words[i++], word);
        assertEquals(words.length, i);
        
        assertEquals(4, dawg.size());
        assertEquals(4, dawg.getNodeCount());
        assertEquals(5, dawg.getTransitionCount());
        
        assertEquals(4, cdawg.size());
        assertEquals(4, cdawg.getNodeCount());
        assertEquals(5, cdawg.getTransitionCount());
        
        dawg.remove("");
        cdawg = dawg.compress();

        i = 0;
        for (String word : dawg.getAllStrings())
            assertEquals(words[i++], word);
        assertEquals(words.length, i);

        i = 0;
        for (String word : cdawg.getAllStrings())
            assertEquals(words[i++], word);
        assertEquals(words.length, i);
        
        assertEquals(4, dawg.size());
        assertEquals(4, dawg.getNodeCount());
        assertEquals(5, dawg.getTransitionCount());
        
        assertEquals(4, cdawg.size());
        assertEquals(4, cdawg.getNodeCount());
        assertEquals(5, cdawg.getTransitionCount());
    }
  
    @Test
    public void addCasual() {
        String words[] = {
            "assiez",
            "assions",
            "eriez",
            "erions",
            "eront",
            "iez",
            "ions"
        };
        Set<String> expected = new HashSet<String>(Arrays.asList(words));
        for (String w[] : Permutations.from(words)) {
            ModifiableDAWGSet dawg = new ModifiableDAWGSet();
            dawg.addAll(w);
            CompressedDAWGSet cdawg = dawg.compress();
            int i = 0;
            for (String s : dawg)
                assertEquals(words[i++], s);
            assertEquals(words.length, i);
            
            i = 0;
            for (String s : cdawg)
                assertEquals(words[i++], s);
            assertEquals(words.length, i);

            Set<String> actual = new HashSet<String>();
            for (String word : dawg.getStringsEndingWith(""))
                actual.add(word);
            assertEquals(expected, actual);

            actual = new HashSet<String>();
            for (String word : cdawg.getStringsEndingWith(""))
                actual.add(word);
            assertEquals(expected, actual);
        }
    }
  
    @Test
    public void addCasualWithBlank() {
        String words[] = {
            "",
            "assiez",
            "assions",
            "eriez",
            "erions",
            "eront",
            "iez",
            "ions"
        };
        Set<String> expected = new HashSet<String>(Arrays.asList(words));
        String removingWord = words[3];
        Set<String> expectedRemoveOne = new HashSet<String>();
        for (String word : words)
            if (!word.equals(removingWord))
                expectedRemoveOne.add(word);
        Set<String> expectedRemoveBlank = new HashSet<String>();
        for (String word : words)
            if (!word.isEmpty())
                expectedRemoveBlank.add(word);
        for (String w[] : Permutations.from(words)) {
            ModifiableDAWGSet dawg = new ModifiableDAWGSet();
            dawg.addAll(w);
            CompressedDAWGSet cdawg = dawg.compress();
            int i = 0;
            for (String s : dawg)
                assertEquals(words[i++], s);
            assertEquals(words.length, i);
            
            List<String> list = new ArrayList<String>();
            for (String s : dawg.getStrings("", null, null, true, null, false, null, false))
                list.add(s);
            Collections.reverse(list);
            assertEquals(Arrays.asList(words), list);
            
            i = 0;
            for (String s : cdawg)
                assertEquals(words[i++], s);
            assertEquals(words.length, i);

            Set<String> actual = new HashSet<String>();
            for (String word : dawg.getStringsEndingWith(""))
                actual.add(word);
            assertEquals(expected, actual);

            actual = new HashSet<String>();
            for (String word : cdawg.getStringsEndingWith(""))
                actual.add(word);
            assertEquals(expected, actual);
            
            dawg.remove(removingWord);
            cdawg = dawg.compress();
            
            i = 0;
            for (String s : dawg) {
                if (words[i].equals(removingWord))
                    i++;
                assertEquals(words[i++], s);
            }
            assertEquals(words.length, i);
            
            i = 0;
            for (String s : cdawg) {
                if (words[i].equals(removingWord))
                    i++;
                assertEquals(words[i++], s);
            }
            assertEquals(words.length, i);

            actual = new HashSet<String>();
            for (String word : dawg.getStringsEndingWith(""))
                actual.add(word);
            assertEquals(expectedRemoveOne, actual);

            actual = new HashSet<String>();
            for (String word : cdawg.getStringsEndingWith(""))
                actual.add(word);
            assertEquals(expectedRemoveOne, actual);
            
            dawg = new ModifiableDAWGSet();
            dawg.addAll(w);
            dawg.remove("");
            cdawg = dawg.compress();
            
            i = 0;
            for (String s : dawg) {
                if (words[i].isEmpty())
                    i++;
                assertEquals(words[i++], s);
            }
            assertEquals(words.length, i);
            
            i = 0;
            for (String s : cdawg) {
                if (words[i].isEmpty())
                    i++;
                assertEquals(words[i++], s);
            }
            assertEquals(words.length, i);

            actual = new HashSet<String>();
            for (String word : dawg.getStringsEndingWith(""))
                actual.add(word);
            assertEquals(expectedRemoveBlank, actual);

            actual = new HashSet<String>();
            for (String word : cdawg.getStringsEndingWith(""))
                actual.add(word);
            assertEquals(expectedRemoveBlank, actual);
        }
    }
    
    @Test
    public void getStrings() {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        String words[] = {
            "aa", "aaa", "aaa", "aab",
            "baaaa", "baba", "babb", "babbc",
            "bac", "baca", "bacb", "bacba",
            "bada", "badb", "badbc", "badd",
            "bb", "bcd", "cac", "cc"
        };
        dawg.addAll(words);
        
        List<String> expected;
        List<String> actual;
        
        expected = Arrays.asList("bac", "baca", "bacb", "bacba");
        for (int desc = 0; desc < 2; desc++) {
            if (desc == 1)
                Collections.reverse(expected);
            actual = new ArrayList<String>();
            for (String word : dawg.getStrings("ba", null, null, desc == 1, "bac", true, "bad", true))
                actual.add(word);
            assertEquals(expected, actual);
        }
        
        expected = Arrays.asList("bac", "baca", "bacb", "bacba", "bada", "badb");
        for (int desc = 0; desc < 2; desc++) {
            if (desc == 1)
                Collections.reverse(expected);
            actual = new ArrayList<String>();
            for (String word : dawg.getStrings("ba", null, null, desc == 1, "bac", true, "badb", true))
                actual.add(word);
            assertEquals(expected, actual);
        }
        
        expected = Arrays.asList("bacb", "bacba", "bada", "badb", "badbc", "badd");
        for (int desc = 0; desc < 2; desc++) {
            if (desc == 1)
                Collections.reverse(expected);
            actual = new ArrayList<String>();
            for (String word : dawg.getStrings("ba", null, null, desc == 1, "bacb", true, "badd", true))
                actual.add(word);
            assertEquals(expected, actual);
        }
        
        expected = Arrays.asList("bac", "baca", "bacb", "bacba", "bada", "badb", "badbc");
        for (int desc = 0; desc < 2; desc++) {
            if (desc == 1)
                Collections.reverse(expected);
            actual = new ArrayList<String>();
            for (String word : dawg.getStrings("ba", null, null, desc == 1, "bac", true, "badc", true))
                actual.add(word);
            assertEquals(expected, actual);
        }
    }
    
    @Test
    public void to() {
        String words[] = {"", "b"};
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.addAll(words);
        
        List<String> expected = Collections.EMPTY_LIST;
        List<String> actual = new ArrayList<String>();
        for (String word : dawg.getStrings("", null, null, false, "", false, "a", false))
            actual.add(word);
        assertEquals(expected, actual);
    }
    
    @Test
    public void range() {
        String words[] = {"hddb", "hddd", "hddf", "hddh", "hdf", "hdfb", "hdfd", "hdff", "hdfh", "hdh", "hdhb", "hdhd", "hdhf", "hdhh", "hf", "hfb", "hfbb", "hfbd", "hfbf", "hfbh", "hfd", "hfdb", "hfdd", "hfdf", "hfdh", "hff", "hffb", "hffd", "hfff", "hffh", "hfh", "hfhb", "hfhd", "hfhf", "hfhh"};
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.addAll(words);
        
        List<String> expected = Arrays.asList(words);
        List<String> actual = new ArrayList<String>();
        for (String word : dawg.getStrings("", null, null, false, "hdd", false, "hgecc", false))
            actual.add(word);
        assertEquals(expected, actual);
    }
    
    @Test
    public void rangeDesc() {
        String words[] = {"bhhh", "bhhf", "bhhd", "bhhb", "bhh", "bhfh", "bhff", "bhfd", "bhfb", "bhf", "bhdh", "bhdf", "bhdd", "bhdb", "bhd", "bhbh", "bhbf", "bhbd", "bhbb", "bhb", "bh", "bfhh", "bfhf", "bfhd", "bfhb", "bfh", "bffh", "bfff", "bffd", "bffb", "bff", "bfdh", "bfdf", "bfdd", "bfdb"};
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.addAll(words);
        
        List<String> expected = Arrays.asList(words);
        List<String> actual = new ArrayList<String>();
        for (String word : dawg.getStrings("", null, null, true, "bfd", false, "cdgd", false))
            actual.add(word);
        assertEquals(expected, actual);
    }
    
    @Test
    public void getStringsAll() {
        for (int attempt = 0; attempt < 5; attempt++) {
            NavigableSet<String> wordsSet = new TreeSet<String>();
            for (int i = 0; i < 625; i++)
                if (attempt < 2 || RANDOM.nextBoolean() || RANDOM.nextBoolean())
                    wordsSet.add(Integer.toString(i, 5).replace('1', 'b').replace('2', 'd').replace('3', 'f').replace('4', 'h').replace("0", ""));
            if (RANDOM.nextBoolean())
                wordsSet.add("");
            String words[] = wordsSet.toArray(new String[wordsSet.size()]);
            ModifiableDAWGSet dawg = new ModifiableDAWGSet(wordsSet);
            CompressedDAWGSet cdawg = dawg.compress();
            
            NavigableSet<String> patternsSet = new TreeSet<String>();
            while (patternsSet.size() < 4) {
                int i = RANDOM.nextInt(100000);
                char s[] = String.valueOf(i).replace("0", "").toCharArray();
                for (int j = 0; j < s.length; j++)
                    s[j] = (char)(s[j] - '1' + 'a');
                String word = String.valueOf(s);
                if (!wordsSet.contains(word))
                    patternsSet.add(word);
            }
            patternsSet.add("");
            for (int i = 0; i < 4; i++)
                patternsSet.add(words[RANDOM.nextInt(words.length)]);
            String patterns[] = patternsSet.toArray(new String[patternsSet.size() + 1]);
            
            for (String prefix : patterns) {
                for (String substring : patterns) {
                    for (String suffix : patterns) {
                        for (String from : patterns) {
                            for (String to : patterns) {
                                for (int inclFrom = 0; inclFrom < 2; inclFrom++) {
                                    boolean inclF = inclFrom == 1;
                                    for (int inclTo = 0; inclTo < 2; inclTo++) {
                                        boolean inclT = inclTo == 1;
                                        for (int desc = 0; desc < 2; desc++) {
                                            boolean descending = desc == 1;
                                            List<String> expected = getStrings(words, prefix, substring, suffix, descending, from, inclF, to, inclT);
                                            List<String> actual = new ArrayList<String>();
                                            for (String s : dawg.getStrings(prefix, substring, suffix, descending, from, inclF, to, inclT))
                                                actual.add(s);
                                            // Suffix search returns words with no particular order.
                                            if ((prefix == null || prefix.isEmpty()) && suffix != null && !suffix.isEmpty()) {
                                                Collections.sort(actual);
                                                if (descending)
                                                    Collections.reverse(actual);
                                            }
                                            assertEquals(/*"Prefix: " + prefix + ", substring: " + substring + ", suffix: " + suffix + ", " + (inclF ? "[ " : "( ") + from + " .. " + to + (inclT ? " ]" : " )") + ", " + (descending ? "desc" : "asc"),*/ expected, actual);

                                            actual = new ArrayList<String>();
                                            for (String s : cdawg.getStrings(prefix, substring, suffix, descending, from, inclF, to, inclT))
                                                actual.add(s);
                                            // Suffix search returns words with no particular order.
                                            if ((prefix == null || prefix.isEmpty()) && suffix != null && !suffix.isEmpty()) {
                                                Collections.sort(actual);
                                                if (descending)
                                                    Collections.reverse(actual);
                                            }
                                            assertEquals(/*"Prefix: " + prefix + ", substring: " + substring + ", suffix: " + suffix + ", " + (inclF ? "[ " : "( ") + from + " .. " + to + (inclT ? " ]" : " )") + ", " + (descending ? "desc" : "asc"),*/ expected, actual);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    
    private static List<String> getStrings(String words[], String prefix, String substring, String suffix, boolean desc, String from, boolean inclFrom, String to, boolean inclTo) {
        List<String> ret = new ArrayList<String>();
        for (String word : words) {
            if (prefix != null && !word.startsWith(prefix) || substring != null && !word.contains(substring) || suffix != null && !word.endsWith(suffix))
                continue;
            if (from != null) {
                int cmp = word.compareTo(from);
                if (cmp < 0 || cmp == 0 && !inclFrom)
                    continue;
            }
            if (to != null) {
                int cmp = word.compareTo(to);
                if (cmp > 0 || cmp == 0 && !inclTo)
                    continue;
            }
            ret.add(word);
        }
        if (desc)
            Collections.reverse(ret);
        return ret;
    }

    @Test
    public void add() throws IOException, ClassNotFoundException {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        String words[] = {
            "aient", "ais", "ait", "ai", "ant",
            "assent", "asses", "asse", "assiez", "assions", "as", "a",
            "ent", "eraient", "erais", "erait", "erai", "eras", "era",
            "erez", "eriez", "erions",
            "erons", "eront", "er", "es", "ez", "e",
            "iez", "ions", "ons", "qmes", "qtes", "qt",
            "wrent", "xes", "xe", "xs", "x"
        };
        dawg.addAll(words);
        CompressedDAWGSet cdawg = dawg.compress();

        Arrays.sort(words);
        int i = 0;
        for (String word : dawg)
            assertEquals(words[i++], word);
        assertEquals(words.length, i);
        
        assertArrayEquals(words, dawg.toArray());
        assertArrayEquals(words, cdawg.toArray());
        assertArrayEquals(words, dawg.toArray(new String[2]));
        assertArrayEquals(words, cdawg.toArray(new String[2]));
        assertArrayEquals(words, dawg.toArray(new String[words.length]));
        assertArrayEquals(words, cdawg.toArray(new String[words.length]));
        assertArrayEquals(Arrays.copyOf(words, words.length + 2), dawg.toArray(new String[words.length + 2]));
        assertArrayEquals(Arrays.copyOf(words, words.length + 2), cdawg.toArray(new String[words.length + 2]));
        
        i = 0;
        for (String word : cdawg)
            assertEquals(words[i++], word);
        assertEquals(words.length, i);

        String wordsAs[] = {"as", "asse", "assent", "asses", "assiez", "assions"};
        i = 0;
        for (String word : dawg.getStringsStartingWith("as"))
            assertEquals(wordsAs[i++], word);
        
        assertTrue(dawg.containsAll(Arrays.asList(wordsAs)));
        assertTrue(cdawg.containsAll(Arrays.asList(wordsAs)));
        assertTrue(dawg.containsAll(Arrays.asList(words)));
        assertTrue(cdawg.containsAll(Arrays.asList(words)));
        assertFalse(dawg.containsAll(Arrays.asList("asses", "assess")));
        assertFalse(cdawg.containsAll(Arrays.asList("asses", "assess")));
        
        i = 0;
        for (String word : cdawg.getStringsStartingWith("as"))
            assertEquals(wordsAs[i++], word);

        String wordsOns[] = {"assions", "erions", "erons", "ions", "ons"};
        Set<String> expected = new HashSet<String>(Arrays.asList(wordsOns));
        Set<String> actual = new HashSet<String>();
        for (String word : dawg.getStringsEndingWith("ons"))
            actual.add(word);
        assertEquals(expected, actual);
        
        actual = new HashSet<String>();
        for (String word : cdawg.getStringsEndingWith("ons"))
            actual.add(word);
        assertEquals(expected, actual);

        String wordsXe[] = {"xe"};
        expected = new HashSet<String>(Arrays.asList(wordsXe));
        actual = new HashSet<String>();
        for (String word : dawg.getStringsEndingWith("xe"))
            actual.add(word);
        assertEquals(expected, actual);
        
        actual = new HashSet<String>();
        for (String word : cdawg.getStringsEndingWith("xe"))
            actual.add(word);
        assertEquals(expected, actual);
        
        assertEquals(25, dawg.getNodeCount());
        assertEquals(39, dawg.size());
        
        assertEquals(25, cdawg.getNodeCount());
        assertEquals(39, cdawg.size());
        
        int maxLength = 0;
        for (String s : words)
            if (maxLength < s.length())
                maxLength = s.length();
        assertEquals(maxLength, cdawg.getMaxLength(cdawg.getSourceNode(), 0));
        
        assertEquals(cdawg, Serializer.serializeAndRead(cdawg));
        
        ModifiableDAWGSet removed = cdawg.uncompress();
        removed.removeAll(Arrays.asList(wordsOns));
        assertFalse(removed.getStringsEndingWith("ons").iterator().hasNext());
        expected = new HashSet<String>(Arrays.asList(words));
        expected.removeAll(Arrays.asList(wordsOns));
        actual = new HashSet<String>();
        for (String word : removed)
            actual.add(word);
        assertEquals(expected, actual);
        
        ModifiableDAWGSet retained = cdawg.uncompress();
        retained.retainAll(Arrays.asList(wordsOns));
        expected = new HashSet<String>(Arrays.asList(words));
        expected.retainAll(Arrays.asList(wordsOns));
        actual = new HashSet<String>();
        for (String word : retained)
            actual.add(word);
        assertEquals(expected, actual);
        expected = actual;
        actual = new HashSet<String>();
        for (String word : retained.getStringsEndingWith("ons"))
            actual.add(word);
        assertEquals(expected, actual);
        
        dawg.clear();
        assertTrue(dawg.isEmpty());
        assertEquals(new ModifiableDAWGSet().compress(), dawg.compress());
        assertFalse(dawg.iterator().hasNext());
        assertFalse(dawg.getStringsEndingWith("a").iterator().hasNext());
        assertFalse(dawg.contains(""));
        assertFalse(dawg.contains("\0"));
        assertFalse(dawg.contains("a"));
        
        for (String removingWord : words) {
            dawg = cdawg.uncompress();
            dawg.remove(removingWord);
            assertEquals(words.length - 1, dawg.size());
            expected = new HashSet<String>(Arrays.asList(words));
            expected.remove(removingWord);
            actual = new HashSet<String>();
            for (String word : dawg)
                actual.add(word);
            assertEquals(expected, actual);
            
            actual = new HashSet<String>();
            dawg = cdawg.uncompress();
            for (Iterator<String> it = dawg.iterator(); it.hasNext();) {
                String word = it.next();
                if (word.equals(removingWord))
                    it.remove();
                else
                    actual.add(word);
            }
            assertEquals(expected, actual);
            actual = new HashSet<String>();
            for (String word : dawg)
                actual.add(word);
            assertEquals(expected, actual);
        }
    }

    @Test(expected = NoSuchElementException.class)
    public void empty() {
        DAWGSet dawg = new ModifiableDAWGSet();
        assertFalse(dawg.iterator().hasNext());
        assertFalse(dawg.getStringsEndingWith("a").iterator().hasNext());
        assertFalse(dawg.contains(""));
        assertFalse(dawg.contains("\0"));
        assertFalse(dawg.contains("a"));
        assertTrue(dawg.isEmpty());
        dawg.iterator().next();
    }

    @Test(expected = NoSuchElementException.class)
    public void emptyCompressed() throws IOException, ClassNotFoundException {
        CompressedDAWGSet dawg = new ModifiableDAWGSet().compress();
        assertEquals(0, dawg.getMaxLength(dawg.getSourceNode(), 0));
        assertFalse(dawg.contains(""));
        assertFalse(dawg.contains("\0"));
        assertFalse(dawg.contains("a"));
        assertFalse(dawg.iterator().hasNext());
        assertTrue(dawg.isEmpty());
        dawg.iterator().next();
        
        CompressedDAWGSet serialized = Serializer.serializeAndRead(dawg);
        assertTrue(serialized.isEmpty());
        assertEquals(dawg, serialized);
    }

    @Test(expected = NoSuchElementException.class)
    public void emptySuffix() {
        DAWGSet dawg = new ModifiableDAWGSet();
        assertFalse(dawg.getStringsEndingWith("").iterator().hasNext());
        dawg.getStringsEndingWith("").iterator().next();
    }

    @Test(expected = NoSuchElementException.class)
    public void emptySuffixCompressed() {
        DAWGSet dawg = new ModifiableDAWGSet().compress();
        assertFalse(dawg.getStringsEndingWith("").iterator().hasNext());
        dawg.getStringsEndingWith("").iterator().next();
    }

    @Test(expected = NoSuchElementException.class)
    public void emptyCollection() {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.addAll();
        assertFalse(dawg.contains(""));
        assertFalse(dawg.contains("\0"));
        assertFalse(dawg.contains("a"));
        assertFalse(dawg.getStringsEndingWith("").iterator().hasNext());
        dawg.getStringsEndingWith("").iterator().next();
    }

    @Test(expected = NoSuchElementException.class)
    public void emptyCollectionCompressed() {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.addAll();
        CompressedDAWGSet cdawg = dawg.compress();
        if (cdawg instanceof CompressedDAWGSetLargeAlphabet)
            assertArrayEquals(new int[]{0, 3, 0}, cdawg.outgoingData);
        else
            assertArrayEquals(new int[]{1}, cdawg.outgoingData);
        assertFalse(cdawg.contains(""));
        assertFalse(cdawg.contains("\0"));
        assertFalse(cdawg.contains("a"));
        assertFalse(cdawg.getStringsEndingWith("").iterator().hasNext());
        cdawg.getStringsEndingWith("").iterator().next();
    }

    @Test(expected = UnsupportedOperationException.class)
    public void clearCompressed() {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.addAll("a");
        CompressedDAWGSet cdawg = dawg.compress();
        cdawg.clear();
    }

    @Test
    public void file() throws IOException, ClassNotFoundException {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        FileInputStream fis = null;
        IOException ex = null;
        try {
            // Source: http://www.mieliestronk.com/wordlist.html
            fis = new FileInputStream("corncob_lowercase.txt");
            dawg.addAll(fis);
        } finally {
            if (fis != null) {
                try {
                    fis.close();
                } catch (IOException e) {
                    ex = e;
                }
            }
        }
        if (ex != null)
            throw ex;
        CompressedDAWGSet cdawg = dawg.compress();
        ModifiableDAWGSet udawg = cdawg.uncompress();
        
        int i = 0;
        for (String word : dawg)
            i++;
        assertEquals(58109, i);
        
        i = 0;
        for (String word : cdawg)
            i++;
        assertEquals(58109, i);
        
        i = 0;
        for (String word : udawg)
            i++;
        assertEquals(58109, i);

        i = 0;
        for (String word : dawg.getStringsEndingWith(""))
            i++;
        assertEquals(58109, i);

        i = 0;
        for (String word : cdawg.getStringsEndingWith(""))
            i++;
        assertEquals(58109, i);

        i = 0;
        for (String word : udawg.getStringsEndingWith(""))
            i++;
        assertEquals(58109, i);
        
        CompressedDAWGSet serialized = Serializer.serializeAndRead(cdawg);
        assertEquals(cdawg, serialized);
    }

    @Test
    public void blankCollection() {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.addAll("");
        CompressedDAWGSet cdawg = dawg.compress();
        if (cdawg instanceof CompressedDAWGSetLargeAlphabet)
            assertArrayEquals(new int[]{0, 3 | CompressedDAWGNode.ACCEPT_NODE_MASK, 0}, cdawg.outgoingData);
        else
            assertArrayEquals(new int[]{1 | CompressedDAWGNode.ACCEPT_NODE_MASK}, cdawg.outgoingData);
        assertEquals(0, cdawg.getMaxLength(cdawg.getSourceNode(), 0));
        
        assertTrue(dawg.contains(""));
        assertTrue(cdawg.contains(""));
        assertFalse(dawg.contains("\0"));
        assertFalse(cdawg.contains("\0"));
        assertFalse(dawg.contains("a"));
        assertFalse(cdawg.contains("a"));

        Iterator<String> iterator = dawg.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("", iterator.next());
        assertFalse(iterator.hasNext());
        
        iterator = cdawg.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = dawg.getStringsEndingWith("").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsEndingWith("").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("", iterator.next());
        assertFalse(iterator.hasNext());
    }

    @Test
    public void blank() {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.add("");
        CompressedDAWGSet cdawg = dawg.compress();
        
        assertTrue(dawg.contains(""));
        assertTrue(cdawg.contains(""));
        assertFalse(dawg.contains("\0"));
        assertFalse(cdawg.contains("\0"));
        assertFalse(dawg.contains("a"));
        assertFalse(cdawg.contains("a"));

        Iterator<String> iterator = dawg.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("", iterator.next());
        assertFalse(iterator.hasNext());
        
        iterator = cdawg.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = dawg.getStringsEndingWith("").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsEndingWith("").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("", iterator.next());
        assertFalse(iterator.hasNext());
        
        dawg.remove("");
        cdawg = dawg.compress();
        
        assertFalse(dawg.contains(""));
        assertFalse(cdawg.contains(""));
        assertFalse(dawg.contains("\0"));
        assertFalse(cdawg.contains("\0"));
        assertFalse(dawg.contains("a"));
        assertFalse(cdawg.contains("a"));

        assertFalse(dawg.iterator().hasNext());
        assertFalse(dawg.getStringsEndingWith("").iterator().hasNext());

        assertFalse(cdawg.iterator().hasNext());
        assertFalse(cdawg.getStringsEndingWith("").iterator().hasNext());
    }

    @Test
    public void severalLettersWord() {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.add("add");
        CompressedDAWGSet cdawg = dawg.compress();
        assertTrue(cdawg.contains("add"));
        assertFalse(cdawg.contains("ad"));
        assertFalse(cdawg.contains("a"));
        assertFalse(cdawg.contains(""));
        
        dawg.remove("add");
        cdawg = dawg.compress();

        assertFalse(dawg.iterator().hasNext());
        assertFalse(dawg.getStringsEndingWith("").iterator().hasNext());

        assertFalse(cdawg.iterator().hasNext());
        assertFalse(cdawg.getStringsEndingWith("").iterator().hasNext());
    }

    @Test
    public void shortWord() {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.add("a");
        CompressedDAWGSet cdawg = dawg.compress();

        Iterator<String> iterator = dawg.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("a", iterator.next());
        assertFalse(iterator.hasNext());
        
        iterator = cdawg.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("a", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = dawg.getStringsEndingWith("").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("a", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsEndingWith("").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("a", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = dawg.getStringsStartingWith("a").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("a", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsStartingWith("a").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("a", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = dawg.getStringsEndingWith("a").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("a", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsEndingWith("a").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("a", iterator.next());
        assertFalse(iterator.hasNext());

        assertFalse(dawg.getStringsStartingWith("b").iterator().hasNext());
        assertFalse(dawg.getStringsEndingWith("b").iterator().hasNext());

        assertFalse(cdawg.getStringsStartingWith("b").iterator().hasNext());
        assertFalse(cdawg.getStringsEndingWith("b").iterator().hasNext());
        
        dawg.remove("a");
        cdawg = dawg.compress();

        assertFalse(dawg.iterator().hasNext());
        assertFalse(dawg.getStringsEndingWith("").iterator().hasNext());

        assertFalse(cdawg.iterator().hasNext());
        assertFalse(cdawg.getStringsEndingWith("").iterator().hasNext());
    }

    @Test
    public void zero() {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.add("\0");
        CompressedDAWGSet cdawg = dawg.compress();
        
        assertFalse(dawg.contains(""));
        assertTrue(dawg.contains("\0"));
        assertFalse(dawg.contains("a"));
        
        assertFalse(cdawg.contains(""));
        assertTrue(cdawg.contains("\0"));
        assertFalse(cdawg.contains("a"));

        Iterator<String> iterator = dawg.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("\0", iterator.next());
        assertFalse(iterator.hasNext());
        
        iterator = cdawg.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("\0", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = dawg.getStringsEndingWith("").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("\0", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsEndingWith("").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("\0", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = dawg.getStringsStartingWith("\0").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("\0", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsStartingWith("\0").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("\0", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = dawg.getStringsEndingWith("\0").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("\0", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsEndingWith("\0").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("\0", iterator.next());
        assertFalse(iterator.hasNext());

        assertFalse(dawg.getStringsStartingWith("b").iterator().hasNext());
        assertFalse(dawg.getStringsEndingWith("b").iterator().hasNext());

        assertFalse(cdawg.getStringsStartingWith("b").iterator().hasNext());
        assertFalse(cdawg.getStringsEndingWith("b").iterator().hasNext());
    }

    @Test
    public void wordWithBlank() {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.add("");
        dawg.add("add");
        CompressedDAWGSet cdawg = dawg.compress();
        
        assertTrue(dawg.contains(""));
        assertFalse(dawg.contains("\0"));
        assertFalse(dawg.contains("a"));
        assertTrue(dawg.contains("add"));
        
        assertTrue(cdawg.contains(""));
        assertFalse(cdawg.contains("\0"));
        assertFalse(cdawg.contains("a"));
        assertTrue(cdawg.contains("add"));

        Set<String> expected = new HashSet<String>(Arrays.asList("", "add"));
        Set<String> actual = new HashSet<String>();
        for (String word : dawg.getStringsEndingWith(""))
            actual.add(word);
        assertEquals(expected, actual);
        
        actual = new HashSet<String>();
        for (String word : cdawg.getStringsEndingWith(""))
            actual.add(word);
        assertEquals(expected, actual);

        dawg.add("a");
        cdawg = dawg.compress();
        expected = new HashSet<String>(Arrays.asList("", "a", "add"));
        actual = new HashSet<String>();
        for (String word : dawg.getStringsEndingWith(""))
            actual.add(word);
        assertEquals(expected, actual);
        
        actual = new HashSet<String>();
        for (String word : cdawg.getStringsEndingWith(""))
            actual.add(word);
        assertEquals(expected, actual);

        dawg.add("ad");
        cdawg = dawg.compress();
        expected = new HashSet<String>(Arrays.asList("", "a", "ad", "add"));
        actual = new HashSet<String>();
        for (String word : dawg.getStringsEndingWith(""))
            actual.add(word);
        assertEquals(expected, actual);
        
        actual = new HashSet<String>();
        for (String word : cdawg.getStringsEndingWith(""))
            actual.add(word);
        assertEquals(expected, actual);
        
        dawg.remove("");
        cdawg = dawg.compress();
        expected = new HashSet<String>(Arrays.asList("a", "ad", "add"));
        actual = new HashSet<String>();
        for (String word : dawg.getStringsEndingWith(""))
            actual.add(word);
        assertEquals(expected, actual);
        
        actual = new HashSet<String>();
        for (String word : cdawg.getStringsEndingWith(""))
            actual.add(word);
        assertEquals(expected, actual);
    }

    @Test
    public void shortWordWithBlank() {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.add("");
        dawg.add("a");
        CompressedDAWGSet cdawg = dawg.compress();

        Iterator<String> iterator = dawg.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("a", iterator.next());
        assertFalse(iterator.hasNext());
        
        iterator = cdawg.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("a", iterator.next());
        assertFalse(iterator.hasNext());

        Set<String> expected = new HashSet<String>(Arrays.asList("", "a"));
        Set<String> actual = new HashSet<String>();
        for (String word : dawg.getStringsEndingWith(""))
            actual.add(word);
        assertEquals(expected, actual);
        
        actual = new HashSet<String>();
        for (String word : cdawg.getStringsEndingWith(""))
            actual.add(word);
        assertEquals(expected, actual);

        iterator = dawg.getStringsStartingWith("a").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("a", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsStartingWith("a").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("a", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = dawg.getStringsEndingWith("a").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("a", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsEndingWith("a").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("a", iterator.next());
        assertFalse(iterator.hasNext());

        assertFalse(dawg.getStringsStartingWith("b").iterator().hasNext());
        assertFalse(dawg.getStringsEndingWith("b").iterator().hasNext());

        assertFalse(cdawg.getStringsStartingWith("b").iterator().hasNext());
        assertFalse(cdawg.getStringsEndingWith("b").iterator().hasNext());
    }

    @Test
    public void zeroWithBlank() {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.add("");
        dawg.add("\0");
        CompressedDAWGSet cdawg = dawg.compress();
        
        assertTrue(dawg.contains(""));
        assertTrue(dawg.contains("\0"));
        assertFalse(dawg.contains("a"));
        assertFalse(dawg.contains("add"));
        
        assertTrue(cdawg.contains(""));
        assertTrue(cdawg.contains("\0"));
        assertFalse(cdawg.contains("a"));
        assertFalse(cdawg.contains("add"));

        Iterator<String> iterator = dawg.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("\0", iterator.next());
        assertFalse(iterator.hasNext());
        
        iterator = cdawg.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("\0", iterator.next());
        assertFalse(iterator.hasNext());

        Set<String> expected = new HashSet<String>(Arrays.asList("", "\0"));
        Set<String> actual = new HashSet<String>();
        for (String word : dawg.getStringsEndingWith(""))
            actual.add(word);
        assertEquals(expected, actual);
        
        actual = new HashSet<String>();
        for (String word : cdawg.getStringsEndingWith(""))
            actual.add(word);
        assertEquals(expected, actual);

        iterator = dawg.getStringsStartingWith("\0").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("\0", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsStartingWith("\0").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("\0", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = dawg.getStringsEndingWith("\0").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("\0", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsEndingWith("\0").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("\0", iterator.next());
        assertFalse(iterator.hasNext());

        assertFalse(dawg.getStringsStartingWith("b").iterator().hasNext());
        assertFalse(dawg.getStringsEndingWith("b").iterator().hasNext());

        assertFalse(cdawg.getStringsStartingWith("b").iterator().hasNext());
        assertFalse(cdawg.getStringsEndingWith("b").iterator().hasNext());
    }

    @Test
    public void similarBeginningAndEnd() {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.add("tet");
        dawg.add("tetatet");
        CompressedDAWGSet cdawg = dawg.compress();

        Iterator<String> iterator = dawg.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tet", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("tetatet", iterator.next());
        assertFalse(iterator.hasNext());
        
        iterator = cdawg.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tet", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("tetatet", iterator.next());
        assertFalse(iterator.hasNext());

        Set<String> expected = new HashSet<String>(Arrays.asList("tet", "tetatet"));
        Set<String> actual = new HashSet<String>();
        for (String word : dawg.getStringsEndingWith(""))
            actual.add(word);
        assertEquals(expected, actual);
        
        actual = new HashSet<String>();
        for (String word : cdawg.getStringsEndingWith(""))
            actual.add(word);
        assertEquals(expected, actual);

        iterator = dawg.getStringsStartingWith("tet").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tet", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("tetatet", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsStartingWith("tet").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tet", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("tetatet", iterator.next());
        assertFalse(iterator.hasNext());

        expected = new HashSet<String>(Arrays.asList("tet", "tetatet"));
        actual = new HashSet<String>();
        for (String word : dawg.getStringsEndingWith("tet"))
            actual.add(word);
        assertEquals(expected, actual);
        
        actual = new HashSet<String>();
        for (String word : cdawg.getStringsEndingWith("tet"))
            actual.add(word);
        assertEquals(expected, actual);

        iterator = dawg.getStringsStartingWith("teta").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tetatet", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsStartingWith("teta").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tetatet", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = dawg.getStringsEndingWith("atet").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tetatet", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsEndingWith("atet").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tetatet", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = dawg.getStringsStartingWith("tetatet").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tetatet", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsStartingWith("tetatet").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tetatet", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = dawg.getStringsEndingWith("tetatet").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tetatet", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsEndingWith("tetatet").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tetatet", iterator.next());
        assertFalse(iterator.hasNext());

        assertFalse(dawg.getStringsStartingWith("b").iterator().hasNext());
        assertFalse(dawg.getStringsEndingWith("b").iterator().hasNext());

        assertFalse(cdawg.getStringsStartingWith("b").iterator().hasNext());
        assertFalse(cdawg.getStringsEndingWith("b").iterator().hasNext());
    }

    @Test
    public void oneWordPartOfAnother() {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.add("tet");
        dawg.add("tetra");
        CompressedDAWGSet cdawg = dawg.compress();

        Iterator<String> iterator = dawg.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tet", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("tetra", iterator.next());
        assertFalse(iterator.hasNext());
        
        iterator = cdawg.iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tet", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("tetra", iterator.next());
        assertFalse(iterator.hasNext());

        Set<String> expected = new HashSet<String>(Arrays.asList("tet", "tetra"));
        Set<String> actual = new HashSet<String>();
        for (String word : dawg.getStringsEndingWith(""))
            actual.add(word);
        assertEquals(expected, actual);
        
        actual = new HashSet<String>();
        for (String word : cdawg.getStringsEndingWith(""))
            actual.add(word);
        assertEquals(expected, actual);

        iterator = dawg.getStringsStartingWith("tet").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tet", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("tetra", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsStartingWith("tet").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tet", iterator.next());
        assertTrue(iterator.hasNext());
        assertEquals("tetra", iterator.next());
        assertFalse(iterator.hasNext());

        expected = new HashSet<String>(Arrays.asList("tet"));
        actual = new HashSet<String>();
        for (String word : dawg.getStringsEndingWith("tet"))
            actual.add(word);
        assertEquals(expected, actual);
        
        actual = new HashSet<String>();
        for (String word : cdawg.getStringsEndingWith("tet"))
            actual.add(word);
        assertEquals(expected, actual);

        expected = new HashSet<String>(Arrays.asList("tet"));
        actual = new HashSet<String>();
        for (String word : dawg.getStringsEndingWith("t"))
            actual.add(word);
        assertEquals(expected, actual);
        
        actual = new HashSet<String>();
        for (String word : cdawg.getStringsEndingWith("t"))
            actual.add(word);
        assertEquals(expected, actual);

        iterator = dawg.getStringsStartingWith("tetr").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tetra", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsStartingWith("tetr").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tetra", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = dawg.getStringsEndingWith("etra").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tetra", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsEndingWith("etra").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tetra", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = dawg.getStringsStartingWith("tetra").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tetra", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsStartingWith("tetra").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tetra", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = dawg.getStringsEndingWith("tetra").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tetra", iterator.next());
        assertFalse(iterator.hasNext());

        iterator = cdawg.getStringsEndingWith("tetra").iterator();
        assertTrue(iterator.hasNext());
        assertEquals("tetra", iterator.next());
        assertFalse(iterator.hasNext());

        assertFalse(dawg.getStringsStartingWith("b").iterator().hasNext());
        assertFalse(dawg.getStringsEndingWith("b").iterator().hasNext());

        assertFalse(cdawg.getStringsStartingWith("b").iterator().hasNext());
        assertFalse(cdawg.getStringsEndingWith("b").iterator().hasNext());
    }
    
    @Test
    public void binarySearchFirstOccurence() {
        int array[] = {1, 13, 42, 42, 42, 77, 78};
        assertEquals(2, CompressedDAWGSet.binarySearchFirstOccurrence(array, 0, array.length, 42, 1));
        assertEquals(-3, CompressedDAWGSet.binarySearchFirstOccurrence(array, 0, array.length, 32, 1));
        assertEquals(-6, CompressedDAWGSet.binarySearchFirstOccurrence(array, 0, array.length, 52, 1));
        int idx = Arrays.binarySearch(array, 0, array.length, 42);
        assertTrue(2 <= idx && idx <= 4);
        assertEquals(-3, Arrays.binarySearch(array, 0, array.length, 32));
        assertEquals(-6, Arrays.binarySearch(array, 0, array.length, 52));
        
        array = new int[]{1, 8, 13, 7, 42, 5, 42, 7, 42, 6, 77, 8, 78, 9};
        assertEquals(4, CompressedDAWGSet.binarySearchFirstOccurrence(array, 0, array.length, 42, 2));
        assertEquals(-5, CompressedDAWGSet.binarySearchFirstOccurrence(array, 0, array.length, 32, 2));
        assertEquals(-11, CompressedDAWGSet.binarySearchFirstOccurrence(array, 0, array.length, 52, 2));
        
        array = new int[]{1, 8, 8, 13, 7, 8, 42, 5, 8, 42, 7, 8, 42, 6, 8, 77, 8, 8, 78, 9, 8};
        assertEquals(6, CompressedDAWGSet.binarySearchFirstOccurrence(array, 0, array.length, 42, 3));
        assertEquals(-7, CompressedDAWGSet.binarySearchFirstOccurrence(array, 0, array.length, 32, 3));
        assertEquals(-16, CompressedDAWGSet.binarySearchFirstOccurrence(array, 0, array.length, 52, 3));
        assertEquals(6, CompressedDAWGSet.binarySearchFirstOccurrence(array, 6, 12, 42, 3));
    }
    
    @Test
    public void navigableSet() {
        List<String> words = Arrays.asList("abcd", "beast", "bench", "best", "car");
        List<String> wordsReversed = new ArrayList<String>(words);
        Collections.reverse(wordsReversed);
        ModifiableDAWGSet mdawg = new ModifiableDAWGSet(words);
        for (int i = 0; i < 2; i++) {
            DAWGSet dawg = i == 0 ? mdawg : mdawg.compress();
            NavigableSet<String> set = dawg.descendingSet();
            assertFalse(set.isEmpty());
            assertEquals(5, set.size());
            assertFalse(set.isEmpty());
            assertArrayEquals(wordsReversed.toArray(), set.toArray());
            
            for (int j = 0; j < 2; j++) {
                set = j == 0 ? set.descendingSet() : dawg;
                assertFalse(set.isEmpty());
                assertEquals(5, set.size());
                assertFalse(set.isEmpty());
                assertArrayEquals(words.toArray(), set.toArray());
                assertEquals("abcd", set.first());
                assertEquals("car", set.last());
                assertEquals(null, set.lower("abcd"));
                assertEquals("beast", set.higher("abcd"));
                assertEquals("beast", set.higher("bean"));
                assertEquals("beast", set.ceiling("bean"));
                assertEquals("beast", set.ceiling("beast"));
            }
            
            set = dawg.subSet("beast", true, "beast", true);
            assertEquals(1, set.size());
            set = dawg.subSet("beast", true, "beast", false);
            assertEquals(0, set.size());
            set = dawg.subSet("beast", false, "beast", false);
            assertEquals(0, set.size());
            set = dawg.subSet("beast", false, "beast", true);
            assertEquals(0, set.size());
            set = dawg.subSet("bean", true, "bean", true);
            assertEquals(0, set.size());
            set = dawg.prefixSet("be");
            assertEquals(3, set.size());
            set = dawg.prefixSet("be").subSet("beast", true, "beast", true);
            assertEquals(1, set.size());
        }
    }
    
    private static List<String> toList(Iterator<String> it) {
        List<String> ret = new ArrayList<String>();
        while (it.hasNext())
            ret.add(it.next());
        return ret;
    }
    
    @Test
    public void descending() {
        ModifiableDAWGSet dawg = new ModifiableDAWGSet();
        dawg.addAll("kex", "kexx", "kexy", "key", "keyx", "keyy", "kez");
        assertEquals(Arrays.asList("kex", "kexx", "kexy"), new ArrayList<String>(dawg.headSet("key", false)));
        assertEquals(Arrays.asList("kexy", "kexx", "kex"), new ArrayList<String>(dawg.descendingSet().tailSet("key", false)));
        assertEquals(Arrays.asList("kexy", "kexx", "kex"), new ArrayList<String>(dawg.headSet("key", false).descendingSet()));
        assertEquals(Arrays.asList("kexy", "kexx", "kex"), toList(dawg.headSet("key", false).descendingIterator()));
        assertEquals(Arrays.asList("kex", "kexx", "kexy"), toList(dawg.descendingSet().tailSet("key", false).descendingIterator()));
        assertEquals(Arrays.asList("kex", "kexx", "kexy"), toList(dawg.headSet("key", false).descendingSet().descendingIterator()));
        assertEquals(Arrays.asList("kex", "kexx", "kexy"), toList(dawg.headSet("key", false).iterator()));
        assertEquals(Arrays.asList("kexy", "kexx", "kex"), toList(dawg.descendingSet().tailSet("key", false).iterator()));
        assertEquals(Arrays.asList("kexy", "kexx", "kex"), toList(dawg.headSet("key", false).descendingSet().iterator()));
        assertEquals(Arrays.asList("kex", "kexx", "kexy"), toList(((StringsFilter)dawg.headSet("key", false)).getAllStrings().iterator()));
        assertEquals(Arrays.asList("kexy", "kexx", "kex"), toList(((StringsFilter)dawg.descendingSet().tailSet("key", false)).getAllStrings().iterator()));
        assertEquals(Arrays.asList("kexy", "kexx", "kex"), toList(((StringsFilter)dawg.headSet("key", false).descendingSet()).getAllStrings().iterator()));
    }
}