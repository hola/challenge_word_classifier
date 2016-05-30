package org.quinto.dawg.util;

import java.util.Iterator;
import java.util.NoSuchElementException;

public abstract class LookaheadIterator<E> implements Iterator<E> {
    public static final NoSuchElementException NO_SUCH_ELEMENT_EXCEPTION = new NoSuchElementException();
    
    private E current;
    private boolean called;
    private boolean ableToRemove;
    private NoSuchElementException ex;
    
    @Override
    public boolean hasNext() {
        if (!called) {
            called = true;
            try {
                current = nextElement();
                return true;
            } catch (NoSuchElementException e) {
                ex = e;
                return false;
            }
        }
        return ex == null;
    }

    @Override
    public E next() {
        if (hasNext()) {
            called = false;
            ableToRemove = true;
            return current;
        } else
            throw ex;
    }

    @Override
    public void remove() {
        if (ableToRemove && ex == null) {
            ableToRemove = false;
            remove(current);
        } else
            throw new IllegalStateException();
    }
    
    public abstract E nextElement();
    
    public void remove(E element) {
        throw new UnsupportedOperationException();
    }
}