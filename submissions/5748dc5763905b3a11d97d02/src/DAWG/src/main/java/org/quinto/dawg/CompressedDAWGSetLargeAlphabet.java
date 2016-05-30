package org.quinto.dawg;

import org.quinto.dawg.util.SemiNavigableMap;
import org.quinto.dawg.util.SimpleEntry;
import java.util.Iterator;

class CompressedDAWGSetLargeAlphabet extends CompressedDAWGSet {
    private static final long serialVersionUID = 1L;
    static final int OUTGOING_TRANSITION_SIZE_IN_INTS = 3;
    
    CompressedDAWGSetLargeAlphabet() {
    }
    
    @Override
    int getOutgoingTransitionSizeInInts() {
        return OUTGOING_TRANSITION_SIZE_IN_INTS;
    }
    
    @Override
    void calculateCachedValues() {
    }

    @Override
    public int getTransitionCount() {
        return outgoingData.length / OUTGOING_TRANSITION_SIZE_IN_INTS - 1;
    }
    
    /**
     * Returns the ModifiableDAWGSet's source node.
    
     * @return      the ModifiableDAWGNode or CompressedDAWGNode functioning as the ModifiableDAWGSet's source node.
     */
    @Override
    public CompressedDAWGNode getSourceNode() {
        if (sourceNode == null)
            sourceNode = new CompressedDAWGNodeLargeAlphabet(this, DAWGNode.START);
        return sourceNode;
    }

    @Override
    SemiNavigableMap<Character, DAWGNode> getOutgoingTransitions(DAWGNode parent) {
        return new OutgoingTransitionsMap((CompressedDAWGNode)parent, false);
    }
    
    private class OutgoingTransitionsMap implements SemiNavigableMap<Character, DAWGNode> {
        private final CompressedDAWGNode cparent;
        private final boolean desc;
        private final int from;
        private final int to;
        
        public OutgoingTransitionsMap(CompressedDAWGNode cparent, boolean desc) {
            this.cparent = cparent;
            this.desc = desc;
            from = cparent.getTransitionSetBeginIndex();
            to = from + (cparent.getOutgoingTransitionsSize() - 1) * OUTGOING_TRANSITION_SIZE_IN_INTS;
        }
        
        @Override
        public Iterator<SimpleEntry<Character, DAWGNode>> iterator() {
            return new Iterator<SimpleEntry<Character, DAWGNode>>() {
                private int current = desc ? to : from;

                @Override
                public boolean hasNext() {
                    return desc ? current >= from : current <= to;
                }

                @Override
                public SimpleEntry<Character, DAWGNode> next() {
                    char c = (char)outgoingData[current];
                    CompressedDAWGNode node = new CompressedDAWGNodeLargeAlphabet(CompressedDAWGSetLargeAlphabet.this, current);
                    if (desc)
                        current -= OUTGOING_TRANSITION_SIZE_IN_INTS;
                    else
                        current += OUTGOING_TRANSITION_SIZE_IN_INTS;
                    return new SimpleEntry<Character, DAWGNode>(c, node);
                }

                @Override
                public void remove() {
                    throw new UnsupportedOperationException();
                }
            };
        }

        @Override
        public boolean isEmpty() {
            return from > to;
        }

        @Override
        public SemiNavigableMap<Character, DAWGNode> descendingMap() {
            return new OutgoingTransitionsMap(cparent, !desc);
        }
    }
}