package org.quinto.dawg;

import java.io.File;
import java.io.FileOutputStream;
import org.quinto.dawg.util.SemiNavigableMap;
import org.quinto.dawg.util.LookaheadIterator;
import java.io.IOException;
import java.lang.reflect.Array;
import java.text.SimpleDateFormat;
import java.util.AbstractSet;
import java.util.BitSet;
import java.util.Collection;
import java.util.Collections;
import java.util.Deque;
import java.util.Iterator;
import java.util.ArrayDeque;
import java.util.Comparator;
import java.util.Date;
import java.util.Map;
import java.util.NavigableSet;

public abstract class DAWGSet extends AbstractSet<String> implements NavigableSet<String>, StringsFilter {
    private static final SimpleDateFormat dotFileNameDateFormat = new SimpleDateFormat("yyyyMMddHHmmssSSS");
    
    /**
     * Folder where to save images when {@link #saveAsImage} is called. Default is the relative directory named "temp".
     */
    private static String imagesPath = "temp";
    
    /**
     * Path to GraphViz dot executable. Default is "dot" (works if added to environment variables).
     */
    private static String dotExecutablePath = "dot";

    public static String getImagesPath() {
        return imagesPath;
    }

    public static void setImagesPath(String imagesPath) {
        DAWGSet.imagesPath = imagesPath;
    }

    public static String getDotExecutablePath() {
        return dotExecutablePath;
    }

    public static void setDotExecutablePath(String dotExecutablePath) {
        DAWGSet.dotExecutablePath = dotExecutablePath;
    }
    
    DAWGSet() {
    }

    public abstract boolean isWithIncomingTransitions();
    
    abstract SemiNavigableMap<Character, DAWGNode> getOutgoingTransitions(DAWGNode parent);
    
    abstract SemiNavigableMap<Character, Collection<? extends DAWGNode>> getIncomingTransitions(DAWGNode parent);
  
    public String toGraphViz(boolean withNodeIds, boolean withIncomingTransitions) {
        if (withIncomingTransitions)
            withIncomingTransitions = isWithIncomingTransitions();
        StringBuilder dot = new StringBuilder("digraph dawg {\n");
        dot.append("graph [rankdir=LR, ratio=fill];\n");
        dot.append("node [fontsize=14, shape=circle];\n");
        dot.append("edge [fontsize=12];\n");
        Deque<DAWGNode> stack = new ArrayDeque<DAWGNode>();
        BitSet visited = new BitSet();
        stack.add(getSourceNode());
        visited.set(getSourceNode().getId());
        if (withIncomingTransitions) {
            stack.add(getEndNode());
            visited.set(getEndNode().getId());
        }
        while (true) {
            DAWGNode node = stack.pollLast();
            if (node == null)
                break;
            dot.append('n').append(node.getId()).append(" [label=\"").append(node.isAcceptNode() ? 'O' : ' ').append('\"');
            if (withNodeIds) {
                dot.append(", xlabel=\"");
                if (node.getId() == DAWGNode.START)
                    dot.append("START");
                else if (node.getId() == DAWGNode.END)
                    dot.append("END");
                else
                    dot.append(node.getId());
                dot.append('\"');
            }
            dot.append("];\n");
            for (Map.Entry<Character, DAWGNode> e : getOutgoingTransitions(node)) {
                DAWGNode nextNode = e.getValue();
                dot.append('n').append(node.getId()).append(" -> n").append(nextNode.getId()).append(" [label=\"").append(e.getKey()).append("\"];\n");
                if (!visited.get(nextNode.getId())) {
                    stack.addLast(nextNode);
                    visited.set(nextNode.getId());
                }
            }
            if (withIncomingTransitions) {
                for (Map.Entry<Character, Collection<? extends DAWGNode>> e : getIncomingTransitions(node)) {
                    for (DAWGNode prevNode : e.getValue()) {
                        dot.append('n').append(node.getId()).append(" -> n").append(prevNode.getId()).append(" [label=\"").append(e.getKey()).append("\", style=dashed];\n");
                        if (!visited.get(prevNode.getId())) {
                            stack.addLast(prevNode);
                            visited.set(prevNode.getId());
                        }
                    }
                }
            }
        }
        dot.append('}');
        return dot.toString();
    }

    public void saveAsImage(boolean withNodeIds, boolean withIncomingTransitions) throws IOException {
        String graphViz = toGraphViz(withNodeIds, withIncomingTransitions);
        File dotFile = File.createTempFile("dawg", ".dot");
        byte bytes[] = graphViz.getBytes("UTF-8");
        FileOutputStream fos = null;
        IOException ex = null;
        try {
            fos = new FileOutputStream(dotFile);
            int len = bytes.length;
            int rem = len;
            while (rem > 0) {
                int n = Math.min(rem, 8192);
                fos.write(bytes, len - rem, n);
                rem -= n;
            }
        } finally {
            if (fos != null) {
                try {
                    fos.close();
                } catch (IOException e) {
                    ex = e;
                }
            }
        }
        if (ex != null)
            throw ex;
        File dir = new File(imagesPath);
        if (!dir.exists())
            dir.mkdirs();
        File imageFile = File.createTempFile("dawg" + dotFileNameDateFormat.format(new Date()) + (System.nanoTime() % 1000000L), ".png", dir);
        ProcessBuilder pb = new ProcessBuilder(dotExecutablePath, "-Tpng", dotFile.getAbsolutePath(), "-o", imageFile.getAbsolutePath());
        try {
            pb.start().waitFor();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } finally {
            dotFile.delete();
        }
    }
    
    /**
     * Returns the DAWGSet's source node.
    
     * @return      the ModifiableDAWGNode or CompressedDAWGNode functioning as the DAWGSet's source node.
     */
    public abstract DAWGNode getSourceNode();
    
    abstract DAWGNode getEndNode();
    
    abstract DAWGNode getEmptyNode();
    
    /**
     * Determines whether a String is present in the DAWGSet.
     
     * @param str       the String to be searched for
     * @return          true if {@code str} is present in the DAWGSet, and false otherwise
     */
    @Override
    public boolean contains(Object str) {
        DAWGNode targetNode = getSourceNode().transition((String)str);
        return targetNode != null && targetNode.isAcceptNode();
    }

    @Override
    public boolean remove(Object o) {
        throw new UnsupportedOperationException();
    }

    public boolean addAll(Iterable<? extends String> c) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Iterator<String> iterator() {
        return getStrings("", null, null, false, null, false, null, false).iterator();
    }

    @Override
    public Iterator<String> descendingIterator() {
        return getStrings("", null, null, true, null, false, null, false).iterator();
    }
    
    /**
     * Retrieves all the valid Strings that have been inserted in to the DAWGSet.
     
     * @return      a NavigableSet containing all the Strings that have been inserted into the DAWGSet
     */
    @Override
    public Iterable<String> getAllStrings() {
        return getStrings("", null, null, false, null, false, null, false);
    }
    
    /**
     * Retrieves all the Strings in the DAWGSet that begin with a given String.
     
     * @param prefixStr     a String that is the prefix for all the desired Strings
     * @return              a NavigableSet containing all the Strings present in the DAWGSet that begin with {@code prefixString}
     */
    @Override
    public Iterable<String> getStringsStartingWith(String prefixStr) {
        return getStrings(prefixStr, null, null, false, null, false, null, false);
    }
    
    /**
     * Retrieves all the Strings in the DAWGSet that contain a given String.
     
     * @param str       a String that is contained in all the desired Strings
     * @return          a NavigableSet containing all the Strings present in the DAWGSet that begin with {@code prefixString}
     */
    @Override
    public Iterable<String> getStringsWithSubstring(String str) {
        return getStrings("", str, null, false, null, false, null, false);
    }
    
    /**
     * Retrieves all the Strings in the DAWGSet that begin with a given String.
     
     * @param suffixStr         a String that is the suffix for all the desired Strings
     * @return                  a NavigableSet containing all the Strings present in the DAWGSet that end with {@code suffixStr}
     */
    @Override
    public Iterable<String> getStringsEndingWith(String suffixStr) {
        return getStrings("", null, suffixStr, false, null, false, null, false);
    }
    
    /**
     * Returns the quantity of transitions in this DAWG: number of edges in graph.
     * @return quantity of transitions
     */
    public abstract int getTransitionCount();
    
    public abstract int getNodeCount();
    
    abstract Collection<? extends DAWGNode> getNodesBySuffix(String suffix);
    
    abstract int getMaxLength();
    
    public Iterable<String> getStrings(final String prefixString, final String subString, final String suffixString, final boolean descending, final String fromString, final boolean inclFrom, final String toString, final boolean inclTo) {
        if (suffixString != null && !suffixString.isEmpty() && isWithIncomingTransitions() && (prefixString == null || prefixString.isEmpty())) {
            // Suffix search.
            return new Iterable<String>() {
                @Override
                public Iterator<String> iterator() {
                    return new LookaheadIterator<String>() {
                        private char buffer[];
                        private Deque<Character> charsStack;
                        private Deque<Integer> levelsStack;
                        private Deque<Boolean> checkSubStack;
                        private final Deque<DAWGNode> stack = new ArrayDeque<DAWGNode>();
                        private char from[];
                        private char to[];
                        private char sub[];
                        
                        {
                            Collection<? extends DAWGNode> originNodes = getNodesBySuffix(suffixString);
                            if (!originNodes.isEmpty()) {
                                buffer = new char[getMaxLength()];
                                System.arraycopy(suffixString.toCharArray(), 0, buffer, buffer.length - suffixString.length(), suffixString.length());
                                stack.addAll(originNodes);
                                checkSubStack = new ArrayDeque<Boolean>();
                                checkSubStack.addAll(Collections.nCopies(originNodes.size(), true));
                                levelsStack = new ArrayDeque<Integer>();
                                levelsStack.addAll(Collections.nCopies(originNodes.size(), suffixString.length()));
                                charsStack = new ArrayDeque<Character>();
                                if (subString != null && !subString.isEmpty() && !suffixString.contains(subString))
                                    sub = subString.toCharArray();
                                if (fromString != null && (!inclFrom || !fromString.isEmpty()))
                                    from = fromString.toCharArray();
                                if (toString != null)
                                    to = toString.toCharArray();
                            }
                        }
                        
                        @Override
                        public String nextElement() {
                            while (true) {
                                DAWGNode node = stack.pollLast();
                                if (node == null)
                                    throw NO_SUCH_ELEMENT_EXCEPTION;
                                int level = levelsStack.pollLast();
                                int currentCharPos = buffer.length - level;
                                if (level > suffixString.length()) {
                                    char c = charsStack.pollLast();
                                    buffer[currentCharPos] = c;
                                }
                                boolean checkSub = checkSubStack.pollLast();
                                boolean skipCurrent = false;
                                if (checkSub && sub != null) {
                                    skipCurrent = level < sub.length;
                                    if (!skipCurrent) {
                                        for (int i = 0; i < sub.length; i++) {
                                            if (sub[i] != buffer[currentCharPos + i]) {
                                                skipCurrent = true;
                                                break;
                                            }
                                        }
                                        checkSub = skipCurrent;
                                    }
                                }
                                SemiNavigableMap<Character, Collection<? extends DAWGNode>> childrenMap = getIncomingTransitions(node);
                                if (descending)
                                    childrenMap = childrenMap.descendingMap();
                                for (Map.Entry<Character, Collection<? extends DAWGNode>> e : childrenMap) {
                                    Collection<? extends DAWGNode> children = e.getValue();
                                    stack.addAll(children);
                                    charsStack.addAll(Collections.nCopies(children.size(), e.getKey()));
                                    levelsStack.addAll(Collections.nCopies(children.size(), level + 1));
                                    checkSubStack.addAll(Collections.nCopies(children.size(), checkSub));
                                }
                                if (!skipCurrent && childrenMap.isEmpty()) {
                                    if (from != null) {
                                        int length = Math.min(level, from.length);
                                        boolean equal = true;
                                        for (int i = 0; i < length; i++) {
                                            int cmp = from[i] - buffer[currentCharPos + i];
                                            if (cmp < 0) {
                                                equal = false;
                                                break;
                                            } else if (cmp > 0) {
                                                skipCurrent = true;
                                                break;
                                            }
                                        }
                                        if (!skipCurrent && equal && (from.length > level || level == from.length && !inclFrom))
                                            skipCurrent = true;
                                    }
                                    if (to != null && !skipCurrent) {
                                        int length = Math.min(level, to.length);
                                        boolean equal = true;
                                        for (int i = 0; i < length; i++) {
                                            int cmp = to[i] - buffer[currentCharPos + i];
                                            if (cmp > 0) {
                                                equal = false;
                                                break;
                                            } else if (cmp < 0) {
                                                skipCurrent = true;
                                                break;
                                            }
                                        }
                                        if (!skipCurrent && equal && (to.length < level || level == to.length && !inclTo))
                                            skipCurrent = true;
                                    }
                                    if (!skipCurrent)
                                        return String.valueOf(buffer, currentCharPos, level);
                                }
                            }
                        }
                    };
                }
            };
        }
        // Prefix search.
        return new Iterable<String>() {
            private final String prefixStr = prefixString == null ? "" : prefixString;
            
            @Override
            public Iterator<String> iterator() {
                return new LookaheadIterator<String>() {
                    private char buffer[];
                    private Deque<Character> charsStack;
                    private Deque<Integer> levelsStack;
                    private Deque<Integer> flagsStack;
                    private Deque<DAWGNode> stack;
                    private char from[];
                    private char to[];
                    private char sub[];
                    private char suffix[];
                    
                    {
                        init(fromString, inclFrom, toString, inclTo);
                    }
                    
                    private void init(String fromString, boolean inclFrom, String toString, boolean inclTo) {
                        String fromStr = fromString;
                        String toStr = toString;
                        String subStr = subString;
                        stack = new ArrayDeque<DAWGNode>();
                        //attempt to transition down the path denoted by prefixStr
                        DAWGNode originNode = getSourceNode().transition(prefixStr);
                        if (originNode != null && fromStr != null) {
                            // If fromStr > toStr then return an empty set.
                            if (toStr != null) {
                                int cmp = fromStr.compareTo(toStr);
                                if (cmp > 0 || cmp == 0 && (!inclFrom || !inclTo))
                                    // Here and further in this method it means to return an empty set.
                                    originNode = null;
                            }
                            if (originNode != null) {
                                int cmp = fromStr.compareTo(prefixStr);
                                // No need to limit the range if our prefix definitely lies in this range.
                                if (cmp < 0 || cmp == 0 && inclFrom)
                                    fromStr = null;
                                // Our prefix is out of range.
                                else if (cmp > 0 && !fromStr.startsWith(prefixStr))
                                    originNode = null;
                            }
                        }
                        if (originNode != null && toStr != null) {
                            int cmp = toStr.compareTo(prefixStr);
                            // Our prefix is out of range.
                            if (cmp < 0 || cmp == 0 && !inclTo)
                                originNode = null;
                            // No need to limit the range if our prefix definitely lies in this range.
                            else if (cmp > 0 && !toStr.startsWith(prefixStr))
                                toStr = null;
                        }
                        if (originNode != null && subStr != null) {
                            if (subStr.isEmpty() || prefixStr.contains(subStr) || suffixString != null && suffixString.contains(subStr))
                                subStr = null;
                        }
                        //if there a transition path corresponding to prefixString (one or more stored Strings begin with prefixString)
                        if (originNode != null) {
                            buffer = new char[getMaxLength()];
                            System.arraycopy(prefixStr.toCharArray(), 0, buffer, 0, prefixStr.length());
                            stack.add(originNode);
                            levelsStack = new ArrayDeque<Integer>();
                            levelsStack.add(prefixStr.length() - 1);
                            charsStack = new ArrayDeque<Character>();
                            flagsStack = new ArrayDeque<Integer>();
                            flagsStack.add(encodeFlags(true, true, true));
                            if (fromStr != null && (!inclFrom || !fromStr.isEmpty()))
                                from = fromStr.toCharArray();
                            if (toStr != null)
                                to = toStr.toCharArray();
                            if (subStr != null)
                                sub = subStr.toCharArray();
                            if (suffixString != null && !suffixString.isEmpty())
                                suffix = suffixString.toCharArray();
                        }
                    }
                    
                    private int encodeFlags(boolean checkFrom, boolean checkTo, boolean checkSubstring) {
                        return (checkFrom ? 1 : 0) |
                               (checkTo ? 2 : 0) |
                               (checkSubstring ? 4 : 0);
                    }
                    
                    private void clearStacks() {
                        stack.clear();
                        charsStack.clear();
                        levelsStack.clear();
                        flagsStack.clear();
                    }
                    
                    @Override
                    public String nextElement() {
                        while (true) {
                            DAWGNode node = stack.pollLast();
                            if (node == null)
                                throw NO_SUCH_ELEMENT_EXCEPTION;
                            int level = levelsStack.pollLast();
                            if (level >= prefixStr.length()) {
                                char c = charsStack.pollLast();
                                buffer[level] = c;
                            }
                            int flags = flagsStack.pollLast();
                            boolean checkFrom = (flags & 1) != 0;
                            boolean checkTo = (flags & 2) != 0;
                            boolean checkSubstring = (flags & 4) != 0;
                            boolean skipCurrentString = false;
                            boolean skipChildren = false;
                            if (from != null && checkFrom) {
                                // Here are two variants possible:
                                // 1. from = prefix, inclFrom = false.
                                // 2. from starts with prefix.
                                // Other variants were checked in the constructor.
                                if (level >= prefixStr.length()) {
                                    // Current string starts with prefix.
                                    // The first variant is impossible here
                                    // because it will be rejected while checking current string = prefix.
                                    int cmp;
                                    boolean fromEqualsToCurrent = false;
                                    if (from.length > level) {
                                        cmp = from[level] - buffer[level];
                                        // If we have reached the last letter then all the previous letters match.
                                        // If the last letter of current string equals to the last letter of the lower bound
                                        // then the behavior depends on inclFrom.
                                        // Inclusive behavior is the same as if from < current string.
                                        // Exclusive means that from > current string.
                                        if (cmp == 0 && level + 1 == from.length) {
                                            cmp = -1;
                                            fromEqualsToCurrent = true;
                                            if (!inclFrom)
                                                skipCurrentString = true;
                                        }
                                    } else
                                        cmp = -1;
                                    if (cmp < 0) {
                                        if (descending) {
                                            if (!fromEqualsToCurrent)
                                                checkFrom = false;
                                        } else {
                                            // All further strings match.
                                            from = null;
                                        }
                                    } else if (cmp > 0) {
                                        // All previously added strings are less than current one,
                                        // so they don't suit filter condition.
                                        if (descending)
                                            clearStacks();
                                        // Current string and all its children don't match.
                                        continue;
                                    } else
                                        // Lower bound starts with current string,
                                        // so current string < lower bound => doesn't match.
                                        // But its children may match.
                                        skipCurrentString = true;
                                } else {
                                    // Current string equals to prefix.
                                    // Both variants make us skip current string.
                                    skipCurrentString = true;
                                    // from = prefix, inclFrom = false.
                                    // All the rest strings should be accepted.
                                    // No need to check further.
                                    if (from.length == prefixStr.length())
                                        from = null;
                                }
                            }
                            SemiNavigableMap<Character, DAWGNode> childrenMap = getOutgoingTransitions(node);
                            if (to != null && checkTo) {
                                // Here are two variants possible:
                                // 1. to = prefix, inclTo = true.
                                // 2. to starts with prefix.
                                // Other variants were checked in the constructor.
                                if (level >= prefixStr.length()) {
                                    // Current string starts with prefix.
                                    // Also, to starts with prefix.
                                    int cmp;
                                    boolean toEqualsToCurrent = false;
                                    if (to.length > level) {
                                        cmp = to[level] - buffer[level];
                                        if (cmp == 0 && level + 1 == to.length) {
                                            cmp = inclTo ? 1 : -1;
                                            toEqualsToCurrent = true;
                                        }
                                    } else
                                        cmp = -1;
                                    if (cmp > 0) {
                                        if (descending) {
                                            if (!toEqualsToCurrent || childrenMap.isEmpty())
                                                // All further strings match.
                                                to = null;
                                        } else {
                                            if (!toEqualsToCurrent)
                                                checkTo = false;
                                        }
                                    } else if (cmp < 0) {
                                        // All previously added strings are less than current one,
                                        // so they don't suit filter condition.
                                        if (!descending)
                                            clearStacks();
                                        // Current string and all its children don't match.
                                        continue;
                                    }
                                } else {
                                    // Current string equals to prefix.
                                    if (to.length == prefixStr.length())
                                        // Return only current string. No other strings match.
                                        skipChildren = true;
                                }
                            }
                            if (sub != null && checkSubstring) {
                                boolean endsWithSub = level >= sub.length - 1;
                                if (endsWithSub) {
                                    for (int i = 0; i < sub.length; i++) {
                                        if (sub[i] != buffer[level - sub.length + 1 + i]) {
                                            endsWithSub = false;
                                            break;
                                        }
                                    }
                                }
                                if (endsWithSub)
                                    checkSubstring = false;
                                else
                                    skipCurrentString = true;
                            }
                            boolean retCurrentString = false;
                            if (node.isAcceptNode() && !skipCurrentString) {
                                // Natural ordering: return short string immediately then process all strings starting with it.
                                // Descending ordering: add an artificial node to stack (without children) to process current (short)
                                // string after all strings starting with it.
                                if (!descending || childrenMap.isEmpty())
                                    retCurrentString = true;
                                else {
                                    char letter = level >= prefixStr.length() ? buffer[level] : '\0';
                                    stack.add(getEmptyNode());
                                    levelsStack.add(level);
                                    charsStack.add(letter);
                                    flagsStack.add(encodeFlags(checkFrom, checkTo, checkSubstring));
                                }
                            }
                            if (retCurrentString && suffix != null) {
                                retCurrentString = level >= suffix.length - 1;
                                if (retCurrentString) {
                                    for (int i = 0; i < suffix.length; i++) {
                                        if (suffix[i] != buffer[level - suffix.length + 1 + i]) {
                                            retCurrentString = false;
                                            break;
                                        }
                                    }
                                }
                            }
                            level++;
                            if (!skipChildren) {
                                // This is not a typo. When we need natural ordering, we have to add nodes to stack in reverse order.
                                // Then the first letter in alphabetic order would be the last in the stack and would be processed first.
                                if (!descending)
                                    childrenMap = childrenMap.descendingMap();
                                for (Map.Entry<Character, DAWGNode> e : childrenMap) {
                                    stack.add(e.getValue());
                                    levelsStack.add(level);
                                    charsStack.add(e.getKey());
                                    flagsStack.add(encodeFlags(checkFrom, checkTo, checkSubstring));
                                }
                            }
                            if (retCurrentString)
                                return String.valueOf(buffer, 0, level);
                        }
                    }

                    @Override
                    public void remove(String word) {
                        DAWGSet.this.remove(word);
                        if (descending)
                            init(fromString, inclFrom, word, false);
                        else
                            init(word, false, toString, inclTo);
                    }
                };
            }
        };
    }
    
    /**
     * Determines the longest prefix of a given String that is
 the prefix of another String previously added to the DAWGSet.
     
     * @param str       the String to be processed
     * @return          a String of the longest prefix of {@code str}
                  that is also a prefix of a String contained in the ModifiableDAWGSet
     */
    public String determineLongestPrefixInDAWG(String str) {
        DAWGNode currentNode = getSourceNode();
        char text[] = str.toCharArray();
        
        //Loop through the characters in str, using them in sequence to transition
        //through the DAWGSet until the currently processing node doesn't have a transition
        //labeled with the current processing char, or there are no more characters to process.
        for (int i = 0; i < text.length; i++) {
            char currentChar = str.charAt(i);
            currentNode = currentNode.transition(currentChar);
            if (currentNode == null)
                return str.substring(0, i);
        }
        
        return str;
    }

    @Override
    public String[] toArray() {
        String ret[] = new String[size()];
        int i = 0;
        for (String s : this)
            ret[i++] = s;
        return ret;
    }

    @Override
    public <T> T[] toArray(T a[]) {
        int size = size();
        a = a.length >= size ? a : (T[])Array.newInstance(a.getClass().getComponentType(), size);
        int i = 0;
        for (String s : this)
            a[i++] = (T)s;
        return a;
    }

    @Override
    public boolean removeAll(Collection<?> c) {
        boolean ret = false;
        for (Object e : c)
            ret |= remove((String)e);
        return ret;
    }
    
    public abstract NavigableSet<Character> getAlphabet();
    
    public abstract boolean isImmutable();
    
    private static String getFirstElement(Iterable<String> i) {
        for (String s : i)
            return s;
        return null;
    }
    
    private static String pollFirstElement(Iterable<String> i) {
        for (Iterator<String> it = i.iterator(); it.hasNext();) {
            String s = it.next();
            it.remove();
            return s;
        }
        return null;
    }
    
    private static void checkNotNull(String e) {
        if (e == null)
            throw new NullPointerException();
    }

    @Override
    public String lower(String e) {
        checkNotNull(e);
        return getFirstElement(getStrings("", null, null, true, null, false, e, false));
    }

    @Override
    public String floor(String e) {
        checkNotNull(e);
        return getFirstElement(getStrings("", null, null, true, null, false, e, true));
    }

    @Override
    public String ceiling(String e) {
        checkNotNull(e);
        return getFirstElement(getStrings("", null, null, false, e, true, null, false));
    }

    @Override
    public String higher(String e) {
        checkNotNull(e);
        return getFirstElement(getStrings("", null, null, false, e, false, null, false));
    }

    @Override
    public String pollFirst() {
        return pollFirstElement(getStrings("", null, null, false, null, false, null, false));
    }

    @Override
    public String pollLast() {
        return pollFirstElement(getStrings("", null, null, true, null, false, null, false));
    }

    @Override
    public String first() {
        return getFirstElement(getStrings("", null, null, false, null, false, null, false));
    }

    @Override
    public String last() {
        return getFirstElement(getStrings("", null, null, true, null, false, null, false));
    }

    @Override
    public Comparator<? super String> comparator() {
        // Natural ordering.
        return null;
    }

    @Override
    public NavigableSet<String> descendingSet() {
        return new SubSet("", true, null, false, null, false);
    }

    @Override
    public NavigableSet<String> subSet(String fromElement, boolean fromInclusive, String toElement, boolean toInclusive) {
        if (fromElement.compareTo(toElement) > 0)
            throw new IllegalArgumentException("fromElement > toElement");
        if (fromInclusive && fromElement.isEmpty())
            fromElement = null;
        return new SubSet("", false, fromElement, fromInclusive, toElement, toInclusive);
    }

    @Override
    public NavigableSet<String> headSet(String toElement, boolean inclusive) {
        checkNotNull(toElement);
        return new SubSet("", false, null, false, toElement, inclusive);
    }

    @Override
    public NavigableSet<String> tailSet(String fromElement, boolean inclusive) {
        if (inclusive) {
            if (fromElement.isEmpty())
                return this;
        } else
            checkNotNull(fromElement);
        return new SubSet("", false, fromElement, inclusive, null, false);
    }

    @Override
    public NavigableSet<String> subSet(String fromElement, String toElement) {
        if (fromElement.compareTo(toElement) > 0)
            throw new IllegalArgumentException("fromElement > toElement");
        if (fromElement.isEmpty())
            fromElement = null;
        return new SubSet("", false, fromElement, true, toElement, false);
    }

    @Override
    public NavigableSet<String> headSet(String toElement) {
        checkNotNull(toElement);
        return new SubSet("", false, null, false, toElement, false);
    }

    @Override
    public NavigableSet<String> tailSet(String fromElement) {
        if (fromElement.isEmpty())
            return this;
        return new SubSet("", false, fromElement, true, null, false);
    }

    public NavigableSet<String> prefixSet(String prefix) {
        if (prefix == null || prefix.isEmpty())
            return this;
        return new SubSet(prefix, false, null, false, null, false);
    }
    
    private class SubSet extends AbstractSet<String> implements NavigableSet<String>, StringsFilter {
        private final String prefix;
        private final boolean desc;
        private final String from;
        private final boolean inclFrom;
        private final String to;
        private final boolean inclTo;
        private int size = -1;

        public SubSet(String prefix, boolean desc, String from, boolean inclFrom, String to, boolean inclTo) {
            this.prefix = prefix;
            this.desc = desc;
            this.from = from;
            this.inclFrom = inclFrom;
            this.to = to;
            this.inclTo = inclTo;
        }
        
        private String absLower(String e, boolean incl) {
            int cmp = to == null ? -1 : e.compareTo(to);
            return getFirstElement(getStrings(prefix, null, null, true, from, inclFrom, cmp > 0 ? to : e, cmp > 0 ? inclTo : cmp < 0 ? incl : incl && inclTo));
        }
        
        private String absHigher(String e, boolean incl) {
            int cmp = from == null ? 1 : e.compareTo(from);
            return getFirstElement(getStrings(prefix, null, null, false, cmp < 0 ? from : e, cmp < 0 ? inclFrom : cmp > 0 ? incl : incl && inclFrom, to, inclTo));
        }

        @Override
        public String lower(String e) {
            return desc ? absHigher(e, false) : absLower(e, false);
        }

        @Override
        public String floor(String e) {
            return desc ? absHigher(e, true) : absLower(e, true);
        }

        @Override
        public String ceiling(String e) {
            return desc ? absLower(e, true) : absHigher(e, true);
        }

        @Override
        public String higher(String e) {
            return desc ? absLower(e, false) : absHigher(e, false);
        }

        @Override
        public String first() {
            return getFirstElement(getStrings(prefix, null, null, desc, from, inclFrom, to, inclTo));
        }

        @Override
        public String last() {
            return getFirstElement(getStrings(prefix, null, null, !desc, from, inclFrom, to, inclTo));
        }

        @Override
        public String pollFirst() {
            return pollFirstElement(getStrings(prefix, null, null, desc, from, inclFrom, to, inclTo));
        }

        @Override
        public String pollLast() {
            return pollFirstElement(getStrings(prefix, null, null, !desc, from, inclFrom, to, inclTo));
        }

        @Override
        public Iterable<String> getAllStrings() {
            return getStrings(prefix, null, null, desc, from, inclFrom, to, inclTo);
        }
        
        @Override
        public Iterable<String> getStringsStartingWith(String prefix) {
            if (prefix == null || this.prefix.startsWith(prefix))
                prefix = this.prefix;
            else if (!prefix.startsWith(this.prefix))
                return Collections.EMPTY_LIST;
            return getStrings(prefix, null, null, desc, from, inclFrom, to, inclTo);
        }

        @Override
        public Iterable<String> getStringsWithSubstring(String substring) {
            return getStrings(prefix, substring, null, desc, from, inclFrom, to, inclTo);
        }
        
        @Override
        public Iterable<String> getStringsEndingWith(String suffix) {
            return getStrings(prefix, null, suffix, desc, from, inclFrom, to, inclTo);
        }

        @Override
        public Iterator<String> iterator() {
            return getStrings(prefix, null, null, desc, from, inclFrom, to, inclTo).iterator();
        }

        @Override
        public Iterator<String> descendingIterator() {
            return getStrings(prefix, null, null, !desc, from, inclFrom, to, inclTo).iterator();
        }

        @Override
        public NavigableSet<String> descendingSet() {
            return new SubSet(prefix, !desc, from, inclFrom, to, inclTo);
        }

        @Override
        public NavigableSet<String> subSet(String fromElement, boolean fromInclusive, String toElement, boolean toInclusive) {
            if (!inRange(fromElement, fromInclusive))
                throw new IllegalArgumentException("fromElement out of range");
            if (!inRange(toElement, toInclusive))
                throw new IllegalArgumentException("toElement out of range");
            if (desc) {
                String swap = fromElement;
                fromElement = toElement;
                toElement = swap;
                boolean bSwap = fromInclusive;
                fromInclusive = toInclusive;
                toInclusive = bSwap;
            }
            // fromElement lies in range && fromElement is empty =>
            // from = null => no need to limit the range by fromElement
            if (fromInclusive && fromElement.isEmpty())
                fromElement = null;
            return new SubSet(prefix, desc, fromElement, fromInclusive, toElement, toInclusive);
        }

        @Override
        public NavigableSet<String> headSet(String toElement, boolean inclusive) {
            if (!inRange(toElement, inclusive))
                throw new IllegalArgumentException("toElement out of range");
            if (desc) {
                if (inclusive && toElement.isEmpty())
                    return this;
                return new SubSet(prefix, desc, toElement, inclusive, to, inclTo);
            }
            return new SubSet(prefix, desc, from, inclFrom, toElement, inclusive);
        }

        @Override
        public NavigableSet<String> tailSet(String fromElement, boolean inclusive) {
            if (!inRange(fromElement, inclusive))
                throw new IllegalArgumentException("fromElement out of range");
            if (desc)
                return new SubSet(prefix, desc, from, inclFrom, fromElement, inclusive);
            if (inclusive && fromElement.isEmpty())
                return this;
            return new SubSet(prefix, desc, fromElement, inclusive, to, inclTo);
        }

        @Override
        public NavigableSet<String> subSet(String fromElement, String toElement) {
            if (!inRange(fromElement))
                throw new IllegalArgumentException("fromElement out of range");
            if (!inRange(toElement))
                throw new IllegalArgumentException("toElement out of range");
            if (desc) {
                String swap = fromElement;
                fromElement = toElement;
                toElement = swap;
            }
            // fromElement lies in range && fromElement is empty =>
            // from = null => no need to limit the range by fromElement
            if (fromElement.isEmpty())
                fromElement = null;
            return new SubSet(prefix, desc, fromElement, !desc, toElement, desc);
        }

        @Override
        public NavigableSet<String> headSet(String toElement) {
            if (!inRange(toElement))
                throw new IllegalArgumentException("toElement out of range");
            if (desc) {
                if (toElement.isEmpty())
                    return this;
                return new SubSet(prefix, desc, toElement, false, to, inclTo);
            }
            return new SubSet(prefix, desc, from, inclFrom, toElement, false);
        }

        @Override
        public NavigableSet<String> tailSet(String fromElement) {
            if (!inRange(fromElement))
                throw new IllegalArgumentException("fromElement out of range");
            if (desc)
                return new SubSet(prefix, desc, from, inclFrom, fromElement, true);
            if (fromElement.isEmpty())
                return this;
            return new SubSet(prefix, desc, fromElement, true, to, inclTo);
        }

        @Override
        public Comparator<? super String> comparator() {
            return desc ? Collections.reverseOrder() : null;
        }

        @Override
        public int size() {
            if (size < 0) {
                int s = 0;
                for (String word : this)
                    s++;
                if (isImmutable())
                    size = s;
                else
                    return s;
            }
            return size;
        }

        @Override
        public boolean isEmpty() {
            return size < 0 ? !iterator().hasNext() : size == 0;
        }
        
        private boolean inRange(String s) {
            if (!s.startsWith(prefix))
                return false;
            if (from != null) {
                int cmp = s.compareTo(from);
                if (cmp < 0 || cmp == 0 && !inclFrom)
                    return false;
            }
            if (to != null) {
                int cmp = s.compareTo(to);
                if (cmp > 0 || cmp == 0 && !inclTo)
                    return false;
            }
            return true;
        }
        
        private boolean inRange(String s, boolean inclusive) {
            if (inclusive)
                return inRange(s);
            return s.startsWith(prefix) &&
                   (from == null || s.compareTo(from) >= 0) &&
                   (to == null || s.compareTo(to) <= 0);
        }

        @Override
        public boolean contains(Object o) {
            return inRange((String)o) && DAWGSet.this.contains(o);
        }

        @Override
        public boolean add(String element) {
            if (!inRange(element))
                throw new IllegalArgumentException("element out of range");
            return DAWGSet.this.add(element);
        }

        @Override
        public boolean remove(Object o) {
            return inRange((String)o) && DAWGSet.this.remove(o);
        }

        @Override
        public boolean addAll(Collection<? extends String> c) {
            for (String e : c)
                if (!inRange(e))
                    throw new IllegalArgumentException("Value lies out of range");
            return DAWGSet.this.addAll(c);
        }

        @Override
        public boolean removeAll(Collection<?> c) {
            boolean ret = false;
            for (Object e : c)
                ret |= remove((String)e);
            return ret;
        }
    }
}