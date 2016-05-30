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

import java.util.NavigableMap;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import org.junit.Test;

/**
 *
 * @author Kevin
 */
public class ModifiableDAWGNodeTest {
    @Test
    public void addOutgoingTransitionTest() {
        ModifiableDAWGNode node1 = new ModifiableDAWGNode(null, false, 0);
        node1.addOutgoingTransition(null, 'a', true, 0);
        node1.addOutgoingTransition(null, 'b', false, 0);
        node1.addOutgoingTransition(null, 'c', false, 0);
        
        NavigableMap<Character, ModifiableDAWGNode> outgoingTransitionTreeMap = node1.getOutgoingTransitions();
        
        assertEquals(3, outgoingTransitionTreeMap.size());
        assertTrue(outgoingTransitionTreeMap.get('a').isAcceptNode());
        assertFalse(outgoingTransitionTreeMap.get('b').isAcceptNode());
        assertFalse(outgoingTransitionTreeMap.get('b').isAcceptNode());
    }
    
    @Test
    public void cloneTest() {
        ModifiableDAWGNode node1 = new ModifiableDAWGNode(null, false, 0);
        node1.addOutgoingTransition(null, 'a', false, 0);
        node1.addOutgoingTransition(null, 'b', true, 0);
        ModifiableDAWGNode cloneNode1 = new ModifiableDAWGNode(node1, 0);
        
        ModifiableDAWGNode node2 = new ModifiableDAWGNode(null, true, 0);
        node2.addOutgoingTransition(null, 'c', false, 0);
        node2.addOutgoingTransition(null, 'd', true, 0);
        ModifiableDAWGNode cloneNode2 = new ModifiableDAWGNode(node2, 0);
        
        assertTrue(node1 != cloneNode1);
        assertEquals(node1.getIncomingTransitionCount(), cloneNode1.getIncomingTransitionCount());
        assertEquals(node1.isAcceptNode(), cloneNode1.isAcceptNode());
        assertEquals(node1.getOutgoingTransitions(), cloneNode1.getOutgoingTransitions());
        
        assertTrue(node2 != cloneNode2);
        assertEquals(node2.getIncomingTransitionCount(), cloneNode2.getIncomingTransitionCount());
        assertEquals(node2.isAcceptNode(), cloneNode2.isAcceptNode());
        assertEquals(node2.getOutgoingTransitions(), cloneNode2.getOutgoingTransitions());
    }
    
    @Test
    public void transitionTest1() {
        ModifiableDAWGNode node1 = new ModifiableDAWGNode(null, false, 0);
        ModifiableDAWGNode currentNode = node1;
        
        char[] alphabet = {'a', 'b', 'c','d', 'e', 'f', 'g', 'h', 'i', 'j', 'k'};
        
        for (int i = 0; i < alphabet.length; i++)
            currentNode = currentNode.addOutgoingTransition(null, alphabet[i], i % 2 == 0, 0);
        
        String alphaStr = new String(alphabet);
        
        assertNotNull(node1.transition(alphaStr));
    }
    
    @Test
    public void reassignOutgoingTransitionTest() {
        ModifiableDAWGNode node1 = new ModifiableDAWGNode(null, false, 0);
        node1.addOutgoingTransition(null, 'a', true, 0);
        node1.addOutgoingTransition(null, 'b', false, 0);
        node1.addOutgoingTransition(null, 'c', true, 0);
        node1.addOutgoingTransition(null, 'd', false, 0);
        
        ModifiableDAWGNode node2 = new ModifiableDAWGNode(null, true, 0);
        node1.reassignOutgoingTransition('a', node1.transition('a'), node2);
        
        ModifiableDAWGNode node3 = new ModifiableDAWGNode(null, false, 0);
        node1.reassignOutgoingTransition('b', node1.transition('b'), node3);
        
        ModifiableDAWGNode node4 = new ModifiableDAWGNode(null, false, 0);
        node1.reassignOutgoingTransition('c', node1.transition('c'), node4);
        
        ModifiableDAWGNode node5 = new ModifiableDAWGNode(null, true, 0);
        node1.reassignOutgoingTransition('d', node1.transition('d'), node5);
        
        assertTrue(node1.transition('a') == node2);
        assertEquals(1, node2.getIncomingTransitionCount());
        
        assertTrue(node1.transition('b') == node3);
        assertEquals(1, node3.getIncomingTransitionCount());
        
        assertTrue(node1.transition('c') == node4);
        assertEquals(1, node4.getIncomingTransitionCount());
        
        assertTrue(node1.transition('d') == node5);
        assertEquals(1, node5.getIncomingTransitionCount());
    }
    
    @Test
    public void cloneTest2() {
        ModifiableDAWGNode node1 = new ModifiableDAWGNode(null, false, 0);
        
        ModifiableDAWGNode node2 = node1.addOutgoingTransition(null, '\0', false, 0);
        node2.addOutgoingTransition(null, 'a', false, 0);
        node2.addOutgoingTransition(null, 'b', false, 0);
        node2.addOutgoingTransition(null, 'c', false, 0);
        
        ModifiableDAWGNode node3 = node2.clone(node1, '\0', 0);
        
        assertTrue(node2 != node3);
        assertTrue(node2.hasOutgoingTransition('a') && node3.hasOutgoingTransition('a'));
        assertTrue(node2.hasOutgoingTransition('b') && node3.hasOutgoingTransition('b'));
        assertTrue(node2.hasOutgoingTransition('c') && node3.hasOutgoingTransition('c'));
        
        assertEquals(1, node1.getOutgoingTransitions().size());
        assertEquals(1, node3.getIncomingTransitionCount());
        assertEquals(0, node2.getIncomingTransitionCount());
    }
    
    @Test
    public void equalsTest() {
        ModifiableDAWGNode node1 = new ModifiableDAWGNode(null, false, 0);
        ModifiableDAWGNode node2 = new ModifiableDAWGNode(null, false, 0);
        
        ModifiableDAWGNode node3 = new ModifiableDAWGNode(null, true, 0);
        ModifiableDAWGNode node4 = new ModifiableDAWGNode(null, true, 0);
        
        ModifiableDAWGNode currentNode1 = node1;
        ModifiableDAWGNode currentNode2 = node2;

        char[] alphabet = {'a', 'b', 'c','d', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'};
        
        for (int i = 0; i < alphabet.length; i++) {
           currentNode1 = currentNode1.addOutgoingTransition(null, alphabet[i], i % 2 == 0, 0);
           currentNode2 = currentNode2.addOutgoingTransition(null, alphabet[i], i % 2 == 0, 0);
        }
            
        assertEquals(node1, node2);
        assertEquals(node3, node4);
        
        assertFalse(node1.equals(node3));
        assertFalse(node2.equals(node4));
    }
    
    @Test
    public void hashTest() {
        ModifiableDAWGNode node1 = new ModifiableDAWGNode(null, false, 0);
        ModifiableDAWGNode node2 = new ModifiableDAWGNode(null, false, 0);
        
        ModifiableDAWGNode node3 = new ModifiableDAWGNode(null, true, 0);
        ModifiableDAWGNode node4 = new ModifiableDAWGNode(null, true, 0);
        
        ModifiableDAWGNode currentNode1 = node1;
        ModifiableDAWGNode currentNode2 = node2;

        char[] alphabet = {'a', 'b', 'c','d', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'};
        
        for (int i = 0; i < alphabet.length; i++) {
           currentNode1 = currentNode1.addOutgoingTransition(null, alphabet[i], i % 2 == 0, 0);
           currentNode2 = currentNode2.addOutgoingTransition(null, alphabet[i], i % 2 == 0, 0);
        }
        
        assertEquals(node1.hashCode(), node2.hashCode());
        assertEquals(node3.hashCode(), node4.hashCode());
        assertTrue(node1.hashCode() != node3.hashCode());
        assertTrue(node2.hashCode() != node4.hashCode());
    }
}