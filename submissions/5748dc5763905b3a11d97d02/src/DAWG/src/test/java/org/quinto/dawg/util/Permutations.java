package org.quinto.dawg.util;

import java.lang.reflect.Array;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.NoSuchElementException;

// Implementation source: http://stackoverflow.com/a/14444037/4540645
// Author: Yevgen Yampolskiy (http://stackoverflow.com/users/1321867/yevgen-yampolskiy)
// Used here for testing purposes only.
public class Permutations<E> implements Iterator<E[]> {
    private final E arr[];
    private final int ind[];
    private boolean has_next;
    private final E output[];
    
    public static <E> Iterable<E[]> from( final E arr[] ) {
        return new Iterable<E[]>() {
            @Override
            public Iterator<E[]> iterator() {
                return new Permutations<E>( arr );
            }
        };
    }

    private Permutations( E arr[] ) {
        this.arr = arr.clone();
        ind = new int[arr.length];
        Map<E, Integer> hm = new HashMap<E, Integer>();
        for (int i = 0; i < arr.length; i++) {
            Integer n = hm.get(arr[i]);
            if (n == null) {
                hm.put(arr[i], i);
                n = i;
            }
            ind[i] = n;
        }
        Arrays.sort(ind);
        output = (E[])Array.newInstance(arr.getClass().getComponentType(), arr.length);
        has_next = true;
    }

    @Override
    public boolean hasNext() {
        return has_next;
    }

    /**
     * Computes next permutations. Same array instance is returned every time.
     * @return
     */
    @Override
    public E[] next() {
        if (!has_next)
            throw new NoSuchElementException();
        for (int i = 0; i < ind.length; i++)
            output[i] = arr[ind[i]];
        has_next = false;
        for (int tail = ind.length - 1;tail > 0;tail--) {
            if (ind[tail - 1] < ind[tail]) {
                int s = ind.length - 1;
                while (ind[tail-1] >= ind[s])
                    s--;
                swap(ind, tail-1, s);
                for (int i = tail, j = ind.length - 1; i < j; i++, j--)
                    swap(ind, i, j);
                has_next = true;
                break;
            }
        }
        return output;
    }

    private void swap(int[] arr, int i, int j) {
        int t = arr[i];
        arr[i] = arr[j];
        arr[j] = t;
    }

    @Override
    public void remove() {
    }
}