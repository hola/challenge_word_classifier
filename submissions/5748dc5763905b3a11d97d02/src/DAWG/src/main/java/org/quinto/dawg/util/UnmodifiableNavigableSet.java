package org.quinto.dawg.util;

import java.io.Serializable;
import java.util.Collection;
import java.util.Comparator;
import java.util.Iterator;
import java.util.NavigableSet;
import java.util.SortedSet;

// TODO: replace with Collections.unmodifiableNavigableSet when Java 8 would become a target platform.
public class UnmodifiableNavigableSet<E> implements NavigableSet<E>, Serializable {
    private static final long serialVersionUID = 1L;

    private final NavigableSet<E> ns;

    public UnmodifiableNavigableSet(NavigableSet<E> s) {
        if (s == null)
            throw new NullPointerException();
        ns = s;
    }

    @Override
    public E lower(E e) {
        return ns.lower(e);
    }

    @Override
    public E floor(E e) {
        return ns.floor(e);
    }

    @Override
    public E ceiling(E e) {
        return ns.ceiling(e);
    }

    @Override
    public E higher(E e) {
        return ns.higher(e);
    }

    @Override
    public E pollFirst() {
        throw new UnsupportedOperationException();
    }

    @Override
    public E pollLast() {
        throw new UnsupportedOperationException();
    }

    @Override
    public NavigableSet<E> descendingSet() {
        return new UnmodifiableNavigableSet<E>(ns.descendingSet());
    }

    @Override
    public Iterator<E> descendingIterator() {
        return descendingSet().iterator();
    }

    @Override
    public NavigableSet<E> subSet(E fromElement, boolean fromInclusive, E toElement, boolean toInclusive) {
        return new UnmodifiableNavigableSet<E>(ns.subSet(fromElement, fromInclusive, toElement, toInclusive));
    }

    @Override
    public NavigableSet<E> headSet(E toElement, boolean inclusive) {
        return new UnmodifiableNavigableSet<E>(ns.headSet(toElement, inclusive));
    }

    @Override
    public NavigableSet<E> tailSet(E fromElement, boolean inclusive) {
        return new UnmodifiableNavigableSet<E>(ns.tailSet(fromElement, inclusive));
    }

    @Override
    public Comparator<? super E> comparator() {
        return ns.comparator();
    }

    @Override
    public SortedSet<E> subSet(E fromElement, E toElement) {
        return new UnmodifiableNavigableSet<E>(ns.subSet(fromElement, true, toElement, false));
    }

    @Override
    public SortedSet<E> headSet(E toElement) {
        return new UnmodifiableNavigableSet<E>(ns.headSet(toElement, false));
    }

    @Override
    public SortedSet<E> tailSet(E fromElement) {
        return new UnmodifiableNavigableSet<E>(ns.tailSet(fromElement, true));
    }

    @Override
    public E first() {
        return ns.first();
    }

    @Override
    public E last() {
        return ns.last();
    }

    @Override
    public boolean equals(Object o) {
        return o == this || ns.equals(o);
    }

    @Override
    public int hashCode() {
        return ns.hashCode();
    }

    @Override
    public int size() {
        return ns.size();
    }

    @Override
    public boolean isEmpty() {
        return ns.isEmpty();
    }

    @Override
    public boolean contains(Object o) {
        return ns.contains(o);
    }

    @Override
    public Object[] toArray() {
        return ns.toArray();
    }

    @Override
    public <T> T[] toArray(T[] a) {
        return ns.toArray(a);
    }

    @Override
    public String toString() {
        return ns.toString();
    }

    @Override
    public Iterator<E> iterator() {
        return new Iterator<E>() {
            private final Iterator<? extends E> i = ns.iterator();

            @Override
            public boolean hasNext() {
                return i.hasNext();
            }

            @Override
            public E next() {
                return i.next();
            }

            @Override
            public void remove() {
                throw new UnsupportedOperationException();
            }
        };
    }

    @Override
    public boolean add(E e) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean remove(Object o) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean containsAll(Collection<?> coll) {
        return ns.containsAll(coll);
    }

    @Override
    public boolean addAll(Collection<? extends E> coll) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean removeAll(Collection<?> coll) {
        throw new UnsupportedOperationException();
    }

    @Override
    public boolean retainAll(Collection<?> coll) {
        throw new UnsupportedOperationException();
    }

    @Override
    public void clear() {
        throw new UnsupportedOperationException();
    }
}