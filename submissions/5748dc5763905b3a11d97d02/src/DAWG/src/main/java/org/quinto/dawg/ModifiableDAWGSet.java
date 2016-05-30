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

import org.quinto.dawg.util.SemiNavigableMap;
import org.quinto.dawg.util.SimpleEntry;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.ArrayDeque;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.NavigableMap;
import java.util.NavigableSet;
import java.util.NoSuchElementException;
import java.util.TreeSet;
import org.quinto.dawg.util.UnmodifiableNavigableSet;

/**
 * A minimalistic directed acyclical graph suitable for storing a set of Strings.
 
 * @author Kevin
 */
public class ModifiableDAWGSet extends DAWGSet {
    private static final ModifiableDAWGNode EMPTY_NODE = new ModifiableDAWGNode(null, true, DAWGNode.EMPTY);
    
    //Increment for node identifiers.
    private int id;
    
    private final boolean withIncomingTransitions;
    
    //ModifiableDAWGNode from which all others in the structure are reachable
    private final ModifiableDAWGNode sourceNode;
    
    private final ModifiableDAWGNode endNode;

    //HashMap which contains the DAWGNodes collectively representing the all unique equivalence classes in the ModifiableDAWGSet.
    //Uniqueness is defined by the types of transitions allowed from, and number and type of nodes reachable
    //from the node of interest. Since there are no duplicate nodes in an ModifiableDAWGSet, # of equivalence classes == # of nodes.
    private final HashMap<ModifiableDAWGNode, ModifiableDAWGNode> equivalenceClassNodeHashMap = new HashMap<ModifiableDAWGNode, ModifiableDAWGNode>();
    
    //NavigableSet which will contain the set of unique characters used as transition labels in the ModifiableDAWGSet
    private final NavigableSet<Character> alphabet = new TreeSet<Character>();
    
    //An int denoting the total number of transitions between the nodes of the ModifiableDAWGSet
    private int transitionCount;
    
    //Total number of words contained in this ModifiableDAWGSet.
    private int size;
    
    /**
     * A flag indicating that the optimization of the alphabet won't change it
     * (i.e. no removals were performed). False value means that the alphabet probably
     * may be reduced by a call of {@link #optimizeLetters}.
     */
    private boolean optimized = true;
    
    //Maximal length of all words added to this DAWG. Does not decrease on removing.
    private int maxLength;
    
    /**
     * Creates a DAWG from an iterable of Strings with incoming transitions for fast suffix search.
     * @param strCollection     an {@link java.util.Iterable} containing Strings that the DAWG will contain
     */
    public ModifiableDAWGSet(Iterable<? extends String> strCollection) {
        this(true, strCollection);
    }
    
    /**
     * Creates a DAWG from an iterable of Strings.
     * @param withIncomingTransitions a flag indicating that the DAWG should store incoming transitions
     * for fast suffix search
     * @param strCollection     an {@link java.util.Iterable} containing Strings that the DAWG will contain
     */
    public ModifiableDAWGSet(boolean withIncomingTransitions, Iterable<? extends String> strCollection) {
        this(withIncomingTransitions);
        addAll(strCollection);
    }
    
    /**
     * Creates empty DAWG with incoming transitions for fast suffix search. Use {@link #addString} to fill it.
     */
    public ModifiableDAWGSet() {
        this(true);
    }
    
    /**
     * Creates empty DAWG. Use {@link #addString} to fill it.
     * @param withIncomingTransitions a flag indicating that the DAWG should store incoming transitions
     * for fast suffix search
     */
    public ModifiableDAWGSet(boolean withIncomingTransitions) {
        this.withIncomingTransitions = withIncomingTransitions;
        sourceNode = new ModifiableDAWGNode(this, false, id++);
        endNode = new ModifiableDAWGNode(this, false, id++);
    }
    
    /**
     * Creates a ModifiableDAWGSet from a newline delimited file containing the outgoingData of interest.
     
     * @param dataFile          a {@link java.io.File} representation of a file
                          containing the Strings that the ModifiableDAWGSet will contain
     * @return true if and only if this ModifiableDAWGSet was changed as a result of this call
     * @throws IOException      if {@code datafile} cannot be opened, or a read operation on it cannot be carried out
     */
    public boolean addAll(File dataFile) throws IOException {
        FileInputStream fis = null;
        IOException ex = null;
        boolean ret = false;
        try {
            fis = new FileInputStream(dataFile);
            ret = addAll(fis);
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
        return ret;
    }
    
    /**
     * Creates a ModifiableDAWGSet from a newline delimited file containing the outgoingData of interest.
     
     * @param dataFile          a {@link java.io.InputStream} representation of a file
                          containing the Strings that the ModifiableDAWGSet will contain
     * @return true if and only if this ModifiableDAWGSet was changed as a result of this call
     * @throws IOException      if {@code datafile} cannot be opened, or a read operation on it cannot be carried out
     */
    public boolean addAll(InputStream dataFile) throws IOException {
        final IOException exceptionToThrow[] = new IOException[1];
        InputStreamReader isr = null;
        boolean ret = false;
        try {
            isr = new InputStreamReader(dataFile);
            final BufferedReader br = new BufferedReader(isr);
            try {
                ret = addAll(new Iterable<String>() {
                    @Override
                    public Iterator<String> iterator() {
                        return new Iterator<String>() {
                            private String nextLine;

                            @Override
                            public boolean hasNext() {
                                if (nextLine == null) {
                                    try {
                                        nextLine = br.readLine();
                                        return nextLine != null;
                                    } catch (IOException e) {
                                        exceptionToThrow[0] = e;
                                        throw new RuntimeException(e);
                                    }
                                } else
                                    return true;
                            }

                            @Override
                            public String next() {
                                if (nextLine != null || hasNext()) {
                                    String line = nextLine;
                                    nextLine = null;
                                    return line;
                                } else
                                    throw new NoSuchElementException();
                            }

                            @Override
                            public void remove() {
                                throw new UnsupportedOperationException();
                            }
                        };
                    }
                });
            } finally {
                try {
                    br.close();
                } catch (IOException e) {
                    if (exceptionToThrow[0] == null)
                        exceptionToThrow[0] = e;
                }
            }
        } catch (RuntimeException e) {
            if (e.getCause() == exceptionToThrow[0] && exceptionToThrow[0] != null)
                throw exceptionToThrow[0];
            throw e;
        } finally {
            if (isr != null) {
                try {
                    isr.close();
                } catch (IOException e) {
                    if (exceptionToThrow[0] == null)
                        exceptionToThrow[0] = e;
                }
            }
        }
        if (exceptionToThrow[0] != null)
            throw exceptionToThrow[0];
        return ret;
    }
    
    /**
     * Adds a Collection of Strings to the ModifiableDAWGSet.
     
     * @param strCollection     a {@link java.util.Collection} containing Strings to be added to the ModifiableDAWGSet
     * @return true if and only if this ModifiableDAWGSet was changed as a result of this call
     */
    public boolean addAll(String... strCollection) {
        return addAll(Arrays.asList(strCollection));
    }

    @Override
    public boolean addAll(Collection<? extends String> c) {
        return addAll((Iterable<? extends String>)c);
    }
    
    /**
     * Adds a Collection of Strings to the ModifiableDAWGSet.
     
     * @param strCollection     a {@link java.util.Iterable} containing Strings to be added to the ModifiableDAWGSet
     * @return true if and only if this ModifiableDAWGSet was changed as a result of this call
     */
    @Override
    public boolean addAll(Iterable<? extends String> strCollection) {
        boolean result = false;
        boolean empty = true;
        String previousString = "";

        //Add all the Strings in strCollection to the ModifiableDAWGSet.
        for (String currentString : strCollection) {
            empty = false;
            int mpsIndex = calculateMinimizationProcessingStartIndex(previousString, currentString);

            //If the transition path of the previousString needs to be examined for minimization or
            //equivalence class representation after a certain point, call replaceOrRegister to do so.
            if (mpsIndex != -1) {
                String transitionSubstring = previousString.substring(0, mpsIndex);
                String minimizationProcessingSubString = previousString.substring(mpsIndex);
                replaceOrRegister(sourceNode.transition(transitionSubstring), minimizationProcessingSubString);
            }

            result |= addStringInternal(currentString);
            previousString = currentString;
        }

        if (!empty) {
            //Since we delay the minimization of the previously-added String
            //until after we read the next one, we need to have a seperate
            //statement to minimize the absolute last String.
            if (!previousString.isEmpty())
                replaceOrRegister(sourceNode, previousString);
        }
        return result;
    }
    
    /**
     * Adds a string to the ModifiableDAWGSet.
     
     * @param str       the String to be added to the ModifiableDAWGSet
     * @return true if ModifiableDAWGSet didn't contain this string yet
     */
    @Override
    public boolean add(String str) {
        boolean result = addStringInternal(str);
        if (!str.isEmpty())
            replaceOrRegister(sourceNode, str);
        return result;
    }

    @Override
    public boolean isWithIncomingTransitions() {
        return withIncomingTransitions;
    }
    
    private void splitTransitionPath(ModifiableDAWGNode originNode, String storedStringSubstr) {
        HashMap<String, Object> firstConfluenceNodeDataHashMap = getTransitionPathFirstConfluenceNodeData(originNode, storedStringSubstr);
        Integer toFirstConfluenceNodeTransitionCharIndex = (Integer)firstConfluenceNodeDataHashMap.get("toConfluenceNodeTransitionCharIndex");
        ModifiableDAWGNode firstConfluenceNode = (ModifiableDAWGNode)firstConfluenceNodeDataHashMap.get("confluenceNode");
        
        if (firstConfluenceNode != null) {
            ModifiableDAWGNode firstConfluenceNodeParent = originNode.transition(storedStringSubstr.substring(0, toFirstConfluenceNodeTransitionCharIndex));
            char letter = storedStringSubstr.charAt(toFirstConfluenceNodeTransitionCharIndex);
            ModifiableDAWGNode firstConfluenceNodeClone = firstConfluenceNode.clone(firstConfluenceNodeParent, letter, id++);
            if (firstConfluenceNodeClone.isAcceptNode())
                endNode.addIncomingTransition(letter, firstConfluenceNodeClone);
            transitionCount += firstConfluenceNodeClone.getOutgoingTransitionCount();
            String unprocessedSubString = storedStringSubstr.substring(toFirstConfluenceNodeTransitionCharIndex + 1);
            splitTransitionPath(firstConfluenceNodeClone, unprocessedSubString);
        }
    }
    
    /**
     * Calculates the length of the the sub-path in a transition path, that is used only by a given string.
     
     * @param str       a String corresponding to a transition path from sourceNode
     * @return          an int denoting the size of the sub-path in the transition path
     *                  corresponding to {@code str} that is only used by {@code str}
     */
    private int calculateSoleTransitionPathLength(String str) {
        Deque<ModifiableDAWGNode> transitionPathNodeStack = sourceNode.getTransitionPathNodes(str);
        transitionPathNodeStack.pollLast();  //The ModifiableDAWGNode at the top of the stack is not needed
                                        //(we are processing the outgoing transitions of nodes inside str's transition path,
                                        //the outgoing transitions of the ModifiableDAWGNode at the top of the stack are outside this path)
        
        int sizeBefore = transitionPathNodeStack.size();

        //Process each node in transitionPathNodeStack, using each to determine whether the
        //transition path corresponding to str is only used by str.  This is true if and only if
        //each node in the transition path has a single outgoing transition and is not an accept state.
        while (!transitionPathNodeStack.isEmpty()) {
            ModifiableDAWGNode currentNode = transitionPathNodeStack.peekLast();
            if (currentNode.getOutgoingTransitionCount() <= 1 && !currentNode.isAcceptNode())
                transitionPathNodeStack.pollLast();
            else
                break;
        }
        return sizeBefore - transitionPathNodeStack.size();
    }
    
    /**
     * Removes a String from the ModifiableDAWGSet.
     
     * @param o       the String to be removed from the ModifiableDAWGSet
     * @return true if ModifiableDAWGSet already contained this string
     */
    @Override
    public boolean remove(Object o) {
        String str = (String)o;
        //Split the transition path corresponding to str to ensure that
        //any other transition paths sharing nodes with it are not affected
        splitTransitionPath(sourceNode, str);

        //Remove from equivalenceClassNodeHashMap, the entries of all the nodes in the transition path corresponding to str.
        removeTransitionPathRegisterEntries(str);

        //Get the last node in the transition path corresponding to str
        ModifiableDAWGNode strEndNode = sourceNode.transition(str);

        //Removing non-existent word.
        if (strEndNode == null)
            return false;

        if (str.isEmpty() || strEndNode.hasOutgoingTransitions()) {
            boolean result = strEndNode.setAcceptStateStatus(false);
            if (!str.isEmpty())
                replaceOrRegister(sourceNode, str);
            if (result) {
                size--;
                if (str.isEmpty()) {
                    if (isWithIncomingTransitions())
                        for (char c : strEndNode.getIncomingTransitions().keySet())
                            endNode.removeIncomingTransition(c, strEndNode);
                } else {
                    endNode.removeIncomingTransition(str.charAt(str.length() - 1), strEndNode);
                    optimized = false;
                }
            }
            return result;
        } else {
            int soleInternalTransitionPathLength = calculateSoleTransitionPathLength(str);
            int internalTransitionPathLength = str.length() - 1;

            if (soleInternalTransitionPathLength == internalTransitionPathLength) {
                sourceNode.removeOutgoingTransition(str.charAt(0));
                transitionCount -= str.length();
                endNode.removeIncomingTransition(str.charAt(str.length() - 1), strEndNode);
            } else {
                //Remove the sub-path in str's transition path that is only used by str
                int toBeRemovedTransitionLabelCharIndex = internalTransitionPathLength - soleInternalTransitionPathLength;
                String prefix = str.substring(0, toBeRemovedTransitionLabelCharIndex);
                ModifiableDAWGNode latestNonSoloTransitionPathNode = sourceNode.transition(prefix);
                latestNonSoloTransitionPathNode.removeOutgoingTransition(str.charAt(toBeRemovedTransitionLabelCharIndex));
                transitionCount -= str.length() - toBeRemovedTransitionLabelCharIndex;
                endNode.removeIncomingTransition(str.charAt(str.length() - 1), strEndNode);
                replaceOrRegister(sourceNode, prefix);
            }
            size--;
            optimized = false;
            return true;
        }
    }
    
    /**
     * Determines the start index of the substring in the String most recently added to the ModifiableDAWGSet
 that corresponds to the transition path that will be next up for minimization processing.
     *
     * The "minimization processing start index" is defined as the index in {@code prevStr} which starts the substring
     * corresponding to the transition path that doesn't have its right language extended by {@code currStr}. The transition path of
     * the substring before this point is not considered for minimization in order to limit the amount of times the
     * equivalence classes of its nodes will need to be reassigned during the processing of Strings which share prefixes.
     
     * @param prevStr       the String most recently added to the ModifiableDAWGSet
     * @param currStr       the String next to be added to the ModifiableDAWGSet
     * @return              an int of the index in {@code prevStr} that starts the substring corresponding
     *                      to the transition path next up for minimization processing
     */
    int calculateMinimizationProcessingStartIndex(String prevStr, String currStr) {
        int mpsIndex;
        
        if (!currStr.startsWith(prevStr)) {
            //Loop through the corresponding indices of both Strings in search of the first index containing differing characters.
            //The transition path of the substring of prevStr from this point will need to be submitted for minimization processing.
            //The substring before this point, however, does not, since currStr will simply be extending the right languages of the
            //nodes on its transition path.
            int shortestStringLength = Math.min(prevStr.length(), currStr.length());
            for (mpsIndex = 0; mpsIndex < shortestStringLength && prevStr.charAt(mpsIndex) == currStr.charAt(mpsIndex);)
                mpsIndex++;
        } else
            mpsIndex =  -1;    //If the prevStr is a prefix of currStr, then currStr simply extends the right language of the transition path of prevStr.
        
        return mpsIndex;
    }
    
    /**
     * Determines and retrieves outgoingData related to the first confluence node
 (defined as a node with two or more incoming transitions) of a
 transition path corresponding to a given String from a given node.
     
     * @param originNode        the ModifiableDAWGNode from which the transition path corresponding to str starts from
     * @param str               a String corresponding to a transition path in the ModifiableDAWGSet
     * @return                  a HashMap of Strings to Objects containing:
                              - an int denoting the length of the path to the first confluence node in the transition path of interest
                              - the ModifiableDAWGNode which is the first confluence node in the transition path of interest (or null if one does not exist)
     */
    HashMap<String, Object> getTransitionPathFirstConfluenceNodeData(ModifiableDAWGNode originNode, String str) {
        int currentIndex = 0;
        int charCount = str.length();
        ModifiableDAWGNode currentNode = originNode;
        
        //Loop thorugh the characters in str, sequentially using them to transition through the ModifiableDAWGSet in search of
        //(and breaking upon reaching) the first node that is the target of two or more transitions. The loop is
        //also broken from if the currently processing node doesn't have a transition labeled with the currently processing char.
        for (; currentIndex < charCount; currentIndex++) {
            char currentChar = str.charAt(currentIndex);
            currentNode = currentNode.hasOutgoingTransition(currentChar) ? currentNode.transition(currentChar) : null;
            
            if (currentNode == null || currentNode.isConfluenceNode())
                break;
        }
        
        boolean noConfluenceNode = currentNode == originNode || currentIndex == charCount;
        
        //Create a HashMap containing the index of the last char in the substring corresponding
        //to the transitoin path to the confluence node, as well as the actual confluence node
        HashMap<String, Object> confluenceNodeDataHashMap = new HashMap<String, Object>(2);
        confluenceNodeDataHashMap.put("toConfluenceNodeTransitionCharIndex", noConfluenceNode ? null : currentIndex);
        confluenceNodeDataHashMap.put("confluenceNode", noConfluenceNode ? null : currentNode);

        return confluenceNodeDataHashMap;
    }

    /**
     * Performs minimization processing on a transition path starting from a given node.
     *
     * This entails either replacing a node in the path with one that has an equivalent right language/equivalence class
     * (defined as set of transition paths that can be traversed and nodes able to be reached from it), or making it
     * a representative of a right language/equivalence class if a such a node does not already exist.
     
     * @param originNode        the ModifiableDAWGNode that the transition path corresponding to str starts from
     * @param str              a String related to a transition path
     */
    private void replaceOrRegister(ModifiableDAWGNode originNode, String str) {
        char transitionLabelChar = str.charAt(0);
        ModifiableDAWGNode relevantTargetNode = originNode.transition(transitionLabelChar);

        //If relevantTargetNode has transitions and there is at least one char left to process, recursively call
        //this on the next char in order to further processing down the transition path corresponding to str
        if (relevantTargetNode.hasOutgoingTransitions() && str.length() > 1)
            replaceOrRegister(relevantTargetNode, str.substring(1));

        //Get the node representing the equivalence class that relevantTargetNode belongs to. DAWGNodes hash on the
        //transitions paths that can be traversed from them and nodes able to be reached from them;
        //nodes with the same equivalence classes will hash to the same bucket.
        ModifiableDAWGNode equivalentNode = equivalenceClassNodeHashMap.get(relevantTargetNode);
        
        //if there is no node with the same right language as relevantTargetNode
        if (equivalentNode == null)
            equivalenceClassNodeHashMap.put(relevantTargetNode, relevantTargetNode);
        //if there is another node with the same right language as relevantTargetNode, reassign the
        //transition between originNode and relevantTargetNode, to originNode and the node representing the equivalence class of interest
        else if (equivalentNode != relevantTargetNode) {
            relevantTargetNode.decrementTargetIncomingTransitionCounts();
            transitionCount -= relevantTargetNode.getOutgoingTransitionCount(); //Since this method is recursive, the outgoing transitions of all of relevantTargetNode's child nodes have already been reassigned,
                                                                                //so we only need to decrement the transition count by the relevantTargetNode's outgoing transition count
            originNode.reassignOutgoingTransition(transitionLabelChar, relevantTargetNode, equivalentNode);
        }
    }
    
    /**
     * Adds a transition path starting from a specific node in the ModifiableDAWGSet.
     
     * @param originNode    the ModifiableDAWGNode which will serve as the start point of the to-be-created transition path
     * @param str           the String to be used to create a new transition path from {@code originNode}
     * @return true if and only if ModifiableDAWGSet has changed as a result of this call
     */
    private boolean addTransitionPath(ModifiableDAWGNode originNode, String str) {
        if (!str.isEmpty()) {
            ModifiableDAWGNode currentNode = originNode;
            int charCount = str.length();

            //Loop through the characters in str, iteratevely adding
            // a transition path corresponding to it from originNode
            for (int i = 0; i < charCount; i++, transitionCount++) {
                char currentChar = str.charAt(i);
                boolean isLastChar = i == charCount - 1;
                currentNode = currentNode.addOutgoingTransition(this, currentChar, isLastChar, id++);
                if (isLastChar)
                    endNode.addIncomingTransition(currentChar, currentNode);
                alphabet.add(currentChar);
            }
            size++;
            return true;
        } else if (originNode.setAcceptStateStatus(true)) {
            if (isWithIncomingTransitions())
                for (char c : originNode.getIncomingTransitions().keySet())
                    endNode.addIncomingTransition(c, originNode);
            size++;
            return true;
        } else
            return false;
    }
    
    /**
     * Removes from equivalenceClassNodeHashmap the entries of all the nodes in a transition path.
     
     * @param str       a String corresponding to a transition path from sourceNode
     */
    private void removeTransitionPathRegisterEntries(String str) {
        ModifiableDAWGNode currentNode = sourceNode;

        int charCount = str.length();
        
        for (int i = 0; i < charCount; i++) {
            currentNode = currentNode.transition(str.charAt(i));
            
            //Removing non-existent word.
            if (currentNode == null)
                break;
            
            if (equivalenceClassNodeHashMap.get(currentNode) == currentNode)
                equivalenceClassNodeHashMap.remove(currentNode);
            
            //The hashCode of an ModifiableDAWGNode is cached the first time a hash is performed without a cache value present.
            //Since we just hashed currentNode, we must clear this regardless of its presence in equivalenceClassNodeHashMap
            //since we're not actually declaring equivalence class representatives here.
            currentNode.clearStoredHashCode();
        }
    }
    
    /**
     * Clones a transition path from a given node.
     
     * @param pivotConfluenceNode               the ModifiableDAWGNode that the cloning operation is to be based from
     * @param transitionStringToPivotNode       a String which corresponds with a transition path from souceNode to {@code pivotConfluenceNode}
     * @param str                               a String which corresponds to the transition path from {@code pivotConfluenceNode} that is to be cloned
     */
    private void cloneTransitionPath(ModifiableDAWGNode pivotConfluenceNode, String transitionStringToPivotNode, String str) {
        ModifiableDAWGNode lastTargetNode = pivotConfluenceNode.transition(str);      //Will store the last node which was used as the base of a cloning operation
        ModifiableDAWGNode lastClonedNode = null;                                     //Will store the last cloned node
        char lastTransitionLabelChar = '\0';                                //Will store the char which labels the transition to lastTargetNode from its parent node in the prefixString's transition path

        //Loop backwards through the indices of str, using each as a boundary to create substrings of str of decreasing length
        //which will be used to transition to, and duplicate the nodes in the transition path of str from pivotConfluenceNode.
        for (int i = str.length(); i >= 0; i--) {
            String currentTransitionString = i > 0 ? str.substring(0, i) : null;
            ModifiableDAWGNode currentTargetNode = i > 0 ? pivotConfluenceNode.transition(currentTransitionString) : pivotConfluenceNode;
            ModifiableDAWGNode clonedNode;

            //if we have reached pivotConfluenceNode
            if (i == 0) {
                //Clone pivotConfluenceNode in a way that reassigns the transition of its parent node (in transitionStringToConfluenceNode's path) to the clone.
                String transitionStringToPivotNodeParent = transitionStringToPivotNode.substring(0, transitionStringToPivotNode.length() - 1);
                char parentTransitionLabelChar = transitionStringToPivotNode.charAt(transitionStringToPivotNode.length() - 1);
                clonedNode = pivotConfluenceNode.clone(sourceNode.transition(transitionStringToPivotNodeParent), parentTransitionLabelChar, id++);
                if (clonedNode.isAcceptNode())
                    endNode.addIncomingTransition(parentTransitionLabelChar, clonedNode);
            } else {
                clonedNode = new ModifiableDAWGNode(currentTargetNode, id++);     //simply clone currentTargetNode
                if (clonedNode.isAcceptNode())
                    endNode.addIncomingTransition(lastTransitionLabelChar, clonedNode);
            }

            transitionCount += clonedNode.getOutgoingTransitionCount();

            //If this isn't the first node we've cloned, reassign clonedNode's transition labeled
            //with the lastTransitionChar (which points to the last targetNode) to the last clone.
            if (lastClonedNode != null) {
                clonedNode.reassignOutgoingTransition(lastTransitionLabelChar, lastTargetNode, lastClonedNode);
                lastTargetNode = currentTargetNode;
            }

            //Store clonedNode and the char which labels the transition between the node it was cloned from (currentTargetNode) and THAT node's parent.
            //These will be used to establish an equivalent transition to clonedNode from the next clone to be created (it's clone parent).
            lastClonedNode = clonedNode;
            lastTransitionLabelChar = i > 0 ? str.charAt(i - 1) : '\0';
        }
    }
    
    /**
     * Adds a String to the ModifiableDAWGSet (called by addString to do actual ModifiableDAWGSet manipulation).
     
     * @param str       the String to be added to the ModifiableDAWGSet
     * @return true if and only if ModifiableDAWGSet has changed as a result of this call
     */
    private boolean addStringInternal(String str) {
        if (maxLength < str.length())
            maxLength = str.length();
        String prefixString = determineLongestPrefixInDAWG(str);
        String suffixString = str.substring(prefixString.length());

        //Retrive the outgoingData related to the first confluence node (a node with two or more incoming transitions)
        //in the transition path from sourceNode corresponding to prefixString.
        HashMap<String, Object> firstConfluenceNodeDataHashMap = getTransitionPathFirstConfluenceNodeData(sourceNode, prefixString);
        ModifiableDAWGNode firstConfluenceNodeInPrefix = (ModifiableDAWGNode)firstConfluenceNodeDataHashMap.get("confluenceNode");
        Integer toFirstConfluenceNodeTransitionCharIndex = (Integer) firstConfluenceNodeDataHashMap.get("toConfluenceNodeTransitionCharIndex");
        
        //Remove the register entries of all the nodes in the prefixString transition path up to the first confluence node
        //(those past the confluence node will not need to be removed since they will be cloned and unaffected by the
        //addition of suffixString). If there is no confluence node in prefixString, then remove the register entries in prefixString's entire transition path
        removeTransitionPathRegisterEntries(toFirstConfluenceNodeTransitionCharIndex == null ? prefixString : prefixString.substring(0, toFirstConfluenceNodeTransitionCharIndex));
                
        //If there is a confluence node in the prefix, we must duplicate the transition path
        //of the prefix starting from that node, before we add suffixString (to the duplicate path).
        //This ensures that we do not disturb the other transition paths containing this node.
        if (firstConfluenceNodeInPrefix != null) {
            String transitionStringOfPathToFirstConfluenceNode = prefixString.substring(0, toFirstConfluenceNodeTransitionCharIndex + 1);
            String transitionStringOfToBeDuplicatedPath = prefixString.substring(toFirstConfluenceNodeTransitionCharIndex + 1);
            cloneTransitionPath(firstConfluenceNodeInPrefix, transitionStringOfPathToFirstConfluenceNode, transitionStringOfToBeDuplicatedPath);
        }
        
        //Add the transition based on suffixString to the end of the (possibly duplicated) transition path corresponding to prefixString
        return addTransitionPath(sourceNode.transition(prefixString), suffixString);
    }
    
    private int createCompressedOutgoingTransitionsDataSmall(int data[], ModifiableDAWGNode node, int currentNodeIndex, int onePastLastCreatedTransitionSetIndex, int compressedNodeSize, Map<Character, Integer> lettersIndex) {
        int pivotIndex = onePastLastCreatedTransitionSetIndex;
        node.setTransitionSetBeginIndex(pivotIndex);
        currentNodeIndex++;
        onePastLastCreatedTransitionSetIndex += node.getOutgoingTransitionCount() * compressedNodeSize;

        //Create a CompressedDAWGNode representing each transition label/target combo in transitionTreeMap, recursively calling this method (if necessary)
        //to set indices in these CompressedDAWGNodes that the set of transitions emitting from their respective transition targets starts from.
        for (Entry<Character, ModifiableDAWGNode> transitionKeyValuePair : node.getOutgoingTransitions().entrySet()) {
            //Use the current transition's label and target node to create a CompressedDAWGNode
            //(which is a space-saving representation of the transition), and insert it in to data
            char transitionLabelChar = transitionKeyValuePair.getKey();
            int letterIndex = lettersIndex.get(transitionLabelChar);
            data[currentNodeIndex + (letterIndex >>> 5)] |= 1 << letterIndex;
            ModifiableDAWGNode transitionTargetNode = transitionKeyValuePair.getValue();
            
            //If targetTransitionNode's outgoing transition set hasn't been inserted in to data yet, call this method on it to do so.
            //After this call returns, transitionTargetNode will contain the index in data that its transition set starts from
            if (transitionTargetNode.getTransitionSetBeginIndex() == -1)
                onePastLastCreatedTransitionSetIndex = createCompressedOutgoingTransitionsDataSmall(data, transitionTargetNode, pivotIndex, onePastLastCreatedTransitionSetIndex, compressedNodeSize, lettersIndex);
            else
                System.arraycopy(transitionTargetNode.getTransitionSetLetters(), 0, data, pivotIndex + 1, compressedNodeSize - 1);
            
            data[pivotIndex] = transitionTargetNode.getTransitionSetBeginIndex();
            if (transitionTargetNode.isAcceptNode())
                data[pivotIndex] |= CompressedDAWGNode.ACCEPT_NODE_MASK;
            pivotIndex += compressedNodeSize;
        }
        node.setTransitionSetLetters(Arrays.copyOfRange(data, currentNodeIndex, currentNodeIndex + compressedNodeSize - 1));
        return onePastLastCreatedTransitionSetIndex;
    }
    
    private void createCompressedOutgoingTransitionsDataLarge(int data[], ModifiableDAWGNode node, int nodeStart, char letter, int childrenStart, int nextFreeIndex[]) {
        data[nodeStart] = letter;
        data[nodeStart + 1] = childrenStart | (node.isAcceptNode() ? CompressedDAWGNode.ACCEPT_NODE_MASK : 0);
        data[nodeStart + 2] = node.getOutgoingTransitionCount();
        nextFreeIndex[0] = Math.max(nextFreeIndex[0], childrenStart + node.getOutgoingTransitionCount() * CompressedDAWGSetLargeAlphabet.OUTGOING_TRANSITION_SIZE_IN_INTS);
        node.setTransitionSetBeginIndex(nodeStart);
        for (Map.Entry<Character, ModifiableDAWGNode> e : node.getOutgoingTransitions().entrySet()) {
            char c = e.getKey();
            ModifiableDAWGNode child = e.getValue();
            if (child.getTransitionSetBeginIndex() == -1) {
                createCompressedOutgoingTransitionsDataLarge(data, child, childrenStart, c, nextFreeIndex[0], nextFreeIndex);
                childrenStart += CompressedDAWGSetLargeAlphabet.OUTGOING_TRANSITION_SIZE_IN_INTS;
            } else {
                data[childrenStart++] = c;
                data[childrenStart++] = data[child.getTransitionSetBeginIndex() + 1] | (child.isAcceptNode() ? CompressedDAWGNode.ACCEPT_NODE_MASK : 0);
                data[childrenStart++] = child.getOutgoingTransitionCount();
            }
        }
    }
    
    private void createCompressedIncomingTransitionsData(int incomingData[], ModifiableDAWGNode node, int nodeStart, char letter, int childrenStart, int nextFreeIndex[]) {
        incomingData[nodeStart] = letter;
        incomingData[nodeStart + 1] = childrenStart;
        incomingData[nodeStart + 2] = node.getIncomingTransitionCount();
        nextFreeIndex[0] = Math.max(nextFreeIndex[0], childrenStart + node.getIncomingTransitionCount() * CompressedDAWGSet.INCOMING_TRANSITION_SIZE_IN_INTS);
        node.setTransitionSetBeginIndex(nodeStart);
        for (Map.Entry<Character, Map<Integer, ModifiableDAWGNode>> e : node.getIncomingTransitions().entrySet()) {
            char c = e.getKey();
            for (ModifiableDAWGNode child : e.getValue().values()) {
                if (child.getTransitionSetBeginIndex() == -1) {
                    createCompressedIncomingTransitionsData(incomingData, child, childrenStart, c, nextFreeIndex[0], nextFreeIndex);
                    childrenStart += CompressedDAWGSet.INCOMING_TRANSITION_SIZE_IN_INTS;
                } else {
                    incomingData[childrenStart++] = c;
                    incomingData[childrenStart++] = incomingData[child.getTransitionSetBeginIndex() + 1];
                    incomingData[childrenStart++] = child.getIncomingTransitionCount();
                }
            }
        }
    }
    
    private void compressOutgoingSmallAlphabet(CompressedDAWGSet compressed) {
        int compressedNodeSize = compressed.getOutgoingTransitionSizeInInts();
        compressed.outgoingData[0] = compressedNodeSize;
        if (sourceNode.isAcceptNode())
            compressed.outgoingData[0] |= CompressedDAWGNode.ACCEPT_NODE_MASK;
        createCompressedOutgoingTransitionsDataSmall(compressed.outgoingData, sourceNode, 0, compressedNodeSize, compressedNodeSize, compressed.getLettersIndex());
    }
    
    private void compressOutgoingLargeAlphabet(CompressedDAWGSet compressed) {
        createCompressedOutgoingTransitionsDataLarge(compressed.outgoingData, sourceNode, 0, '\0', CompressedDAWGSetLargeAlphabet.OUTGOING_TRANSITION_SIZE_IN_INTS, new int[]{CompressedDAWGSetLargeAlphabet.OUTGOING_TRANSITION_SIZE_IN_INTS});
    }
    
    /**
     * Creates a space-saving version of the ModifiableDAWGSet in the form of an array.
     * The result is an unmodifiable, immutable and serializable version of DAWG containing all strings that
     * this ModifiableDAWGSet contains at the moment of compression.
     * @return an instance of {@link CompressedDAWGSet} containing all the words added to this DAWG
     */
    public CompressedDAWGSet compress() {
        optimizeLetters();
        boolean largeAlphabet = alphabet.size() > 64;
        CompressedDAWGSet compressed = largeAlphabet ? new CompressedDAWGSetLargeAlphabet() : new CompressedDAWGSet();
        compressed.size = size();
        compressed.maxLength = getMaxLength();
        compressed.alphabet = getAlphabet();
        compressed.letters = new char[alphabet.size()];
        int i = 0;
        for (char c : alphabet)
            compressed.letters[i++] = c;
        compressed.calculateCachedValues();
        int compressedNodeSize = compressed.getOutgoingTransitionSizeInInts();
        compressed.outgoingData = new int[(transitionCount + 1) * compressedNodeSize];
        if (largeAlphabet)
            compressOutgoingLargeAlphabet(compressed);
        else
            compressOutgoingSmallAlphabet(compressed);
        //Clear all transition begin indexes.
        Deque<ModifiableDAWGNode> stack = new ArrayDeque<ModifiableDAWGNode>();
        stack.add(sourceNode);
        while (true) {
            ModifiableDAWGNode node = stack.pollLast();
            if (node == null)
                break;
            node.setTransitionSetBeginIndex(-1);
            node.setTransitionSetLetters(null);
            stack.addAll(node.getOutgoingTransitions().values());
        }
        if (isWithIncomingTransitions()) {
            compressed.incomingData = new int[(transitionCount + endNode.getIncomingTransitionCount() + 1) * CompressedDAWGSet.INCOMING_TRANSITION_SIZE_IN_INTS];
            createCompressedIncomingTransitionsData(compressed.incomingData, endNode, 0, '\0', CompressedDAWGSet.INCOMING_TRANSITION_SIZE_IN_INTS, new int[]{CompressedDAWGSet.INCOMING_TRANSITION_SIZE_IN_INTS});
            //Clear all transition begin indexes.
            stack = new ArrayDeque<ModifiableDAWGNode>();
            stack.add(endNode);
            while (true) {
                ModifiableDAWGNode node = stack.pollLast();
                if (node == null)
                    break;
                node.setTransitionSetBeginIndex(-1);
                for (Map<Integer, ModifiableDAWGNode> map : node.getIncomingTransitions().values())
                    stack.addAll(map.values());
            }
        }
        return compressed;
    }
    
    @Override
    Collection<? extends DAWGNode> getNodesBySuffix(String suffix) {
        char suffixText[] = suffix.toCharArray();
        char lastChar = suffixText[suffixText.length - 1];
        Map<Integer, ModifiableDAWGNode> wordEndings = endNode.getIncomingTransitions().get(lastChar);
        if (wordEndings == null)
            return Collections.EMPTY_LIST;
        Collection<ModifiableDAWGNode> ret = wordEndings.values();
        for (int i = suffixText.length - 1; i >= 0; i--) {
            List<ModifiableDAWGNode> levelNodes = new ArrayList<ModifiableDAWGNode>();
            char c = suffixText[i];
            for (ModifiableDAWGNode node : ret) {
                wordEndings = node.getIncomingTransitions().get(c);
                if (wordEndings != null)
                    levelNodes.addAll(wordEndings.values());
            }
            ret = levelNodes;
        }
        return ret;
    }
    
    /**
     * This method removes unused letters from the alphabet of this DAWG.<br>
     * Use it before compression if the removal of words was performed.
     */
    private void optimizeLetters() {
        if (optimized)
            return;
        NavigableSet<Character> newLetters = new TreeSet<Character>();
        enumerateAllLetters(sourceNode, newLetters);
        alphabet.clear();
        alphabet.addAll(newLetters);
        optimized = true;
    }
    
    private void enumerateAllLetters(ModifiableDAWGNode node, NavigableSet<Character> newLetters) {
        for (Entry<Character, ModifiableDAWGNode> e : node.getOutgoingTransitions().entrySet()) {
            newLetters.add(e.getKey());
            enumerateAllLetters(e.getValue(), newLetters);
        }
    }

    @Override
    int getMaxLength() {
        return maxLength;
    }
    
    /**
     * Returns the ModifiableDAWGSet's source node.
    
     * @return      the ModifiableDAWGNode or CompressedDAWGNode functioning as the ModifiableDAWGSet's source node.
     */
    @Override
    public DAWGNode getSourceNode() {
        return sourceNode;
    }
    
    @Override
    DAWGNode getEndNode() {
        return endNode;
    }
    
    @Override
    DAWGNode getEmptyNode() {
        return EMPTY_NODE;
    }
    
    /**
     * Procures the set of characters which collectively label the ModifiableDAWGSet's transitions.
     
     * @return      a TreeSet of chars which collectively label all the transitions in the ModifiableDAWGSet
     */
    @Override
    public NavigableSet<Character> getAlphabet() {
        return new UnmodifiableNavigableSet<Character>(alphabet);
    }
    
    private void countNodes(ModifiableDAWGNode originNode, HashSet<Integer> nodeIDHashSet) {
        nodeIDHashSet.add(originNode.getId());
        
        NavigableMap<Character, ModifiableDAWGNode> transitionTreeMap = originNode.getOutgoingTransitions();
        
        for (ModifiableDAWGNode transition : transitionTreeMap.values())
            countNodes(transition, nodeIDHashSet);
    }
    
    @Override
    public int getNodeCount() {
        HashSet<Integer> ids = new HashSet<Integer>();
        countNodes(sourceNode, ids);
        return ids.size();
    }
    
    public int getEquivalenceClassCount() {
        return equivalenceClassNodeHashMap.size();
    }
    
    @Override
    public int getTransitionCount() {
        return transitionCount;
    }
    
    @Override
    public int size() {
        return size;
    }

    @Override
    SemiNavigableMap<Character, DAWGNode> getOutgoingTransitions(DAWGNode parent) {
        return new OutgoingTransitionsMap((ModifiableDAWGNode)parent, false);
    }

    @Override
    SemiNavigableMap<Character, Collection<? extends DAWGNode>> getIncomingTransitions(DAWGNode parent) {
        return new IncomingTransitionsMap((ModifiableDAWGNode)parent, false);
    }

    @Override
    public boolean isEmpty() {
        return size == 0;
    }

    @Override
    public void clear() {
        id = 2;
        maxLength = 0;
        size = 0;
        optimized = true;
        transitionCount = 0;
        equivalenceClassNodeHashMap.clear();
        alphabet.clear();
        endNode.removeAllIncomingTransitions();
        sourceNode.removeAllOutgoingTransitions();
        sourceNode.setAcceptStateStatus(false);
        sourceNode.clearStoredHashCode();
    }

    @Override
    public boolean isImmutable() {
        return false;
    }
    
    private static class OutgoingTransitionsMap implements SemiNavigableMap<Character, DAWGNode> {
        private final ModifiableDAWGNode parent;
        private final NavigableMap<Character, ModifiableDAWGNode> outgoingTransitions;
        private final boolean desc;
        
        public OutgoingTransitionsMap(ModifiableDAWGNode parent, boolean desc) {
            this.parent = parent;
            outgoingTransitions = parent.getOutgoingTransitions();
            this.desc = desc;
        }

        @Override
        public Iterator<SimpleEntry<Character, DAWGNode>> iterator() {
            return new Iterator<SimpleEntry<Character, DAWGNode>>() {
                private final Iterator<Entry<Character, ModifiableDAWGNode>> it = (desc ? outgoingTransitions.descendingMap() : outgoingTransitions).entrySet().iterator();

                @Override
                public boolean hasNext() {
                    return it.hasNext();
                }

                @Override
                public SimpleEntry<Character, DAWGNode> next() {
                    Entry<Character, ModifiableDAWGNode> next = it.next();
                    return new SimpleEntry<Character, DAWGNode>(next.getKey(), next.getValue());
                }

                @Override
                public void remove() {
                    throw new UnsupportedOperationException();
                }
            };
        }

        @Override
        public boolean isEmpty() {
            return outgoingTransitions.isEmpty();
        }

        @Override
        public SemiNavigableMap<Character, DAWGNode> descendingMap() {
            return new OutgoingTransitionsMap(parent, !desc);
        }
    }
    
    private static class IncomingTransitionsMap implements SemiNavigableMap<Character, Collection<? extends DAWGNode>> {
        private final ModifiableDAWGNode parent;
        private final NavigableMap<Character, Map<Integer, ModifiableDAWGNode>> incomingTransitions;
        private final boolean desc;
        
        public IncomingTransitionsMap(ModifiableDAWGNode parent, boolean desc) {
            this.parent = parent;
            incomingTransitions = parent.getIncomingTransitions();
            this.desc = desc;
        }

        @Override
        public Iterator<SimpleEntry<Character, Collection<? extends DAWGNode>>> iterator() {
            return new Iterator<SimpleEntry<Character, Collection<? extends DAWGNode>>>() {
                private final Iterator<Entry<Character, Map<Integer, ModifiableDAWGNode>>> it = (desc ? incomingTransitions.descendingMap() : incomingTransitions).entrySet().iterator();

                @Override
                public boolean hasNext() {
                    return it.hasNext();
                }

                @Override
                public SimpleEntry<Character, Collection<? extends DAWGNode>> next() {
                    Entry<Character, Map<Integer, ModifiableDAWGNode>> next = it.next();
                    return new SimpleEntry<Character, Collection<? extends DAWGNode>>(next.getKey(), next.getValue().values());
                }

                @Override
                public void remove() {
                    throw new UnsupportedOperationException();
                }
            };
        }

        @Override
        public boolean isEmpty() {
            return incomingTransitions.isEmpty();
        }

        @Override
        public SemiNavigableMap<Character, Collection<? extends DAWGNode>> descendingMap() {
            return new IncomingTransitionsMap(parent, !desc);
        }
    }
}