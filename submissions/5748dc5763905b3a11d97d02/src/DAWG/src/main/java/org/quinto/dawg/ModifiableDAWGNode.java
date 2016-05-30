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

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;
import java.util.Map.Entry;
import java.util.NavigableMap;

/**
 * The class which represents a node in a DAWG.

 * @author Kevin
 */
class ModifiableDAWGNode extends DAWGNode {
    private final int id;
    
    //The boolean denoting the accept state status of this node
    private boolean isAcceptNode;
    
    //The TreeMap to containing entries that represent a transition (label and target node)
    private final NavigableMap<Character, ModifiableDAWGNode> outgoingTransitionTreeMap;

    //The int representing this node's incoming transition node count
    private int incomingTransitionCount;
    
    //The int denoting index in a compressed DAWG data array that this node's transition set begins at
    private int transitionSetBeginIndex = -1;
    
    private int transitionSetLetters[];
    
    //The int which will store this node's hash code after its been calculated (necessary due to how expensive the hashing calculation is)
    private Integer storedHashCode;
    
    private final ModifiableDAWGSet graph;
    
    private final NavigableMap<Character, Map<Integer, ModifiableDAWGNode>> incomingTransitionTreeMap;
    
    /**
     * Constructs an ModifiableDAWGNode.
     
     * @param isAcceptNode     a boolean denoting the accept state status of this node
     * @param id               identifier of this node
     */
    public ModifiableDAWGNode(ModifiableDAWGSet graph, boolean isAcceptNode, int id) {
        this.graph = graph;
        this.id = id;
        this.isAcceptNode = isAcceptNode;
        outgoingTransitionTreeMap = new TreeMap<Character, ModifiableDAWGNode>();
        incomingTransitionTreeMap = graph == null || graph.isWithIncomingTransitions() ? new TreeMap<Character, Map<Integer, ModifiableDAWGNode>>() : null;
    }
    
    /**
     * Constructs an ModifiableDAWGNode possessing the same accept state status and outgoing transitions as another.
     
     * @param node      the ModifiableDAWGNode possessing the accept state status and
     *                  outgoing transitions that the to-be-created ModifiableDAWGNode is to take on
     * @param id        identifier of the cloned node
     */
    public ModifiableDAWGNode(ModifiableDAWGNode node, int id) {
        this.id = id;
        graph = node.graph;
        isAcceptNode = node.isAcceptNode;
        outgoingTransitionTreeMap = new TreeMap<Character, ModifiableDAWGNode>(node.outgoingTransitionTreeMap);
        incomingTransitionTreeMap = graph == null || graph.isWithIncomingTransitions() ? new TreeMap<Character, Map<Integer, ModifiableDAWGNode>>() : null;
        
        //Loop through the nodes in this node's outgoing transition set, incrementing the number of
        //incoming transitions of each by 1 (to account for this newly created node's outgoing transitions)
        for (Entry<Character, ModifiableDAWGNode> transition : outgoingTransitionTreeMap.entrySet())
            transition.getValue().addIncomingTransition(transition.getKey(), this);
    }
    
    public void addIncomingTransition(char letter, ModifiableDAWGNode node) {
        if (graph == null || graph.isWithIncomingTransitions()) {
            Map<Integer, ModifiableDAWGNode> letterIncomingTransitions = incomingTransitionTreeMap.get(letter);
            if (letterIncomingTransitions == null)
                incomingTransitionTreeMap.put(letter, letterIncomingTransitions = new HashMap<Integer, ModifiableDAWGNode>());
            if (letterIncomingTransitions.put(node.getId(), node) != node)
                incomingTransitionCount++;
        } else
            incomingTransitionCount++;
    }
    
    public void removeIncomingTransition(char letter, ModifiableDAWGNode node) {
        if (graph == null || graph.isWithIncomingTransitions()) {
            Map<Integer, ModifiableDAWGNode> letterIncomingTransitions = incomingTransitionTreeMap.get(letter);
            if (letterIncomingTransitions != null) {
                if (letterIncomingTransitions.remove(node.getId()) != null)
                    incomingTransitionCount--;
                if (letterIncomingTransitions.isEmpty())
                    incomingTransitionTreeMap.remove(letter);
            }
        } else
            incomingTransitionCount--;
    }
    
    /**
     * Creates an ModifiableDAWGNode possessing the same accept state status ant transition set
 (incoming & outgoing) as this node. outgoing transitions as this node.
     
     * @param soleParentNode                        the ModifiableDAWGNode possessing the only transition that targets this node
     * @param parentToCloneTransitionLabelChar      the char which labels the transition from {@code soleParentNode} to this node
     * @param id                                    identifier of the cloned node
     * @return                                      an ModifiableDAWGNode possessing the same accept state status and transition set as this node.
     */
    public ModifiableDAWGNode clone(ModifiableDAWGNode soleParentNode, char parentToCloneTransitionLabelChar, int id) {
        ModifiableDAWGNode cloneNode = new ModifiableDAWGNode(this, id);
        soleParentNode.reassignOutgoingTransition(parentToCloneTransitionLabelChar, this, cloneNode);
        
        return cloneNode;
    }

    /**
     * Retrieves the index in a CompressedDAWGSet data array that the CompressedDAWGNode
     * representation of this node's outgoing transition set begins at.
     
     * @return      the index in a CompressedDAWGSet data array that this node's transition set begins at,
     *              or -1 if its transition set is not present in such an array
     */
    public int getTransitionSetBeginIndex() {
        return transitionSetBeginIndex;
    }

    @Override
    public int getId() {
        return id;
    }
    
    /**
     * Retrieves this node's outgoing transition count.
     
     * @return      an int representing this node's number of outgoing transitions
     */
    public int getOutgoingTransitionCount() {
        return outgoingTransitionTreeMap.size();
    }
    
    /**
     * Retrieves this node's incoming transition count
     
     * @return      an int representing this node's number of incoming transitions
     */
    public int getIncomingTransitionCount() {
        return incomingTransitionCount;
    }
    
    /**
     * Determines if this node is a confluence node
     * (defined as a node with two or more incoming transitions
     
     * @return      true if this node has two or more incoming transitions, false otherwise
     */
    public boolean isConfluenceNode() {
        return incomingTransitionCount > 1;
    }
    
    /**
     * Retrieves the accept state status of this node.
     
     * @return      true if this node is an accept state, false otherwise
     */
    @Override
    public boolean isAcceptNode() {
        return isAcceptNode;
    }
    
    /**
     * Sets this node's accept state status.
     *
     * @param isAcceptNode     a boolean representing the desired accept state status
     * @return true if and only if the accept state status has changed as a result of this call
     */
    public boolean setAcceptStateStatus(boolean isAcceptNode) {
        boolean result = this.isAcceptNode != isAcceptNode;
        this.isAcceptNode = isAcceptNode;
        return result;
    }
    
    /**
     * Records the index that this node's transition set starts at
     * in an array containing this node's containing DAWG data (CompressedDAWGSet).
     
     * @param transitionSetBeginIndex       a transition set
     */
    public void setTransitionSetBeginIndex(int transitionSetBeginIndex) {
        this.transitionSetBeginIndex = transitionSetBeginIndex;
    }

    public int[] getTransitionSetLetters() {
        return transitionSetLetters;
    }

    public void setTransitionSetLetters(int transitionSetLetters[]) {
        this.transitionSetLetters = transitionSetLetters;
    }
    
    /**
     * Determines whether this node has an outgoing transition with a given label.
     
     * @param letter        the char labeling the desired transition
     * @return              true if this node possesses a transition labeled with
     *                      {@code letter}, and false otherwise
     */
    public boolean hasOutgoingTransition(char letter) {
        return outgoingTransitionTreeMap.containsKey(letter);
    }
    
    private boolean hasIncomingTransition(char letter) {
        return incomingTransitionTreeMap.containsKey(letter);
    }
    
    /**
     * Determines whether this node has any outgoing transitions.
     
     * @return      true if this node has at least one outgoing transition, false otherwise
     */
    public boolean hasOutgoingTransitions() {
        return !outgoingTransitionTreeMap.isEmpty();
    }
    
    /**
     * Follows an outgoing transition of this node labeled with a given char.
     
     * @param letter        the char representation of the desired transition's label
     * @return              the ModifiableDAWGNode that is the target of the transition labeled with {@code letter},
     *                      or null if there is no such labeled transition from this node
     */
    @Override
    public ModifiableDAWGNode transition(char letter) {
        return outgoingTransitionTreeMap.get(letter);
    }

    @Override
    public ModifiableDAWGNode transition(String str) {
        return (ModifiableDAWGNode)super.transition(str);
    }
    
    /**
     * Retrieves the nodes in the transition path starting
     * from this node corresponding to a given String .
     
     * @param str       a String corresponding to a transition path starting from this node
     * @return          a Deque of DAWGNodes containing the nodes in the transition path
     *                  denoted by {@code str}, in the order they are encountered in during transitioning
     */
    public Deque<ModifiableDAWGNode> getTransitionPathNodes(String str) {
        Deque<ModifiableDAWGNode> nodeStack = new ArrayDeque<ModifiableDAWGNode>();
        
        ModifiableDAWGNode currentNode = this;
        int numberOfChars = str.length();
        
        //Iteratively transition through the DAWG using the chars in str,
        //putting each encountered node in nodeStack
        for (int i = 0; i < numberOfChars && currentNode != null; i++) {
            currentNode = currentNode.transition(str.charAt(i));
            nodeStack.add(currentNode);
        }
         
        return nodeStack;
    }
    
    /**
     * Retrieves this node's outgoing transitions.
     
     * @return      a TreeMap containing entries collectively representing
     *              all of this node's outgoing transitions
     */
    public NavigableMap<Character, ModifiableDAWGNode> getOutgoingTransitions() {
        return outgoingTransitionTreeMap;
    }

    public NavigableMap<Character, Map<Integer, ModifiableDAWGNode>> getIncomingTransitions() {
        return incomingTransitionTreeMap;
    }
    
    /**
     * Decrements (by 1) the incoming transition counts of all of the nodes
     * that are targets of outgoing transitions from this node.
     */
    public void decrementTargetIncomingTransitionCounts() {
        for (Entry<Character, ModifiableDAWGNode> transition : outgoingTransitionTreeMap.entrySet())
            transition.getValue().removeIncomingTransition(transition.getKey(), this);
    }
    
    /**
     * Reassigns the target node of one of this node's outgoing transitions.
     
     * @param letter            the char which labels the outgoing transition of interest
     * @param oldTargetNode     the ModifiableDAWGNode that is currently the target of the transition of interest
     * @param newTargetNode     the ModifiableDAWGNode that is to be the target of the transition of interest
     */
    public void reassignOutgoingTransition(char letter, ModifiableDAWGNode oldTargetNode, ModifiableDAWGNode newTargetNode) {
        oldTargetNode.removeIncomingTransition(letter, this);
        newTargetNode.addIncomingTransition(letter, this);
        if (graph != null && graph.isWithIncomingTransitions()) {
            if (oldTargetNode.isAcceptNode() && !oldTargetNode.hasIncomingTransition(letter))
                ((ModifiableDAWGNode)graph.getEndNode()).removeIncomingTransition(letter, oldTargetNode);
            if (newTargetNode.isAcceptNode())
                ((ModifiableDAWGNode)graph.getEndNode()).addIncomingTransition(letter, newTargetNode);
        }
        
        outgoingTransitionTreeMap.put(letter, newTargetNode);
    }
    
    /**
     * Creates an outgoing transition labeled with a
     * given char that has a new node as its target.
     
     * @param letter                        a char representing the desired label of the transition
     * @param targetAcceptStateStatus       a boolean representing to-be-created transition target node's accept status
     * @param id                            identifier of the new node
     * @return                              the (newly created) ModifiableDAWGNode that is the target of the created transition
     */
    public ModifiableDAWGNode addOutgoingTransition(ModifiableDAWGSet graph, char letter, boolean targetAcceptStateStatus, int id) {
        ModifiableDAWGNode newTargetNode = new ModifiableDAWGNode(graph, targetAcceptStateStatus, id);
        newTargetNode.addIncomingTransition(letter, this);
        
        outgoingTransitionTreeMap.put(letter, newTargetNode);
        return newTargetNode;
    }
    
    /**
     * Removes a transition labeled with a given char. This only removes the connection
     * between this node and the transition's target node; the target node is not deleted.
     
     * @param letter        the char labeling the transition of interest
     */
    public void removeOutgoingTransition(char letter) {
        outgoingTransitionTreeMap.remove(letter);
    }
    
    /**
     * Clears this node's stored hash value
     */
    public void clearStoredHashCode() {
        storedHashCode = null;
    }
    
    /**
     * Evaluates the equality of this node with another object.
     * This node is equal to obj if and only if obj is also an ModifiableDAWGNode,
 and the set of transitions paths from this node and obj are equivalent.
     
     * @param obj       an object
     * @return          true of {@code obj} is an ModifiableDAWGNode and the set of
                  transition paths from this node and obj are equivalent
     */
    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (!(obj instanceof ModifiableDAWGNode))
            return false;
        ModifiableDAWGNode node = (ModifiableDAWGNode)obj;
        return isAcceptNode == node.isAcceptNode && outgoingTransitionTreeMap.equals(node.outgoingTransitionTreeMap);//haveSameTransitions(this, node);
    }
    
    /**
     * Hashes this node using its accept state status and set of outgoing transition paths.
     * This is an expensive operation, so the result is cached and only cleared when necessary.
    
     * @return      an int of this node's hash code
     */
    @Override
    public int hashCode() {
        if (storedHashCode == null)
            //transition paths stemming from this node
            storedHashCode = (isAcceptNode ? 1 : 0) + outgoingTransitionTreeMap.hashCode() * 2;
        return storedHashCode;
    }

    public void removeAllOutgoingTransitions() {
        outgoingTransitionTreeMap.clear();
    }

    public void removeAllIncomingTransitions() {
        if (incomingTransitionTreeMap != null)
            incomingTransitionTreeMap.clear();
        incomingTransitionCount = 0;
    }
}