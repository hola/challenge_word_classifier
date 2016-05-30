package org.quinto.dawg;

import org.quinto.dawg.util.SemiNavigableMap;
import org.quinto.dawg.util.SimpleEntry;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.NavigableSet;
import java.util.TreeSet;
import org.quinto.dawg.util.UnmodifiableNavigableSet;

public class CompressedDAWGSet extends DAWGSet implements Serializable {
    private static final long serialVersionUID = 1L;
    private static final CompressedDAWGNode EMPTY_NODE = new CompressedDAWGNode(null, DAWGNode.EMPTY);
    static final int INCOMING_TRANSITION_SIZE_IN_INTS = 3;
    
    /**
     * Array that will contain a space-saving version of the ModifiableDAWGSet after a call to compress().
     */
    int outgoingData[];
    
    int incomingData[];
    
    /**
     * An array of all letters used in this dictionary (an alphabet of the language defined by this DAWG).
     */
    char letters[];
    
    /**
     * A mapping from characters of {@link #letters} array to their positions in that array.
     */
    private transient Map<Character, Integer> lettersIndex;
    
    /**
     * Quantity of words in this DAWG.
     */
    transient Integer size;
    
    transient NavigableSet<Character> alphabet;
    
    /**
     * Maximal length of words contained in this DAWG.
     */
    transient Integer maxLength;
    
    private transient int transitionSizeInInts;
    
    /**
     * CompressedDAWGNode from which all others in the structure are reachable
     */
    transient CompressedDAWGNode sourceNode;
    
    private transient CompressedDAWGNode endNode;
    
    private transient Integer hashCode;
    
    /**
     * Package-private constructor.
     * Use {@link ModifiableDAWGSet#compress} to create instances of this class.
     */
    CompressedDAWGSet() {
    }
    
    /**
     * This method is invoked when the object is read from input stream.
     * @see Serializable
     */
    private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
        ois.defaultReadObject();
        calculateCachedValues();
    }
    
    /**
     * Returns the ModifiableDAWGSet's source node.
    
     * @return      the ModifiableDAWGNode or CompressedDAWGNode functioning as the ModifiableDAWGSet's source node.
     */
    @Override
    public CompressedDAWGNode getSourceNode() {
        if (sourceNode == null)
            sourceNode = new CompressedDAWGNode(this, DAWGNode.START);
        return sourceNode;
    }
    
    @Override
    CompressedDAWGNode getEndNode() {
        if (endNode == null)
            endNode = new CompressedDAWGNode(this, DAWGNode.END);
        return endNode;
    }
    
    @Override
    DAWGNode getEmptyNode() {
        return EMPTY_NODE;
    }

    @Override
    public boolean isWithIncomingTransitions() {
        return incomingData != null;
    }
    
    @Override
    Collection<? extends DAWGNode> getNodesBySuffix(String suffix) {
        char suffixText[] = suffix.toCharArray();
        char lastChar = suffixText[suffixText.length - 1];
        Iterable<CompressedDAWGNode> ret = getEndNode().getIncomingTransitions(lastChar);
        for (int i = suffixText.length - 1; i >= 0; i--) {
            List<CompressedDAWGNode> levelNodes = new ArrayList<CompressedDAWGNode>();
            char c = suffixText[i];
            for (CompressedDAWGNode node : ret)
                if (node.getId() != DAWGNode.START)
                    for (CompressedDAWGNode incoming : node.getIncomingTransitions(c))
                        levelNodes.add(incoming);
            if (i == 0)
                return levelNodes;
            ret = levelNodes;
        }
        // This can never happen.
        // If the string is empty then an ArrayIndexOutOfBoundsException would be thrown
        // when trying to get the last char of suffix.
        // If the string is not empty then a loop would be entered and a list would be
        // returned at last iteration.
        throw new IllegalArgumentException("This method should not be called on empty strings");
    }
    
    Map<Character, Integer> getLettersIndex() {
        if (lettersIndex == null) {
            Map<Character, Integer> ret = new HashMap<Character, Integer>();
            for (int i = 0; i < letters.length; i++)
                ret.put(letters[i], i);
            lettersIndex = ret;
        }
        return lettersIndex;
    }
    
    int getOutgoingTransitionSizeInInts() {
        return transitionSizeInInts;
    }
    
    void calculateCachedValues() {
        // Int 0:
        // Accept node mark (boolean, first bit)
        // Outgoing nodes array begin index (int, 31 bits)
        // The rest:
        // Bit array for each char denoting if there exists a transition
        // from this node to the letter in a specified position
        transitionSizeInInts = 1 + ((letters.length + 31) >>> 5);
    }

    @Override
    int getMaxLength() {
        if (maxLength == null)
            maxLength = getMaxLength(getSourceNode(), 0);
        return maxLength;
    }
    
    int getMaxLength(CompressedDAWGNode node, int length) {
        int ret = length;
        for (CompressedDAWGNode child : node.getOutgoingTransitionsNodes())
            ret = Math.max(ret, getMaxLength(child, length + 1));
        return ret;
    }

    @Override
    public int getTransitionCount() {
        return outgoingData.length / transitionSizeInInts - 1;
    }
    
    @Override
    public int size() {
        if (size == null) {
            int s = 0;
            for (String word : this)
                s++;
            size = s;
        }
        return size;
    }
    
    private void countNodes(CompressedDAWGNode node, HashSet<Integer> nodeIDHashSet) {
        if (node.getOutgoingTransitionsSize() != 0)
            nodeIDHashSet.add(node.getTransitionSetBeginIndex());
        for (CompressedDAWGNode child : node.getOutgoingTransitionsNodes())
            countNodes(child, nodeIDHashSet);
    }
    
    @Override
    public int getNodeCount() {
        HashSet<Integer> ids = new HashSet<Integer>();
        countNodes(getSourceNode(), ids);
        return ids.size() + 1;
    }

    @Override
    public int hashCode() {
        // Hash code should return the same value for equal objects.
        // Simplified equals() method is possible but simplification
        // of hashCode() would give results that differ from other Set implementations.
        if (hashCode == null)
            hashCode = super.hashCode();
        return hashCode;
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == this)
            return true;
        if (obj instanceof CompressedDAWGSet) {
            CompressedDAWGSet other = (CompressedDAWGSet)obj;
            return isWithIncomingTransitions() == other.isWithIncomingTransitions() &&
                   Arrays.equals(letters, other.letters) &&
                   Arrays.equals(outgoingData, other.outgoingData) &&
                   Arrays.equals(incomingData, other.incomingData);
        }
        return super.equals(obj);
    }

    @Override
    public NavigableSet<Character> getAlphabet() {
        if (alphabet == null) {
            NavigableSet<Character> lettersSet = new TreeSet<Character>();
            for (char c : letters)
                lettersSet.add(c);
            alphabet = new UnmodifiableNavigableSet<Character>(lettersSet);
        }
        return alphabet;
    }
    
    public ModifiableDAWGSet uncompress() {
        ModifiableDAWGSet ret = new ModifiableDAWGSet(isWithIncomingTransitions());
        ret.addAll(this);
        return ret;
    }

    @Override
    SemiNavigableMap<Character, DAWGNode> getOutgoingTransitions(DAWGNode parent) {
        return new OutgoingTransitionsMap((CompressedDAWGNode)parent, false);
    }

    @Override
    SemiNavigableMap<Character, Collection<? extends DAWGNode>> getIncomingTransitions(DAWGNode parent) {
        return new IncomingTransitionsMap((CompressedDAWGNode)parent, false);
    }
    
    static int binarySearchFirstOccurrence(int array[], int from, int to, int key, int step) {
        int low = from;
        int high = to - step;
        int ret = -1;
        while (low <= high) {
            int mid = (low + high) >>> 1;
            mid -= (mid - low) % step;
            int midVal = array[mid];
            if (midVal < key)
                low = mid + step;
            else if (midVal > key)
                high = mid - step;
            else {
                high = mid - step;
                ret = mid;
            }
        }
        return ret < 0 ? -(low + 1) : ret;
    }

    @Override
    public boolean isEmpty() {
        if (size == null)
            return !getSourceNode().isAcceptNode() && getSourceNode().getOutgoingTransitionsSize() == 0;
        return size == 0;
    }

    @Override
    public boolean isImmutable() {
        return true;
    }
    
    private class OutgoingTransitionsMap implements SemiNavigableMap<Character, DAWGNode> {
        private final CompressedDAWGNode cparent;
        private final boolean desc;
        private final int from;
        private final int to;
        private final int fromChars;
        private final int toChars;
        
        public OutgoingTransitionsMap(CompressedDAWGNode cparent, boolean desc) {
            this.cparent = cparent;
            this.desc = desc;
            from = cparent.getTransitionSetBeginIndex();
            to = from + (cparent.getOutgoingTransitionsSize() - 1) * transitionSizeInInts;
            fromChars = cparent.getIndex() + 1;
            toChars = cparent.getIndex() + transitionSizeInInts - 1;
        }
        
        @Override
        public Iterator<SimpleEntry<Character, DAWGNode>> iterator() {
            return new Iterator<SimpleEntry<Character, DAWGNode>>() {
                private int current = desc ? to : from;
                private int currentCharInt = desc ? toChars : fromChars;
                private int currentCharShift = (currentCharInt - fromChars) << 5;
                private int currentCharSet = to < from ? 0 : outgoingData[currentCharInt];

                @Override
                public boolean hasNext() {
                    return desc ? current >= from : current <= to;
                }

                @Override
                public SimpleEntry<Character, DAWGNode> next() {
                    CompressedDAWGNode node = new CompressedDAWGNode(CompressedDAWGSet.this, current);
                    int charIndex;
                    if (desc) {
                        current -= transitionSizeInInts;
                        while (currentCharSet == 0) {
                            currentCharInt--;
                            currentCharShift -= 32;
                            currentCharSet = outgoingData[currentCharInt];
                        }
                        charIndex = Integer.highestOneBit(currentCharSet);
                    } else {
                        current += transitionSizeInInts;
                        while (currentCharSet == 0) {
                            currentCharInt++;
                            currentCharShift += 32;
                            currentCharSet = outgoingData[currentCharInt];
                        }
                        charIndex = Integer.lowestOneBit(currentCharSet);
                    }
                    currentCharSet ^= charIndex;
                    char letter = letters[currentCharShift + Integer.numberOfTrailingZeros(charIndex)];
                    return new SimpleEntry<Character, DAWGNode>(letter, node);
                }

                @Override
                public void remove() {
                    throw new UnsupportedOperationException();
                }
            };
        }

        @Override
        public boolean isEmpty() {
            return cparent.getOutgoingTransitionsSize() == 0;
        }

        @Override
        public SemiNavigableMap<Character, DAWGNode> descendingMap() {
            return new OutgoingTransitionsMap(cparent, !desc);
        }
    }
    
    private class IncomingTransitionsMap implements SemiNavigableMap<Character, Collection<? extends DAWGNode>> {
        private final CompressedDAWGNode cparent;
        private final boolean desc;
        private final int from;
        private final int to;
        
        public IncomingTransitionsMap(CompressedDAWGNode cparent, boolean desc) {
            this.cparent = cparent;
            this.desc = desc;
            int index = cparent.getIndex();
            // Start node has no incoming transitions.
            if (index == DAWGNode.START) {
                from = 1;
                to = 0;
            } else {
                // End node is located at the beginning.
                if (index == DAWGNode.END)
                    index = 0;
                from = incomingData[index + 1];
                to = from + (incomingData[index + 2] - 1) * INCOMING_TRANSITION_SIZE_IN_INTS;
            }
        }
        
        @Override
        public Iterator<SimpleEntry<Character, Collection<? extends DAWGNode>>> iterator() {
            return new Iterator<SimpleEntry<Character, Collection<? extends DAWGNode>>>() {
                private int current = desc ? to : from;
                private char currentLetter = from > to ? '\0' : (char)incomingData[current];

                @Override
                public boolean hasNext() {
                    return desc ? current >= from : current <= to;
                }

                @Override
                public SimpleEntry<Character, Collection<? extends DAWGNode>> next() {
                    List<DAWGNode> nodes = new ArrayList<DAWGNode>();
                    char retLetter = currentLetter;
                    while (hasNext()) {
                        char c = (char)incomingData[current];
                        if (c != currentLetter) {
                            currentLetter = c;
                            break;
                        }
                        CompressedDAWGNode node = new CompressedDAWGNode(CompressedDAWGSet.this, current);
                        nodes.add(node);
                        if (desc)
                            current -= INCOMING_TRANSITION_SIZE_IN_INTS;
                        else
                            current += INCOMING_TRANSITION_SIZE_IN_INTS;
                    }
                    return new SimpleEntry<Character, Collection<? extends DAWGNode>>(retLetter, nodes);
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
        public SemiNavigableMap<Character, Collection<? extends DAWGNode>> descendingMap() {
            return new IncomingTransitionsMap(cparent, !desc);
        }
    }
}