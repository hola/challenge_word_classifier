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

import org.quinto.dawg.util.LookaheadIterator;
import java.util.Iterator;

/**
 * The class capable of representing a DAWG node, its transition set, and one of its incoming transitions;
 * objects of this class are used to represent a DAWG after its been compressed in order to save space.
 
 * @author Kevin
 */
public class CompressedDAWGNode extends DAWGNode {
    public static final int ACCEPT_NODE_MASK = Integer.MIN_VALUE;
    public static final int TRANSITION_SET_BEGIN_INDEX_MASK = Integer.MAX_VALUE;
    
    //The int denoting the size of this node's outgoing transition set
    private int transitionSetSize = -1;
    
    final int index;
    
    final CompressedDAWGSet graph;
    
    /**
     * Constructs a CompressedDAWGNode.
     
     * @param letter                a char representing the transition label leading to this CompressedDAWGNode
     * @param isAcceptNode          a boolean representing the accept state status of this CompressedDAWGNode
     * @param transitionSetSize     an int denoting the size of this transition set
     */
    public CompressedDAWGNode(CompressedDAWGSet graph, int index) {
        this.graph = graph;
        this.index = index;
    }

    /**
     * Retrieves the accept state status of this node.
     
     * @return      true if this node is an accept state, false otherwise
     */
    @Override
    public boolean isAcceptNode() {
        return index < 0 ? true : (graph.outgoingData[index] & ACCEPT_NODE_MASK) == ACCEPT_NODE_MASK;
    }
    
    /**
     * Retrieves the index in this node's containing array that its transition set begins at.
     
     * @return      an int of the index in this node's containing array at which its transition set begins
     */
    public int getTransitionSetBeginIndex() {
        return index < 0 ? 0 : graph.outgoingData[index] & TRANSITION_SET_BEGIN_INDEX_MASK;
    }
    
    /**
     * Retrieves the size of this node's outgoing transition set.
     
     * @return      an int denoting the size of this node's outgoing transition set
     */
    public int getOutgoingTransitionsSize() {
        if (transitionSetSize < 0) {
            if (index < 0)
                transitionSetSize = 0;
            else {
                int from = index + 1;
                int to = index + graph.getOutgoingTransitionSizeInInts();
                int s = 0;
                for (int i = from; i < to; i++)
                    s += Integer.bitCount(graph.outgoingData[i]);
                transitionSetSize = s;
            }
        }
        return transitionSetSize;
    }
    
    public Iterable<CompressedDAWGNode> getOutgoingTransitionsNodes() {
        return new Iterable<CompressedDAWGNode>() {
            private final int transitionSizeInInts = graph.getOutgoingTransitionSizeInInts();
            private final int size = getOutgoingTransitionsSize();
            
            @Override
            public Iterator<CompressedDAWGNode> iterator() {
                return new LookaheadIterator<CompressedDAWGNode>() {
                    private int current;
                    private int childrenIdx = getTransitionSetBeginIndex();
                    
                    @Override
                    public CompressedDAWGNode nextElement() {
                        if (current < size) {
                            CompressedDAWGNode child = new CompressedDAWGNode(graph, childrenIdx);
                            current++;
                            childrenIdx += transitionSizeInInts;
                            return child;
                        } else
                            throw NO_SUCH_ELEMENT_EXCEPTION;
                    }
                };
            }
        };
    }
    
    public Iterable<CompressedDAWGNode> getIncomingTransitions(final char c) {
        return new Iterable<CompressedDAWGNode>() {
            private final int from;
            private final int to;
            
            {
                // Start node has no incoming transitions.
                if (index == START) {
                    from = -1;
                    to = -1;
                } else {
                    // End node is located at the beginning.
                    int idx = index == END ? 0 : index;
                    int begin = graph.incomingData[idx + 1];
                    to = begin + graph.incomingData[idx + 2] * CompressedDAWGSet.INCOMING_TRANSITION_SIZE_IN_INTS;
                    from = CompressedDAWGSet.binarySearchFirstOccurrence(graph.incomingData, begin, to, c, CompressedDAWGSet.INCOMING_TRANSITION_SIZE_IN_INTS);
                }
            }
            
            @Override
            public Iterator<CompressedDAWGNode> iterator() {
                return new LookaheadIterator<CompressedDAWGNode>() {
                    private int pos = from;
                    
                    @Override
                    public CompressedDAWGNode nextElement() {
                        if (pos < 0 || pos >= to)
                            throw NO_SUCH_ELEMENT_EXCEPTION;
                        char letter = (char)graph.incomingData[pos];
                        if (letter != c)
                            throw NO_SUCH_ELEMENT_EXCEPTION;
                        CompressedDAWGNode ret = graph.incomingData[pos + 2] == 0 ? graph.getSourceNode() : new CompressedDAWGNode(graph, pos);
                        pos += CompressedDAWGSet.INCOMING_TRANSITION_SIZE_IN_INTS;
                        return ret;
                    }
                };
            }
        };
    }

    public int getIndex() {
        return index;
    }
    
    @Override
    public int getId() {
        return index / graph.getOutgoingTransitionSizeInInts();
    }

    @Override
    public int hashCode() {
        return index;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == this)
            return true;
        if (!(obj instanceof CompressedDAWGNode))
            return false;
        CompressedDAWGNode other = (CompressedDAWGNode)obj;
        return index == other.index && graph == other.graph;
    }
    
    /**
     * Follows an outgoing transition from this node.
     
     * @param letter            the char representation of the desired transition's label
     * @return                  the CompressedDAWGNode that is the target of the transition labeled with {@code letter},
     *                          or null if there is no such labeled transition from this node
     */
    @Override
    public CompressedDAWGNode transition(char letter) {
        Integer letterPos = graph.getLettersIndex().get(letter);
        if (letterPos == null)
            return null;
        int lp = letterPos;
        int transitionsStart = index + 1;
        int intIndexOfLetterInArray = lp >>> 5;
        int transitionsEnd = transitionsStart + intIndexOfLetterInArray;
        lp &= 31;
        int bitIndexOfLetterInInt = 1 << lp;
        if ((graph.outgoingData[transitionsEnd] & bitIndexOfLetterInInt) == 0)
            return null;
        int pos = 0;
        for (int i = transitionsStart; i < transitionsEnd; i++)
            pos += Integer.bitCount(graph.outgoingData[i]);
        if (lp > 0)
            pos += Integer.bitCount(graph.outgoingData[transitionsEnd] << (32 - lp));
        int transitionSizeInInts = graph.getOutgoingTransitionSizeInInts();
        pos *= transitionSizeInInts;
        pos += getTransitionSetBeginIndex();
        return new CompressedDAWGNode(graph, pos);
    }

    /**
     * Follows a transition path starting from this node.
     
     * @param str               a String corresponding a transition path in the DAWG
     * @return                  the CompressedDAWGNode at the end of the transition path corresponding to
                          {@code str}, or null if such a transition path is not present in the DAWG
     */
    @Override
    public CompressedDAWGNode transition(String str) {
        return (CompressedDAWGNode)super.transition(str);
    }
}