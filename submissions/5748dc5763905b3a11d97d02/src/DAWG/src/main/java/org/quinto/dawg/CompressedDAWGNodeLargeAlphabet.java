package org.quinto.dawg;

import org.quinto.dawg.util.LookaheadIterator;
import java.util.Iterator;

class CompressedDAWGNodeLargeAlphabet extends CompressedDAWGNode {
    CompressedDAWGNodeLargeAlphabet(CompressedDAWGSet graph, int index) {
        super(graph, index);
    }

    /**
     * Retrieves the accept state status of this node.
     
     * @return      true if this node is an accept state, false otherwise
     */
    @Override
    public boolean isAcceptNode() {
        return index < 0 ? true : (graph.outgoingData[index + 1] & ACCEPT_NODE_MASK) == ACCEPT_NODE_MASK;
    }
    
    /**
     * Retrieves the index in this node's containing array that its transition set begins at.
     
     * @return      an int of the index in this node's containing array at which its transition set begins
     */
    @Override
    public int getTransitionSetBeginIndex() {
        return index < 0 ? 0 : graph.outgoingData[index + 1] & TRANSITION_SET_BEGIN_INDEX_MASK;
    }
    
    /**
     * Retrieves the size of this node's outgoing transition set.
     
     * @return      an int denoting the size of this node's outgoing transition set
     */
    @Override
    public int getOutgoingTransitionsSize() {
        return index < 0 ? 0 : graph.outgoingData[index + 2];
    }
    
    @Override
    public Iterable<CompressedDAWGNode> getOutgoingTransitionsNodes() {
        return new Iterable<CompressedDAWGNode>() {
            private final int size = getOutgoingTransitionsSize();
            
            @Override
            public Iterator<CompressedDAWGNode> iterator() {
                return new LookaheadIterator<CompressedDAWGNode>() {
                    private int current;
                    private int childrenIdx = getTransitionSetBeginIndex();
                    
                    @Override
                    public CompressedDAWGNode nextElement() {
                        if (current < size) {
                            CompressedDAWGNode child = new CompressedDAWGNodeLargeAlphabet(graph, childrenIdx);
                            current++;
                            childrenIdx += CompressedDAWGSetLargeAlphabet.OUTGOING_TRANSITION_SIZE_IN_INTS;
                            return child;
                        } else
                            throw NO_SUCH_ELEMENT_EXCEPTION;
                    }
                };
            }
        };
    }
    
    /**
     * Follows an outgoing transition from this node.
     
     * @param letter            the char representation of the desired transition's label
     * @return                  the CompressedDAWGNode that is the target of the transition labeled with {@code letter},
     *                          or null if there is no such labeled transition from this node
     */
    @Override
    public CompressedDAWGNode transition(char letter) {
        int begin = graph.outgoingData[index + 1] & TRANSITION_SET_BEGIN_INDEX_MASK;
        int to = begin + graph.outgoingData[index + 2] * CompressedDAWGSetLargeAlphabet.OUTGOING_TRANSITION_SIZE_IN_INTS;
        int pos = CompressedDAWGSet.binarySearchFirstOccurrence(graph.outgoingData, begin, to, letter, CompressedDAWGSetLargeAlphabet.OUTGOING_TRANSITION_SIZE_IN_INTS);
        if (pos < 0)
            return null;
        return new CompressedDAWGNodeLargeAlphabet(graph, pos);
    }
}