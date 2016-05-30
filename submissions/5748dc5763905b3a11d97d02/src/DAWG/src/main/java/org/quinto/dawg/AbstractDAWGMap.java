package org.quinto.dawg;

import java.util.AbstractMap;
import java.util.Comparator;
import java.util.Iterator;
import java.util.NavigableMap;
import org.quinto.dawg.util.ExtraMethodsMap;
import org.quinto.dawg.util.Objects;

abstract class AbstractDAWGMap<V> extends AbstractMap<String, V> implements NavigableMap<String, V>, ExtraMethodsMap<String, V> {
    static final char KEY_VALUE_SEPARATOR = '\0';
    static final char KEY_VALUE_SEPARATOR_EXCLUSIVE = '\1';
    DAWGSet dawg;
    
    AbstractDAWGMap() {
    }
    
    AbstractDAWGMap(DAWGSet dawg) {
        this.dawg = dawg;
    }
    
    public DAWGSet getUnderlyingSet() {
        return new UnmodifiableDAWGSet(dawg);
    }

    @Override
    public int size() {
        return dawg.size();
    }

    @Override
    public boolean isEmpty() {
        return dawg.isEmpty();
    }
    
    static void checkNotNullAndContainsNoZeros(Object o) {
        if (o == null)
            throw new NullPointerException();
        if (((String)o).indexOf(KEY_VALUE_SEPARATOR) >= 0)
            throw new IllegalArgumentException("Argument contains zero character");
    }
    
    static String getFirstElement(Iterable<String> i) {
        for (String s : i)
            return s;
        return null;
    }
    
    static String pollFirstElement(Iterable<String> i) {
        for (Iterator<String> it = i.iterator(); it.hasNext();) {
            String s = it.next();
            it.remove();
            return s;
        }
        return null;
    }
    
    static String valueOfStringEntry(String stringEntry, Object key) {
        return stringEntry == null ? null : stringEntry.substring(((String)key).length() + 1);
    }
    
    static String valueOfStringEntry(String stringEntry) {
        return stringEntry == null ? null : stringEntry.substring(stringEntry.indexOf(KEY_VALUE_SEPARATOR) + 1);
    }
    
    static String keyOfStringEntry(String stringEntry) {
        return stringEntry == null ? null : stringEntry.substring(0, stringEntry.indexOf(KEY_VALUE_SEPARATOR));
    }

    @Override
    public boolean containsKey(Object key) {
        checkNotNullAndContainsNoZeros(key);
        return dawg.getStringsStartingWith((String)key + KEY_VALUE_SEPARATOR).iterator().hasNext();
    }

    @Override
    public boolean containsValue(Object value) {
        checkNotNullAndContainsNoZeros(value);
        return dawg.getStringsEndingWith(KEY_VALUE_SEPARATOR + (String)value).iterator().hasNext();
    }
    
    public boolean containsMapping(Object key, Object value) {
        checkNotNullAndContainsNoZeros(key);
        checkNotNullAndContainsNoZeros(value);
        return dawg.contains((String)key + KEY_VALUE_SEPARATOR + value);
    }
    
    public boolean removeValue(Object value) {
        checkNotNullAndContainsNoZeros(value);
        Iterator<String> it = dawg.getStringsEndingWith(KEY_VALUE_SEPARATOR + (String)value).iterator();
        if (it.hasNext()) {
            String stringEntry = it.next();
            return dawg.remove(stringEntry);
        }
        return false;
    }

    @Override
    public boolean remove(Object key, Object value) {
        checkNotNullAndContainsNoZeros(key);
        checkNotNullAndContainsNoZeros(value);
        return dawg.remove((String)key + KEY_VALUE_SEPARATOR + value);
    }

    @Override
    public void clear() {
        dawg.clear();
    }

    @Override
    public String lowerKey(String key) {
        checkNotNullAndContainsNoZeros(key);
        return keyOfStringEntry(dawg.lower(key + KEY_VALUE_SEPARATOR));
    }

    @Override
    public String floorKey(String key) {
        checkNotNullAndContainsNoZeros(key);
        return keyOfStringEntry(dawg.lower(key + KEY_VALUE_SEPARATOR_EXCLUSIVE));
    }

    @Override
    public String ceilingKey(String key) {
        checkNotNullAndContainsNoZeros(key);
        return keyOfStringEntry(dawg.ceiling(key + KEY_VALUE_SEPARATOR));
    }

    @Override
    public String higherKey(String key) {
        checkNotNullAndContainsNoZeros(key);
        return keyOfStringEntry(dawg.ceiling(key + KEY_VALUE_SEPARATOR_EXCLUSIVE));
    }

    @Override
    public String firstKey() {
        return keyOfStringEntry(dawg.first());
    }

    @Override
    public String lastKey() {
        return keyOfStringEntry(dawg.last());
    }

    public String pollFirstKey() {
        String key = firstKey();
        if (key != null)
            remove(key);
        return key;
    }

    public String pollLastKey() {
        String key = lastKey();
        if (key != null)
            remove(key);
        return key;
    }

    @Override
    public Comparator<? super String> comparator() {
        // Natural ordering.
        return null;
    }
    
    class MapEntry implements Entry<String, V> {
        private final String key;
        private V value;
        
        public MapEntry(String key, V value) {
            this.key = key;
            this.value = value;
        }
        
        @Override
        public String getKey() {
            return key;
        }

        @Override
        public V getValue() {
            return value;
        }

        @Override
        public V setValue(V value) {
            V old = put(key, value);
            this.value = value;
            return old;
        }

        @Override
        public int hashCode() {
            return Objects.hashCode(key) ^ Objects.hashCode(value);
        }

        @Override
        public boolean equals(Object obj) {
            if (obj == this)
                return true;
            if (!(obj instanceof Entry))
                return false;
            Entry e = (Entry)obj;
            return Objects.equals(key, e.getKey()) && Objects.equals(value, e.getValue());
        }

        @Override
        public String toString() {
            return key + '=' + value;
        }
    }
}