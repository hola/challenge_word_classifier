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

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.NavigableSet;
import java.util.Set;
import java.util.TreeSet;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import org.junit.BeforeClass;
import org.junit.Test;

/**
 *
 * @author Kevin
 */
public class DAWGFileTest {
    private static ArrayList<String> wordArrayList;
    private static ModifiableDAWGSet dawg1;
    private static CompressedDAWGSet dawg2;
    
    @BeforeClass
    public static void initClass() throws IOException {
        wordArrayList = new ArrayList<String>(100000);
        FileReader freader = null;
        IOException ex = null;
        try {
            freader = new FileReader("words.txt");
            BufferedReader breader = new BufferedReader(freader);
            try {
                String currentWord;
                while ((currentWord = breader.readLine()) != null)
                    wordArrayList.add(currentWord);
            } finally {
                try {
                    breader.close();
                } catch (IOException e) {
                    ex = e;
                }
            }
        } finally {
            if (freader != null) {
                try {
                    freader.close();
                } catch (IOException e) {
                    if (ex == null)
                        ex = e;
                }
            }
        }
        if (ex != null)
            throw ex;
        dawg1 = new ModifiableDAWGSet(wordArrayList);
        
        ArrayList<String> wordArrayList2 = new ArrayList<String>(wordArrayList);
        Collections.shuffle(wordArrayList2);
        dawg2 = dawg1.compress();
    }
    
    @Test
    public void dawgBGetMinimizationIndexTest() {
        assertEquals(-1, dawg1.calculateMinimizationProcessingStartIndex("", ""));
        assertEquals(0, dawg1.calculateMinimizationProcessingStartIndex("abcd", "efg"));
        assertEquals(2, dawg1.calculateMinimizationProcessingStartIndex("abcd", "ab"));
        assertEquals(-1, dawg1.calculateMinimizationProcessingStartIndex("abcd", "abcd"));
        assertEquals(2, dawg1.calculateMinimizationProcessingStartIndex("abcd", "abd"));
        assertEquals(3, dawg1.calculateMinimizationProcessingStartIndex("abcd", "abcr"));
        assertEquals(0, dawg1.calculateMinimizationProcessingStartIndex("abcd", ""));
        assertEquals(-1, dawg1.calculateMinimizationProcessingStartIndex("", "abcd"));
    }
    
    @Test
    public void dawgBGetLongestStoredSubsequenceTest() {
        assertEquals("do", dawg1.determineLongestPrefixInDAWG("do"));
        assertEquals("doggy", dawg1.determineLongestPrefixInDAWG("doggy"));
        assertEquals("c", dawg1.determineLongestPrefixInDAWG("c"));
        assertEquals("cats", dawg1.determineLongestPrefixInDAWG("catsing"));
        assertEquals("bro", dawg1.determineLongestPrefixInDAWG("brolic"));
        assertEquals("", dawg1.determineLongestPrefixInDAWG("1234"));
        assertEquals("Czechoslovakians", dawg1.determineLongestPrefixInDAWG("Czechoslovakians"));
    }
    
    @Test
    public void dawgBGetTransitionPathFirstConfluenceNodeDataTest() {
        assertNotNull(dawg1.getTransitionPathFirstConfluenceNodeData((ModifiableDAWGNode)dawg1.getSourceNode(), "caution").get("confluenceNode"));
        assertNotNull(dawg1.getTransitionPathFirstConfluenceNodeData((ModifiableDAWGNode)dawg1.getSourceNode(), "abated").get("confluenceNode"));
        assertNotNull(dawg1.getTransitionPathFirstConfluenceNodeData((ModifiableDAWGNode)dawg1.getSourceNode(), "watching").get("confluenceNode"));
    }
    
    @Test
    public void size() {
        assertEquals(wordArrayList.size(), dawg1.size());
        assertEquals(wordArrayList.size(), dawg2.size());
    }
    
    @Test
    public void dawgBBuildTest() {
        for (String currentWord : wordArrayList) {
            assertTrue("dawg1 does not contain " + currentWord, dawg1.contains(currentWord));
            assertTrue("dawg2 does not contain " + currentWord, dawg2.contains(currentWord));
        }
    }
    
    @Test
    public void removeWordTest() {
        int numberOfRuns = 10;
        int wordArrayListSize = wordArrayList.size();
        
        for (int i = 0; i < numberOfRuns; i++) {
            ArrayList<String> wordArrayList2 = new ArrayList<String>(wordArrayList);
            Collections.shuffle(wordArrayList2);
            int wordIndex = (int)(Math.random() * wordArrayListSize);

            ModifiableDAWGSet testDAWG = new ModifiableDAWGSet(wordArrayList2);
            String toBeRemovedWord = wordArrayList2.remove(wordIndex);
            testDAWG.remove(toBeRemovedWord);
            ModifiableDAWGSet controlTestDAWG = new ModifiableDAWGSet(wordArrayList2);

            assertEquals("Removed word: " + toBeRemovedWord, wordArrayList.size() - 1, testDAWG.size());
            assertEquals("Removed word: " + toBeRemovedWord, controlTestDAWG.size(), testDAWG.size());
            assertEquals("Removed word: " + toBeRemovedWord, controlTestDAWG.getNodeCount(), testDAWG.getNodeCount());
            assertEquals("Removed word: " + toBeRemovedWord, controlTestDAWG.getEquivalenceClassCount(), testDAWG.getEquivalenceClassCount());
            assertEquals("Removed word: " + toBeRemovedWord, controlTestDAWG.getTransitionCount(), testDAWG.getTransitionCount());
        }
    }
    
    public int[][] removeWord2DataProvider() {
        int numberOfRuns = 10;
        int intervalSize = 20;
        int[][] parameterObjectDoubleArray = new int[numberOfRuns][];
        int wordArrayListSize = wordArrayList.size();
        
        for (int i = 0; i < numberOfRuns; i++, wordArrayListSize -= intervalSize) {
            int intervalBoundaryIndex1 = (int)(Math.random() * wordArrayListSize);
            int intervalBoundaryIndex2;
            
            if (intervalBoundaryIndex1 + intervalSize >= wordArrayListSize)
                intervalBoundaryIndex2 = intervalBoundaryIndex1 - intervalSize;
            else
                intervalBoundaryIndex2 = intervalBoundaryIndex1 + intervalSize;
            
            int[] currentParameterArray = new int[2];
            currentParameterArray[0] = Math.min(intervalBoundaryIndex1, intervalBoundaryIndex2);
            currentParameterArray[1] = Math.max(intervalBoundaryIndex1, intervalBoundaryIndex2);
            parameterObjectDoubleArray[i] = currentParameterArray;
        }
        return parameterObjectDoubleArray;
    }
    
    @Test
    public void removeWord2() {
        for (int interval[] : removeWord2DataProvider()) {
            ArrayList<String> wordArrayList2 = new ArrayList<String>(wordArrayList);
            Collections.shuffle(wordArrayList2);
            
            int intervalBegin = interval[0];
            int onePastIntervalEnd = interval[1];
            ModifiableDAWGSet testDAWG = new ModifiableDAWGSet(wordArrayList2);

            int intervalSize = onePastIntervalEnd - intervalBegin;
            for (int i = 0; i < intervalSize; i++)
                testDAWG.remove(wordArrayList2.get(intervalBegin + i));

            for (int i = 0; i < intervalSize; i++)
                wordArrayList2.remove(intervalBegin);

            ModifiableDAWGSet controlTestDAWG = new ModifiableDAWGSet(wordArrayList2);

            assertEquals(wordArrayList.size() - intervalSize, testDAWG.size());
            assertEquals(controlTestDAWG.size(), testDAWG.size());
            assertEquals(controlTestDAWG.getNodeCount(), testDAWG.getNodeCount());
            assertEquals(controlTestDAWG.getEquivalenceClassCount(), testDAWG.getEquivalenceClassCount());
            assertEquals(controlTestDAWG.getTransitionCount(), testDAWG.getTransitionCount());
        }
    }
    
    @Test
    public void removeWord() {
        ArrayList<String> wordArrayList2 = new ArrayList<String>(wordArrayList);
        Collections.swap(wordArrayList2, 65958, 65953);
        int intervalBegin = 65948;
        int onePastIntervalEnd = 65968;
        ModifiableDAWGSet testDAWG = new ModifiableDAWGSet(wordArrayList2);

        int intervalSize = onePastIntervalEnd - intervalBegin;
        for (int i = 0; i < intervalSize; i++)
            testDAWG.remove(wordArrayList2.get(intervalBegin + i));

        for (int i = 0; i < intervalSize; i++)
            wordArrayList2.remove(intervalBegin);

        ModifiableDAWGSet controlTestDAWG = new ModifiableDAWGSet(wordArrayList2);

        assertEquals(wordArrayList.size() - intervalSize, testDAWG.size());
        assertEquals(controlTestDAWG.size(), testDAWG.size());
        assertEquals(controlTestDAWG.getNodeCount(), testDAWG.getNodeCount());
        assertEquals(controlTestDAWG.getEquivalenceClassCount(), testDAWG.getEquivalenceClassCount());
        assertEquals(controlTestDAWG.getTransitionCount(), testDAWG.getTransitionCount());
    }
    
    @Test
    public void getAllStringsTest() {
        NavigableSet<String> wordNavigableSet1 = new TreeSet<String>();
        for (String word : dawg1.getAllStrings())
            wordNavigableSet1.add(word);
        NavigableSet<String> wordNavigableSet2 = new TreeSet<String>();
        for (String word : dawg2.getAllStrings())
            wordNavigableSet2.add(word);
        assertTrue(wordNavigableSet1.containsAll(wordArrayList));
        assertTrue(wordNavigableSet2.containsAll(wordArrayList));
    }
    
    @Test
    public void containsTest() {
        for (int i = 0; i < 100; i++) {
            assertTrue(dawg1.contains(wordArrayList.get(i)));
            assertTrue(dawg2.contains(wordArrayList.get(i)));
        }
    }
    
    @Test
    public void containsAOL() {
        assertTrue(dawg2.contains("AOL"));
    }
    
    @Test
    public void getStringsStartingWithTest() {
        for (String prefixStr : new String[]{"ang", "iter", "con", "pro", "nan", "ing", "inter", "ton", "tion" }) {
            List<String> controlSet = new ArrayList<String>();

            for (String str : wordArrayList) {
                if (str.startsWith(prefixStr))
                    controlSet.add(str);
            }
            
            List<String> expectedSet = new ArrayList<String>();
            for (String word : dawg1.getStringsStartingWith(prefixStr))
                expectedSet.add(word);

            assertEquals(controlSet, expectedSet);
            
            expectedSet = new ArrayList<String>();
            for (String word : dawg1.getStrings(prefixStr, null, null, true, null, false, null, false))
                expectedSet.add(word);
            Collections.reverse(expectedSet);

            assertEquals(controlSet, expectedSet);
            
            expectedSet = new ArrayList<String>();
            for (String word : dawg2.getStringsStartingWith(prefixStr))
                expectedSet.add(word);
            
            assertEquals(controlSet, expectedSet);
        }
    }
    
    @Test
    public void getStringsWithSubstringTest() {
        for (String substringStr : new String[]{"ang", "iter", "con", "pro", "nan", "ing", "inter", "ton", "tion" }) {
            List<String> controlSet = new ArrayList<String>();
            for (String str : wordArrayList) {
                if (str.contains(substringStr))
                    controlSet.add(str);
            }
            
            List<String> actual = new ArrayList<String>();
            for (String s : dawg1.getStringsWithSubstring(substringStr))
                actual.add(s);
            assertEquals(controlSet, actual);
            
            actual = new ArrayList<String>();
            for (String s : dawg2.getStringsWithSubstring(substringStr))
                actual.add(s);
            assertEquals(controlSet, actual);
        }
    }
    
    @Test
    public void getStringsEndingWithTest() {
        for (String suffixStr : new String[]{"ang", "iter", "con", "pro", "nan", "ing", "inter", "ton", "tion" }) {
            Set<String> controlSet = new HashSet<String>();
            for (String str : wordArrayList) {
                if (str.endsWith(suffixStr))
                    controlSet.add(str);
            }

            Set<String> actual = new HashSet<String>();
            for (String s : dawg1.getStringsEndingWith(suffixStr))
                actual.add(s);
            assertEquals(controlSet, actual);
            
            actual = new HashSet<String>();
            for (String s : dawg2.getStringsEndingWith(suffixStr))
                actual.add(s);
            assertEquals(controlSet, actual);
        }
    }
}