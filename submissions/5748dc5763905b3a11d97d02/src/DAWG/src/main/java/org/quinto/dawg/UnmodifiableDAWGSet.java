package org.quinto.dawg;

import org.quinto.dawg.util.SemiNavigableMap;
import org.quinto.dawg.util.UnmodifiableIterable;
import java.io.IOException;
import java.util.Collection;
import java.util.Comparator;
import java.util.Iterator;
import java.util.NavigableSet;
import org.quinto.dawg.util.UnmodifiableNavigableSet;

class UnmodifiableDAWGSet extends DAWGSet {
    private final DAWGSet delegate;
    private final NavigableSet<String> unmodifiableDelegate;
    
    public UnmodifiableDAWGSet(DAWGSet delegate) {
        this.delegate = delegate;
        this.unmodifiableDelegate = new UnmodifiableNavigableSet<String>(delegate);
    }

    @Override
    public boolean isWithIncomingTransitions() {
        return delegate.isWithIncomingTransitions();
    }

    @Override
    SemiNavigableMap<Character, DAWGNode> getOutgoingTransitions(DAWGNode parent) {
        return null;
    }

    @Override
    SemiNavigableMap<Character, Collection<? extends DAWGNode>> getIncomingTransitions(DAWGNode parent) {
        return null;
    }

    @Override
    public DAWGNode getSourceNode() {
        return null;
    }

    @Override
    DAWGNode getEndNode() {
        return null;
    }

    @Override
    DAWGNode getEmptyNode() {
        return null;
    }

    @Override
    public int getTransitionCount() {
        return delegate.getTransitionCount();
    }

    @Override
    public int getNodeCount() {
        return delegate.getNodeCount();
    }

    @Override
    Collection<? extends DAWGNode> getNodesBySuffix(String suffix) {
        return null;
    }

    @Override
    int getMaxLength() {
        return 0;
    }

    @Override
    public NavigableSet<Character> getAlphabet() {
        // Delegate's alphabet is unmodifiable.
        return delegate.getAlphabet();
    }

    @Override
    public boolean isImmutable() {
        // UnmodifiableDAWGSet is unmodifiable in sense that the modification operations are not allowed on it.
        // But it will change its state if the underlying DAWGSet changes.
        // So it's not obligatory immutable.
        return delegate.isImmutable();
    }

    @Override
    public int size() {
        return delegate.size();
    }

    @Override
    public String lower(String e) {
        return delegate.lower(e);
    }

    @Override
    public String floor(String e) {
        return delegate.floor(e);
    }

    @Override
    public String ceiling(String e) {
        return delegate.ceiling(e);
    }

    @Override
    public String higher(String e) {
        return delegate.higher(e);
    }

    @Override
    public String pollFirst() {
        throw new UnsupportedOperationException();
    }

    @Override
    public String pollLast() {
        throw new UnsupportedOperationException();
    }

    @Override
    public Iterator<String> iterator() {
        return unmodifiableDelegate.iterator();
    }

    @Override
    public NavigableSet<String> descendingSet() {
        return unmodifiableDelegate.descendingSet();
    }

    @Override
    public Iterator<String> descendingIterator() {
        return unmodifiableDelegate.descendingIterator();
    }

    @Override
    public NavigableSet<String> subSet(String fromElement, boolean fromInclusive, String toElement, boolean toInclusive) {
        return unmodifiableDelegate.subSet(fromElement, fromInclusive, toElement, toInclusive);
    }

    @Override
    public NavigableSet<String> headSet(String toElement, boolean inclusive) {
        return unmodifiableDelegate.headSet(toElement, inclusive);
    }

    @Override
    public NavigableSet<String> tailSet(String fromElement, boolean inclusive) {
        return unmodifiableDelegate.tailSet(fromElement, inclusive);
    }

    @Override
    public NavigableSet<String> subSet(String fromElement, String toElement) {
        return unmodifiableDelegate.subSet(fromElement, true, toElement, false);
    }

    @Override
    public NavigableSet<String> headSet(String toElement) {
        return unmodifiableDelegate.headSet(toElement, false);
    }

    @Override
    public NavigableSet<String> tailSet(String fromElement) {
        return unmodifiableDelegate.tailSet(fromElement, true);
    }

    @Override
    public Comparator<? super String> comparator() {
        // Natural ordering.
        return null;
    }

    @Override
    public String first() {
        return delegate.first();
    }

    @Override
    public String last() {
        return delegate.last();
    }

    /*@Override
    public Spliterator<String> spliterator() {
        return unmodifiableDelegate.spliterator();
    }*/

    @Override
    public boolean isEmpty() {
        return delegate.isEmpty();
    }

    @Override
    public boolean contains(Object o) {
        return delegate.contains(o);
    }

    @Override
    public String[] toArray() {
        return delegate.toArray();
    }

    @Override
    public <T> T[] toArray(T[] a) {
        return delegate.toArray(a);
    }

    @Override
    public boolean add(String e) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean remove(Object o) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean containsAll(Collection<?> c) {
        return delegate.containsAll(c);
    }

    @Override
    public boolean addAll(Collection<? extends String> c) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean retainAll(Collection<?> c) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean removeAll(Collection<?> c) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void clear() {
        throw new UnsupportedOperationException();
    }

    /*@Override
    public boolean removeIf(Predicate<? super String> filter) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Stream<String> stream() {
        return unmodifiableDelegate.stream();
    }

    @Override
    public Stream<String> parallelStream() {
        return unmodifiableDelegate.parallelStream();
    }

    @Override
    public void forEach(Consumer<? super String> action) {
        unmodifiableDelegate.forEach(action);
    }*/

    @Override
    public String toGraphViz(boolean withNodeIds, boolean withIncomingTransitions) {
        return delegate.toGraphViz(withNodeIds, withIncomingTransitions);
    }

    @Override
    public void saveAsImage(boolean withNodeIds, boolean withIncomingTransitions) throws IOException {
        delegate.saveAsImage(withNodeIds, withIncomingTransitions);
    }

    @Override
    public boolean addAll(Iterable<? extends String> c) {
        throw new UnsupportedOperationException();
    }

    @Override
    public Iterable<String> getAllStrings() {
        return new UnmodifiableIterable<String>(delegate.getAllStrings());
    }

    @Override
    public Iterable<String> getStringsStartingWith(String prefixStr) {
        return new UnmodifiableIterable<String>(delegate.getStringsStartingWith(prefixStr));
    }

    @Override
    public Iterable<String> getStringsWithSubstring(String str) {
        return new UnmodifiableIterable<String>(delegate.getStringsWithSubstring(str));
    }

    @Override
    public Iterable<String> getStringsEndingWith(String suffixStr) {
        return new UnmodifiableIterable<String>(delegate.getStringsEndingWith(suffixStr));
    }

    @Override
    public Iterable<String> getStrings(String prefixString, String subString, String suffixString, boolean descending, String fromString, boolean inclFrom, String toString, boolean inclTo) {
        return new UnmodifiableIterable<String>(delegate.getStrings(prefixString, subString, suffixString, descending, fromString, inclFrom, toString, inclTo));
    }

    @Override
    public String determineLongestPrefixInDAWG(String str) {
        return delegate.determineLongestPrefixInDAWG(str);
    }

    @Override
    public NavigableSet<String> prefixSet(String prefix) {
        return new UnmodifiableNavigableSet<String>(delegate.prefixSet(prefix));
    }

    @Override
    public boolean equals(Object o) {
        return delegate.equals(o);
    }

    @Override
    public int hashCode() {
        return delegate.hashCode();
    }

    @Override
    public String toString() {
        return delegate.toString();
    }
}