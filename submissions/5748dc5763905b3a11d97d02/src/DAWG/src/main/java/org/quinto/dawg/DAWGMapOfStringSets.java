package org.quinto.dawg;

import org.quinto.dawg.util.LookaheadIterator;
import java.util.AbstractCollection;
import java.util.AbstractMap;
import java.util.AbstractSet;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.NavigableMap;
import java.util.NavigableSet;
import java.util.Set;
import java.util.SortedMap;
import java.util.SortedSet;
import org.quinto.dawg.util.ExtraMethodsMap;
import org.quinto.dawg.util.Objects;

class DAWGMapOfStringSets extends AbstractDAWGMap<Set<String>> {
    private transient Integer size;
    
    DAWGMapOfStringSets() {
    }
    
    DAWGMapOfStringSets(DAWGSet dawg) {
        super(dawg);
    }

    @Override
    public int size() {
        if (size == null) {
            int s = 0;
            for (Iterator<String> it = DAWGMapOfStringSets.this.uniqueKeysIterator(false); it.hasNext(); it.next())
                s++;
            if (dawg.isImmutable())
                size = s;
            else
                return s;
        }
        return size;
    }
    
    public int flatSize() {
        return super.size();
    }

    @Override
    public boolean containsValue(Object value) {
        if (value instanceof String)
            return super.containsValue(value);
        Iterator<Entry<String, Set<String>>> i = entrySet().iterator();
        while (i.hasNext()) {
            Entry<String, Set<String>> e = i.next();
            if (value.equals(e.getValue()))
                return true;
        }
        return false;
    }

    @Override
    public boolean removeValue(Object value) {
        if (value instanceof String)
            return super.removeValue(value);
        Iterator<Entry<String, Set<String>>> i = entrySet().iterator();
        while (i.hasNext()) {
            Entry<String, Set<String>> e = i.next();
            if (value.equals(e.getValue())) {
                i.remove();
                return true;
            }
        }
        return false;
    }

    @Override
    public Set<String> get(Object key) {
        checkNotNullAndContainsNoZeros(key);
        return new ValuesSetFromIterable(dawg.getStringsStartingWith((String)key + KEY_VALUE_SEPARATOR), (String)key);
    }

    private Set<String> get(Object key, boolean desc) {
        checkNotNullAndContainsNoZeros(key);
        return new ValuesSetFromIterable(dawg.getStrings((String)key + KEY_VALUE_SEPARATOR, null, null, desc, null, false, null, false), (String)key);
    }

    @Override
    public Set<String> remove(Object key) {
        Set<String> ret = get((String)key);
        if (ret.isEmpty())
            ret = Collections.EMPTY_SET;
        else // An unmodifiable set of previously stored data.
            ret = new ModifiableDAWGSet(false, ret).compress();
        for (String s : ret)
            dawg.remove((String)key + KEY_VALUE_SEPARATOR + s);
        return ret;
    }
    
    public boolean put(String key, String value) {
        checkNotNullAndContainsNoZeros(key);
        checkNotNullAndContainsNoZeros(value);
        return dawg.add(key + KEY_VALUE_SEPARATOR + value);
    }

    @Override
    public Set<String> put(String key, Set<String> value) {
        Set<String> ret = get(key);
        if (ret.isEmpty())
            ret = null;
        else // An unmodifiable set of previously stored data.
            ret = new ModifiableDAWGSet(false, ret).compress();
        putAll(key, value);
        return ret;
    }
    
    public boolean putAll(final String key, final Iterable<? extends String> values) {
        checkNotNullAndContainsNoZeros(key);
        return dawg.addAll(new Iterable<String>() {
            @Override
            public Iterator<String> iterator() {
                return new Iterator<String>() {
                    private final Iterator<? extends String> it = values.iterator();

                    @Override
                    public String next() {
                        String s = it.next();
                        checkNotNullAndContainsNoZeros(s);
                        return key + KEY_VALUE_SEPARATOR + s;
                    }

                    @Override
                    public boolean hasNext() {
                        return it.hasNext();
                    }

                    @Override
                    public void remove() {
                        throw new UnsupportedOperationException();
                    }
                };
            }
        });
    }

    @Override
    public void putAll(Map m) {
        Set entrySet = m.entrySet();
        putAll(entrySet);
    }
    
    boolean putAll(Iterable c) {
        final Iterator entryIt = c.iterator();
        if (!entryIt.hasNext())
            return false;
        Entry entry = (Entry)entryIt.next();
        String key = (String)entry.getKey();
        Object value = entry.getValue();
        if (value instanceof Set) {
            put(key, (Set)value);
            return dawg.addAll(new Iterable<String>() {
                @Override
                public Iterator<String> iterator() {
                    return new LookaheadIterator<String>() {
                        private String key;
                        private Iterator<String> it;

                        @Override
                        public String nextElement() {
                            while (true) {
                                if (key == null) {
                                    if (entryIt.hasNext()) {
                                        Entry e = (Entry)entryIt.next();
                                        key = (String)e.getKey();
                                        checkNotNullAndContainsNoZeros(key);
                                        it = ((Set<String>)e.getValue()).iterator();
                                    } else
                                        throw NO_SUCH_ELEMENT_EXCEPTION;
                                }
                                if (it.hasNext()) {
                                    String value = it.next();
                                    checkNotNullAndContainsNoZeros(value);
                                    return key + KEY_VALUE_SEPARATOR + value;
                                } else
                                    key = null;
                            }
                        }
                    };
                }
            });
        } else {
            put(key, (String)value);
            return dawg.addAll(new Iterable<String>() {
                @Override
                public Iterator<String> iterator() {
                    return new Iterator<String>() {
                        @Override
                        public String next() {
                            Entry e = (Entry)entryIt.next();
                            String key = (String)e.getKey();
                            checkNotNullAndContainsNoZeros(key);
                            String value = (String)e.getValue();
                            checkNotNullAndContainsNoZeros(value);
                            return key + KEY_VALUE_SEPARATOR + value;
                        }

                        @Override
                        public boolean hasNext() {
                            return entryIt.hasNext();
                        }

                        @Override
                        public void remove() {
                            throw new UnsupportedOperationException();
                        }
                    };
                }
            });
        }
    }
    
    @Override
    public Entry<String, Set<String>> lowerEntry(String key) {
        key = lowerKey(key);
        return key == null ? null : new MapEntry(key, get(key));
    }
    
    @Override
    public Entry<String, Set<String>> floorEntry(String key) {
        key = floorKey(key);
        return key == null ? null : new MapEntry(key, get(key));
    }
    
    @Override
    public Entry<String, Set<String>> ceilingEntry(String key) {
        key = ceilingKey(key);
        return key == null ? null : new MapEntry(key, get(key));
    }
    
    @Override
    public Entry<String, Set<String>> higherEntry(String key) {
        key = higherKey(key);
        return key == null ? null : new MapEntry(key, get(key));
    }
    
    @Override
    public Entry<String, Set<String>> firstEntry() {
        String key = firstKey();
        return key == null ? null : new MapEntry(key, get(key));
    }
    
    @Override
    public Entry<String, Set<String>> lastEntry() {
        String key = lastKey();
        return key == null ? null : new MapEntry(key, get(key));
    }
    
    @Override
    public Entry<String, Set<String>> pollFirstEntry() {
        String key = firstKey();
        return key == null ? null : new MapEntry(key, remove(key));
    }
    
    @Override
    public Entry<String, Set<String>> pollLastEntry() {
        String key = lastKey();
        return key == null ? null : new MapEntry(key, remove(key));
    }
    
    public Collection<Entry<String, String>> entries() {
        return new Entries(this);
    }
    
    public Collection<String> keys() {
        return new Keys(this, false);
    }
    
    public Collection<String> flatValues() {
        return new FlatValues(this);
    }

    @Override
    public Collection<Set<String>> values() {
        return new Values(this);
    }

    @Override
    public Set<Entry<String, Set<String>>> entrySet() {
        return new EntrySet(this);
    }

    @Override
    public NavigableSet<String> keySet() {
        return new KeySet(this, false);
    }

    @Override
    public NavigableSet<String> navigableKeySet() {
        return new KeySet(this, false);
    }

    @Override
    public NavigableSet<String> descendingKeySet() {
        return new KeySet(this, true);
    }

    @Override
    public NavigableMap<String, Set<String>> descendingMap() {
        return new SubMap(dawg.descendingSet());
    }

    @Override
    public NavigableMap<String, Set<String>> subMap(String fromKey, boolean fromInclusive, String toKey, boolean toInclusive) {
        if (fromKey.compareTo(toKey) > 0)
            throw new IllegalArgumentException("fromKey > toKey");
        if (fromInclusive && fromKey.isEmpty())
            fromKey = null;
        else
            checkNotNullAndContainsNoZeros(fromKey);
        checkNotNullAndContainsNoZeros(toKey);
        return new SubMap(dawg.subSet(fromKey + (fromInclusive ? KEY_VALUE_SEPARATOR : KEY_VALUE_SEPARATOR_EXCLUSIVE), toKey + (toInclusive ? KEY_VALUE_SEPARATOR_EXCLUSIVE : KEY_VALUE_SEPARATOR)));
    }

    @Override
    public NavigableMap<String, Set<String>> headMap(String toKey, boolean inclusive) {
        checkNotNullAndContainsNoZeros(toKey);
        return new SubMap(dawg.headSet(toKey + (inclusive ? KEY_VALUE_SEPARATOR_EXCLUSIVE : KEY_VALUE_SEPARATOR)));
    }

    @Override
    public NavigableMap<String, Set<String>> tailMap(String fromKey, boolean inclusive) {
        if (inclusive && fromKey.isEmpty())
            return this;
        checkNotNullAndContainsNoZeros(fromKey);
        return new SubMap(dawg.tailSet(fromKey + (inclusive ? KEY_VALUE_SEPARATOR : KEY_VALUE_SEPARATOR_EXCLUSIVE)));
    }

    @Override
    public NavigableMap<String, Set<String>> subMap(String fromKey, String toKey) {
        if (fromKey.compareTo(toKey) > 0)
            throw new IllegalArgumentException("fromKey > toKey");
        if (fromKey.isEmpty())
            fromKey = null;
        else
            checkNotNullAndContainsNoZeros(fromKey);
        checkNotNullAndContainsNoZeros(toKey);
        return new SubMap(dawg.subSet(fromKey + KEY_VALUE_SEPARATOR, toKey + KEY_VALUE_SEPARATOR));
    }

    @Override
    public NavigableMap<String, Set<String>> headMap(String toKey) {
        checkNotNullAndContainsNoZeros(toKey);
        return new SubMap(dawg.headSet(toKey + KEY_VALUE_SEPARATOR));
    }

    @Override
    public NavigableMap<String, Set<String>> tailMap(String fromKey) {
        if (fromKey.isEmpty())
            return this;
        checkNotNullAndContainsNoZeros(fromKey);
        return new SubMap(dawg.tailSet(fromKey + KEY_VALUE_SEPARATOR));
    }
    
    public NavigableMap<String, Set<String>> prefixMap(String keyPrefix) {
        if (keyPrefix == null || keyPrefix.isEmpty())
            return this;
        checkNotNullAndContainsNoZeros(keyPrefix);
        return new SubMap(dawg.prefixSet(keyPrefix));
    }
    
    private Iterator<String> uniqueKeysIterator(boolean desc) {
        return uniqueKeysIterator(dawg, desc);
    }
    
    private Iterator<String> uniqueKeysIterator(final NavigableSet<String> set, final boolean desc) {
        return new LookaheadIterator<String>() {
            private final Iterator<String> delegate = desc ? set.descendingIterator() : set.iterator();
            private String current;
            
            @Override
            public String nextElement() {
                while (delegate.hasNext()) {
                    String next = keyOfStringEntry(delegate.next());
                    if (current == null || !current.equals(next))
                        return current = next;
                }
                throw NO_SUCH_ELEMENT_EXCEPTION;
            }

            @Override
            public void remove(String key) {
                DAWGMapOfStringSets.this.remove(key);
                delegate.remove();
            }
        };
    }
    
    private Iterator<String> flatKeysIterator(boolean desc) {
        return flatKeysIterator(dawg, desc);
    }
    
    private Iterator<String> flatKeysIterator(final NavigableSet<String> set, final boolean desc) {
        return new Iterator<String>() {
            private final Iterator<String> delegate = desc ? set.descendingIterator() : set.iterator();
            
            @Override
            public String next() {
                return keyOfStringEntry(delegate.next());
            }

            @Override
            public boolean hasNext() {
                return delegate.hasNext();
            }

            @Override
            public void remove() {
                delegate.remove();
            }
        };
    }
    
    private Iterator<Entry<String, Set<String>>> entryWithSetValuesIterator() {
        return entryWithSetValuesIterator(dawg);
    }
    
    private Iterator<Entry<String, Set<String>>> entryWithSetValuesIterator(final NavigableSet<String> set) {
        final boolean desc = set.comparator() != null;
        return new LookaheadIterator<Entry<String, Set<String>>>() {
            private final Iterator<String> delegate = set.iterator();
            private String currentKey;
            
            @Override
            public Entry<String, Set<String>> nextElement() {
                while (delegate.hasNext()) {
                    String nextKey = keyOfStringEntry(delegate.next());
                    if (currentKey == null || !currentKey.equals(nextKey)) {
                        currentKey = nextKey;
                        return new MapEntry(currentKey, get(currentKey, desc));
                    }
                }
                throw NO_SUCH_ELEMENT_EXCEPTION;
            }

            @Override
            public void remove(Entry<String, Set<String>> entry) {
                DAWGMapOfStringSets.this.remove(entry.getKey());
                delegate.remove();
            }
        };
    }
    
    private Iterator<Entry<String, String>> entryWithStringValuesIterator() {
        return entryWithStringValuesIterator(dawg);
    }
    
    private Iterator<Entry<String, String>> entryWithStringValuesIterator(final NavigableSet<String> set) {
        return new Iterator<Entry<String, String>>() {
            private final Iterator<String> delegate = set.iterator();
            
            @Override
            public Entry<String, String> next() {
                return entryOfStringEntry(delegate.next());
            }

            @Override
            public boolean hasNext() {
                return delegate.hasNext();
            }

            @Override
            public void remove() {
                delegate.remove();
            }
        };
    }
    
    private Entry<String, String> entryOfStringEntry(String stringEntry) {
        if (stringEntry == null)
            return null;
        int idx = stringEntry.indexOf(KEY_VALUE_SEPARATOR);
        return new EntryWithStringValues(stringEntry.substring(0, idx), stringEntry.substring(idx + 1));
    }
    
    private Iterator<Set<String>> valueSetsIterator() {
        return valueSetsIterator(dawg);
    }
    
    private Iterator<Set<String>> valueSetsIterator(final NavigableSet<String> set) {
        final boolean desc = set.comparator() != null;
        return new LookaheadIterator<Set<String>>() {
            private final Iterator<String> delegate = set.iterator();
            private String currentKey;
            
            @Override
            public Set<String> nextElement() {
                while (delegate.hasNext()) {
                    String nextKey = keyOfStringEntry(delegate.next());
                    if (currentKey == null || !currentKey.equals(nextKey))
                        return get(currentKey = nextKey, desc);
                }
                throw NO_SUCH_ELEMENT_EXCEPTION;
            }

            @Override
            public void remove(Set<String> value) {
                value.clear();
                delegate.remove();
            }
        };
    }
    
    private Iterator<String> flatValuesIterator() {
        return flatValuesIterator(dawg);
    }
    
    private Iterator<String> flatValuesIterator(final NavigableSet<String> set) {
        return new Iterator<String>() {
            private final Iterator<String> delegate = set.iterator();
            
            @Override
            public String next() {
                return valueOfStringEntry(delegate.next());
            }

            @Override
            public boolean hasNext() {
                return delegate.hasNext();
            }

            @Override
            public void remove() {
                delegate.remove();
            }
        };
    }
    
    private class EntryWithStringValues implements Entry<String, String> {
        private final String key;
        private String value;
        
        public EntryWithStringValues(String key, String value) {
            this.key = key;
            this.value = value;
        }
        
        @Override
        public String getKey() {
            return key;
        }

        @Override
        public String getValue() {
            return value;
        }

        @Override
        public String setValue(String value) {
            String old = put(key, value) ? null : value;
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
    
    // TODO: implement NavigableSet interface.
    private class ValuesSetFromIterable extends AbstractSet<String> implements Set<String> {
        private final Iterable<String> values;
        private final String key;
        private int size = -1;
        
        public ValuesSetFromIterable(Iterable<String> values, String key) {
            this.values = values;
            this.key = key;
        }

        @Override
        public int size() {
            if (size < 0) {
                int s = 0;
                for (String value : values)
                    s++;
                if (dawg.isImmutable())
                    size = s;
                else
                    return s;
            }
            return size;
        }

        @Override
        public boolean isEmpty() {
            return size < 0 ? !values.iterator().hasNext() : size == 0;
        }

        @Override
        public Iterator<String> iterator() {
            return new Iterator<String>() {
                private final Iterator<String> it = values.iterator();
                
                @Override
                public boolean hasNext() {
                    return it.hasNext();
                }

                @Override
                public String next() {
                    return valueOfStringEntry(it.next());
                }

                @Override
                public void remove() {
                    it.remove();
                }
            };
        }

        @Override
        public boolean add(String e) {
            checkNotNullAndContainsNoZeros(e);
            return dawg.add(key + KEY_VALUE_SEPARATOR + e);
        }

        @Override
        public boolean addAll(final Collection<? extends String> c) {
            return dawg.addAll(new Iterable<String>() {
                @Override
                public Iterator<String> iterator() {
                    return new Iterator<String>() {
                        private final Iterator<? extends String> it = c.iterator();
                        
                        @Override
                        public String next() {
                            String s = it.next();
                            checkNotNullAndContainsNoZeros(s);
                            return key + KEY_VALUE_SEPARATOR + s;
                        }

                        @Override
                        public boolean hasNext() {
                            return it.hasNext();
                        }

                        @Override
                        public void remove() {
                            throw new UnsupportedOperationException();
                        }
                    };
                }
            });
        }

        @Override
        public boolean remove(Object o) {
            checkNotNullAndContainsNoZeros(o);
            return dawg.remove(key + KEY_VALUE_SEPARATOR + o);
        }

        @Override
        public boolean removeAll(Collection<?> c) {
            boolean ret = false;
            for (Object e : c)
                ret |= remove((String)e);
            return ret;
        }

        @Override
        public void clear() {
            DAWGMapOfStringSets.this.remove(key);
        }
    }
    
    private static class KeySet extends AbstractSet<String> implements NavigableSet<String> {
        private final NavigableMap<String, Set<String>> map;
        private final boolean desc;
        
        public KeySet(NavigableMap<String, Set<String>> map, boolean desc) {
            this.map = map;
            this.desc = desc;
        }

        @Override
        public String lower(String e) {
            return desc ? map.higherKey(e) : map.lowerKey(e);
        }

        @Override
        public String floor(String e) {
            return desc ? map.ceilingKey(e) : map.floorKey(e);
        }

        @Override
        public String ceiling(String e) {
            return desc ? map.floorKey(e) : map.ceilingKey(e);
        }

        @Override
        public String higher(String e) {
            return desc ? map.lowerKey(e) : map.higherKey(e);
        }

        @Override
        public String pollFirst() {
            String ret = desc ? map.lastKey() : map.firstKey();
            if (ret != null)
                map.remove(ret);
            return ret;
        }

        @Override
        public String pollLast() {
            String ret = desc ? map.firstKey() : map.lastKey();
            if (ret != null)
                map.remove(ret);
            return ret;
        }

        @Override
        public String first() {
            return desc ? map.lastKey() : map.firstKey();
        }

        @Override
        public String last() {
            return desc ? map.firstKey() : map.lastKey();
        }

        @Override
        public Iterator<String> iterator() {
            if (map instanceof DAWGMapOfStringSets)
                return ((DAWGMapOfStringSets)map).uniqueKeysIterator(desc);
            else
                return ((SubMap)map).uniqueKeysIterator(desc);
        }

        @Override
        public Iterator<String> descendingIterator() {
            if (map instanceof DAWGMapOfStringSets)
                return ((DAWGMapOfStringSets)map).uniqueKeysIterator(!desc);
            else
                return ((SubMap)map).uniqueKeysIterator(!desc);
        }

        @Override
        public NavigableSet<String> descendingSet() {
            return new KeySet(map, !desc);
        }

        @Override
        public NavigableSet<String> subSet(String fromElement, boolean fromInclusive, String toElement, boolean toInclusive) {
            return new KeySet(map.subMap(fromElement, fromInclusive, toElement, toInclusive), desc);
        }

        @Override
        public NavigableSet<String> headSet(String toElement, boolean inclusive) {
            return new KeySet(map.headMap(toElement, inclusive), desc);
        }

        @Override
        public NavigableSet<String> tailSet(String fromElement, boolean inclusive) {
            return new KeySet(map.tailMap(fromElement, inclusive), desc);
        }

        @Override
        public SortedSet<String> subSet(String fromElement, String toElement) {
            return new KeySet(map.subMap(fromElement, true, toElement, false), desc);
        }

        @Override
        public SortedSet<String> headSet(String toElement) {
            return new KeySet(map.headMap(toElement, false), desc);
        }

        @Override
        public SortedSet<String> tailSet(String fromElement) {
            return new KeySet(map.tailMap(fromElement, true), desc);
        }

        @Override
        public Comparator<? super String> comparator() {
            return desc ? Collections.reverseOrder() : null;
        }

        @Override
        public int size() {
            return map.size();
        }

        @Override
        public boolean isEmpty() {
            return map.isEmpty();
        }

        @Override
        public boolean contains(Object o) {
            return map.containsKey((String)o);
        }

        @Override
        public boolean remove(Object o) {
            return !map.remove((String)o).isEmpty();
        }

        @Override
        public boolean removeAll(Collection<?> c) {
            boolean ret = false;
            for (Object e : c)
                ret |= remove((String)e);
            return ret;
        }

        @Override
        public void clear() {
            map.clear();
        }
    }
    
    private static class EntrySet extends AbstractSet<Entry<String, Set<String>>> {
        private final NavigableMap<String, Set<String>> map;
        
        public EntrySet(NavigableMap<String, Set<String>> map) {
            this.map = map;
        }

        @Override
        public Iterator<Entry<String, Set<String>>> iterator() {
            if (map instanceof DAWGMapOfStringSets)
                return ((DAWGMapOfStringSets)map).entryWithSetValuesIterator();
            else
                return ((SubMap)map).entryWithSetValuesIterator();
        }

        @Override
        public int size() {
            return map.size();
        }

        @Override
        public boolean isEmpty() {
            return map.isEmpty();
        }

        @Override
        public boolean contains(Object o) {
            if (!(o instanceof Entry))
                return false;
            Entry e = (Entry)o;
            String key = (String)e.getKey();
            Object value = e.getValue();
            if (value instanceof String) {
                if (map instanceof DAWGMapOfStringSets)
                    return ((DAWGMapOfStringSets)map).containsMapping(key, (String)value);
                else
                    return ((SubMap)map).containsMapping(key, (String)value);
            } else {
                Set<String> contained = map.get(key);
                return contained.equals(value);
            }
        }

        @Override
        public boolean remove(Object o) {
            if (!(o instanceof Entry))
                return false;
            Entry e = (Entry)o;
            String key = (String)e.getKey();
            Object value = e.getValue();
            if (value instanceof String)
                return ((ExtraMethodsMap)map).remove(key, (String)value);
            else {
                Set<String> contained = map.get(key);
                if (contained.equals(value))
                    return !map.remove(key).isEmpty();
                return false;
            }
        }

        @Override
        public boolean removeAll(Collection<?> c) {
            boolean ret = false;
            for (Object e : c)
                ret |= remove(e);
            return ret;
        }

        @Override
        public void clear() {
            map.clear();
        }

        @Override
        public boolean add(Entry<String, Set<String>> e) {
            Set<String> value = e.getValue();
            Set<String> old = map.put(e.getKey(), value);
            // Value is definitely not null (checked inside put).
            // Old may be null if this set did not contain the key before.
            // String.equals returns false when comparing to null.
            return !value.equals(old);
        }
    }
    
    private static class Values extends AbstractCollection<Set<String>> {
        private final NavigableMap<String, Set<String>> map;
        
        public Values(NavigableMap<String, Set<String>> map) {
            this.map = map;
        }

        @Override
        public Iterator<Set<String>> iterator() {
            if (map instanceof DAWGMapOfStringSets)
                return ((DAWGMapOfStringSets)map).valueSetsIterator();
            else
                return ((SubMap)map).valueSetsIterator();
        }

        @Override
        public int size() {
            return map.size();
        }

        @Override
        public boolean isEmpty() {
            return map.isEmpty();
        }

        @Override
        public boolean contains(Object o) {
            return map.containsValue(o);
        }

        @Override
        public boolean remove(Object o) {
            if (map instanceof DAWGMapOfStringSets)
                return ((DAWGMapOfStringSets)map).removeValue(o);
            else
                return ((SubMap)map).removeValue(o);
        }

        @Override
        public boolean removeAll(Collection<?> c) {
            boolean ret = false;
            for (Object e : c)
                ret |= remove((String)e);
            return ret;
        }

        @Override
        public void clear() {
            map.clear();
        }
    }
    
    private class Keys extends AbstractCollection<String> {
        private final NavigableMap<String, Set<String>> map;
        private final boolean desc;
        
        public Keys(NavigableMap<String, Set<String>> map, boolean desc) {
            this.map = map;
            this.desc = desc;
        }

        @Override
        public Iterator<String> iterator() {
            if (map instanceof DAWGMapOfStringSets)
                return ((DAWGMapOfStringSets)map).flatKeysIterator(desc);
            else
                return ((SubMap)map).flatKeysIterator(desc);
        }
        
        public NavigableSet<String> uniqueSet() {
            return desc ? map.descendingKeySet() : map.navigableKeySet();
        }

        @Override
        public int size() {
            if (map instanceof DAWGMapOfStringSets)
                return ((DAWGMapOfStringSets)map).flatSize();
            else
                return ((SubMap)map).flatSize();
        }

        @Override
        public boolean isEmpty() {
            return map.isEmpty();
        }

        @Override
        public void clear() {
            map.clear();
        }

        @Override
        public boolean removeAll(Collection<?> c) {
            boolean ret = false;
            for (Object e : c)
                ret |= removeAll((String)e);
            return ret;
        }

        public boolean removeAll(String o) {
            return !map.remove(o).isEmpty();
        }
        
        public int remove(Object o, int occurences) {
            if (occurences >= getCount(o))
                return map.remove((String)o).size();
            int ret = 0;
            while (occurences > ret && remove((String)o))
                ret++;
            return ret;
        }
        
        @Override
        public boolean remove(Object o) {
            Set<String> set = map.get((String)o);
            Iterator<String> i = set.iterator();
            if (i.hasNext())
                return ((ExtraMethodsMap)map).remove(o, i.next());
            return false;
        }
        
        public int getCount(Object o) {
            return map.get((String)o).size();
        }

        @Override
        public boolean contains(Object o) {
            return map.containsKey((String)o);
        }
        
        // TODO: redefine hashCode(), equals() and toString() according to MultiSet requirements.
    }
    
    private class FlatValues extends AbstractCollection<String> {
        private final NavigableMap<String, Set<String>> map;
        
        public FlatValues(NavigableMap<String, Set<String>> map) {
            this.map = map;
        }

        @Override
        public Iterator<String> iterator() {
            if (map instanceof DAWGMapOfStringSets)
                return ((DAWGMapOfStringSets)map).flatValuesIterator();
            else
                return ((SubMap)map).flatValuesIterator();
        }

        @Override
        public int size() {
            if (map instanceof DAWGMapOfStringSets)
                return ((DAWGMapOfStringSets)map).flatSize();
            else
                return ((SubMap)map).flatSize();
        }

        @Override
        public boolean isEmpty() {
            return map.isEmpty();
        }

        @Override
        public void clear() {
            map.clear();
        }

        @Override
        public boolean removeAll(Collection<?> c) {
            boolean ret = false;
            for (Object e : c)
                ret |= remove((String)e);
            return ret;
        }
        
        @Override
        public boolean remove(Object o) {
            if (map instanceof DAWGMapOfStringSets)
                return ((DAWGMapOfStringSets)map).removeValue(o);
            else
                return ((SubMap)map).removeValue(o);
        }

        @Override
        public boolean contains(Object o) {
            return map.containsValue(o);
        }
    }
    
    private class Entries extends AbstractCollection<Entry<String, String>> {
        private final NavigableMap<String, Set<String>> map;
        
        public Entries(NavigableMap<String, Set<String>> map) {
            this.map = map;
        }

        @Override
        public Iterator<Entry<String, String>> iterator() {
            if (map instanceof DAWGMapOfStringSets)
                return ((DAWGMapOfStringSets)map).entryWithStringValuesIterator();
            else
                return ((SubMap)map).entryWithStringValuesIterator();
        }

        @Override
        public int size() {
            if (map instanceof DAWGMapOfStringSets)
                return ((DAWGMapOfStringSets)map).flatSize();
            else
                return ((SubMap)map).flatSize();
        }

        @Override
        public boolean isEmpty() {
            return map.isEmpty();
        }

        @Override
        public void clear() {
            map.clear();
        }

        @Override
        public boolean removeAll(Collection<?> c) {
            boolean ret = false;
            for (Object e : c)
                ret |= remove((String)e);
            return ret;
        }
        
        @Override
        public boolean remove(Object o) {
            if (!(o instanceof Entry))
                return false;
            Entry<String, String> e = (Entry<String, String>)o;
            return ((ExtraMethodsMap)map).remove(e.getKey(), e.getValue());
        }

        @Override
        public boolean contains(Object o) {
            if (!(o instanceof Entry))
                return false;
            Entry<String, String> e = (Entry<String, String>)o;
            if (map instanceof DAWGMapOfStringSets)
                return ((DAWGMapOfStringSets)map).containsMapping(e.getKey(), e.getValue());
            else
                return ((SubMap)map).containsMapping(e.getKey(), e.getValue());
        }

        @Override
        public boolean add(Entry<String, String> e) {
            if (map instanceof DAWGMapOfStringSets)
                return ((DAWGMapOfStringSets)map).put(e.getKey(), e.getValue());
            else
                return ((SubMap)map).put(e.getKey(), e.getValue());
        }

        @Override
        public boolean addAll(Collection<? extends Entry<String, String>> c) {
            if (map instanceof DAWGMapOfStringSets)
                return ((DAWGMapOfStringSets)map).putAll(c);
            else
                return ((SubMap)map).putAll(c);
        }
    }
    
    private class SubMap extends AbstractMap<String, Set<String>> implements NavigableMap<String, Set<String>>, ExtraMethodsMap<String, Set<String>> {
        private final NavigableSet<String> delegate;
        private final boolean desc;
        private int size = -1;

        public SubMap(NavigableSet<String> delegate) {
            this.delegate = delegate;
            desc = delegate.comparator() != null;
        }
        
        private char keyValueSeparator() {
            return desc ? KEY_VALUE_SEPARATOR_EXCLUSIVE : KEY_VALUE_SEPARATOR;
        }
        
        private char keyValueSeparatorExclusive() {
            return desc ? KEY_VALUE_SEPARATOR : KEY_VALUE_SEPARATOR_EXCLUSIVE;
        }

        @Override
        public Entry<String, Set<String>> lowerEntry(String key) {
            key = lowerKey(key);
            return key == null ? null : new MapEntry(key, get(key));
        }

        @Override
        public String lowerKey(String key) {
            checkNotNullAndContainsNoZeros(key);
            return keyOfStringEntry(delegate.lower(key + keyValueSeparator()));
        }

        @Override
        public Entry<String, Set<String>> floorEntry(String key) {
            key = floorKey(key);
            return key == null ? null : new MapEntry(key, get(key));
        }

        @Override
        public String floorKey(String key) {
            checkNotNullAndContainsNoZeros(key);
            return keyOfStringEntry(delegate.lower(key + keyValueSeparatorExclusive()));
        }

        @Override
        public Entry<String, Set<String>> ceilingEntry(String key) {
            key = ceilingKey(key);
            return key == null ? null : new MapEntry(key, get(key));
        }

        @Override
        public String ceilingKey(String key) {
            checkNotNullAndContainsNoZeros(key);
            return keyOfStringEntry(delegate.ceiling(key + keyValueSeparator()));
        }

        @Override
        public Entry<String, Set<String>> higherEntry(String key) {
            key = higherKey(key);
            return key == null ? null : new MapEntry(key, get(key));
        }

        @Override
        public String higherKey(String key) {
            checkNotNullAndContainsNoZeros(key);
            return keyOfStringEntry(delegate.ceiling(key + keyValueSeparatorExclusive()));
        }

        @Override
        public String firstKey() {
            return keyOfStringEntry(delegate.first());
        }

        @Override
        public String lastKey() {
            return keyOfStringEntry(delegate.last());
        }

        @Override
        public Entry<String, Set<String>> firstEntry() {
            String key = firstKey();
            return key == null ? null : new MapEntry(key, get(key));
        }

        @Override
        public Entry<String, Set<String>> lastEntry() {
            String key = lastKey();
            return key == null ? null : new MapEntry(key, get(key));
        }

        @Override
        public Entry<String, Set<String>> pollFirstEntry() {
            String key = firstKey();
            return key == null ? null : new MapEntry(key, remove(key));
        }

        @Override
        public Entry<String, Set<String>> pollLastEntry() {
            String key = lastKey();
            return key == null ? null : new MapEntry(key, remove(key));
        }

        @Override
        public Comparator<? super String> comparator() {
            return delegate.comparator();
        }
        
        @Override
        public Set<Entry<String, Set<String>>> entrySet() {
            return new EntrySet(this);
        }

        @Override
        public Collection<Set<String>> values() {
            return new Values(this);
        }

        @Override
        public Set<String> keySet() {
            return new KeySet(this, false);
        }

        @Override
        public NavigableSet<String> navigableKeySet() {
            return new KeySet(this, false);
        }

        @Override
        public NavigableSet<String> descendingKeySet() {
            return new KeySet(this, true);
        }

        @Override
        public NavigableMap<String, Set<String>> descendingMap() {
            return new SubMap(delegate.descendingSet());
        }

        @Override
        public NavigableMap<String, Set<String>> subMap(String fromKey, boolean fromInclusive, String toKey, boolean toInclusive) {
            if (fromKey.compareTo(toKey) > 0)
                throw new IllegalArgumentException("fromKey > toKey");
            if (fromInclusive && fromKey.isEmpty())
                fromKey = null;
            else
                checkNotNullAndContainsNoZeros(fromKey);
            checkNotNullAndContainsNoZeros(toKey);
            return new SubMap(delegate.subSet(fromKey + (fromInclusive ? keyValueSeparator() : keyValueSeparatorExclusive()), true, toKey + (toInclusive ? keyValueSeparatorExclusive() : keyValueSeparator()), false));
        }

        @Override
        public NavigableMap<String, Set<String>> headMap(String toKey, boolean inclusive) {
            checkNotNullAndContainsNoZeros(toKey);
            return new SubMap(delegate.headSet(toKey + (inclusive ? keyValueSeparatorExclusive() : keyValueSeparator()), false));
        }

        @Override
        public NavigableMap<String, Set<String>> tailMap(String fromKey, boolean inclusive) {
            if (inclusive && fromKey.isEmpty())
                return this;
            checkNotNullAndContainsNoZeros(fromKey);
            return new SubMap(delegate.tailSet(fromKey + (inclusive ? keyValueSeparator() : keyValueSeparatorExclusive()), true));
        }

        @Override
        public SortedMap<String, Set<String>> subMap(String fromKey, String toKey) {
            if (fromKey.compareTo(toKey) > 0)
                throw new IllegalArgumentException("fromKey > toKey");
            if (fromKey.isEmpty())
                fromKey = null;
            else
                checkNotNullAndContainsNoZeros(fromKey);
            checkNotNullAndContainsNoZeros(toKey);
            return new SubMap(delegate.subSet(fromKey + keyValueSeparator(), true, toKey + keyValueSeparator(), false));
        }

        @Override
        public SortedMap<String, Set<String>> headMap(String toKey) {
            checkNotNullAndContainsNoZeros(toKey);
            return new SubMap(delegate.headSet(toKey + keyValueSeparator(), false));
        }

        @Override
        public SortedMap<String, Set<String>> tailMap(String fromKey) {
            if (fromKey.isEmpty())
                return this;
            checkNotNullAndContainsNoZeros(fromKey);
            return new SubMap(delegate.tailSet(fromKey + keyValueSeparator(), true));
        }

        private Iterator<String> uniqueKeysIterator(boolean desc) {
            return DAWGMapOfStringSets.this.uniqueKeysIterator(delegate, desc);
        }

        private Iterator<Entry<String, Set<String>>> entryWithSetValuesIterator() {
            return DAWGMapOfStringSets.this.entryWithSetValuesIterator(delegate);
        }

        private Iterator<Set<String>> valueSetsIterator() {
            return DAWGMapOfStringSets.this.valueSetsIterator(delegate);
        }

        private Iterator<String> flatKeysIterator(boolean desc) {
            return DAWGMapOfStringSets.this.flatKeysIterator(delegate, desc);
        }

        private Iterator<Entry<String, String>> entryWithStringValuesIterator() {
            return DAWGMapOfStringSets.this.entryWithStringValuesIterator(delegate);
        }

        private Iterator<String> flatValuesIterator() {
            return DAWGMapOfStringSets.this.flatValuesIterator(delegate);
        }

        private boolean containsMapping(String key, String value) {
            checkNotNullAndContainsNoZeros(key);
            checkNotNullAndContainsNoZeros(value);
            return delegate.contains(key + KEY_VALUE_SEPARATOR + value);
        }

        @Override
        public boolean remove(Object key, Object value) {
            checkNotNullAndContainsNoZeros(key);
            checkNotNullAndContainsNoZeros(value);
            return delegate.remove((String)key + KEY_VALUE_SEPARATOR + value);
        }

        private boolean removeValue(Object value) {
            if (value instanceof String) {
                checkNotNullAndContainsNoZeros(value);
                Iterator<String> it = ((StringsFilter)delegate).getStringsEndingWith(KEY_VALUE_SEPARATOR + (String)value).iterator();
                if (it.hasNext()) {
                    String stringEntry = it.next();
                    return dawg.remove(stringEntry);
                }
            }
            Iterator<Entry<String, Set<String>>> i = entrySet().iterator();
            while (i.hasNext()) {
                Entry<String, Set<String>> e = i.next();
                if (value.equals(e.getValue())) {
                    i.remove();
                    return true;
                }
            }
            return false;
        }

        @Override
        public Set<String> remove(Object key) {
            Set<String> ret = get((String)key);
            if (ret.isEmpty())
                ret = Collections.EMPTY_SET;
            else // An unmodifiable set of previously stored data.
                ret = new ModifiableDAWGSet(false, ret).compress();
            for (String s : ret)
                dawg.remove((String)key + KEY_VALUE_SEPARATOR + s);
            return ret;
        }

        @Override
        public Set<String> put(final String key, final Set<String> value) {
            Set<String> ret = get(key);
            if (ret.isEmpty())
                ret = null;
            else // An unmodifiable set of previously stored data.
                ret = new ModifiableDAWGSet(false, ret).compress();
            delegate.addAll(new AbstractSet<String>() {
                @Override
                public Iterator<String> iterator() {
                    return new Iterator<String>() {
                        private final Iterator<? extends String> it = value.iterator();

                        @Override
                        public String next() {
                            String s = it.next();
                            checkNotNullAndContainsNoZeros(s);
                            return key + KEY_VALUE_SEPARATOR + s;
                        }

                        @Override
                        public boolean hasNext() {
                            return it.hasNext();
                        }

                        @Override
                        public void remove() {
                            throw new UnsupportedOperationException();
                        }
                    };
                }

                @Override
                public int size() {
                    return value.size();
                }
            });
            return ret;
        }
    
        public boolean put(String key, String value) {
            checkNotNullAndContainsNoZeros(key);
            checkNotNullAndContainsNoZeros(value);
            return delegate.add(key + KEY_VALUE_SEPARATOR + value);
        }
    
        private boolean putAll(final Collection<? extends Entry<String, String>> c) {
            return delegate.addAll(new AbstractCollection<String>() {
                private final Iterator entryIt = c.iterator();
                
                @Override
                public Iterator<String> iterator() {
                    return new Iterator<String>() {
                        @Override
                        public String next() {
                            Entry e = (Entry)entryIt.next();
                            String key = (String)e.getKey();
                            checkNotNullAndContainsNoZeros(key);
                            String value = (String)e.getValue();
                            checkNotNullAndContainsNoZeros(value);
                            return key + KEY_VALUE_SEPARATOR + value;
                        }

                        @Override
                        public boolean hasNext() {
                            return entryIt.hasNext();
                        }

                        @Override
                        public void remove() {
                            throw new UnsupportedOperationException();
                        }
                    };
                }

                @Override
                public int size() {
                    return c.size();
                }
            });
        }

        @Override
        public Set<String> get(Object key) {
            checkNotNullAndContainsNoZeros(key);
            return new ValuesSetFromIterable(((StringsFilter)delegate).getStringsStartingWith((String)key + KEY_VALUE_SEPARATOR), (String)key);
        }

        @Override
        public boolean containsKey(Object key) {
            checkNotNullAndContainsNoZeros(key);
            return ((StringsFilter)delegate).getStringsStartingWith((String)key + KEY_VALUE_SEPARATOR).iterator().hasNext();
        }

        @Override
        public boolean containsValue(Object value) {
            if (value instanceof String) {
                checkNotNullAndContainsNoZeros(value);
                return ((StringsFilter)delegate).getStringsEndingWith(KEY_VALUE_SEPARATOR + (String)value).iterator().hasNext();
            }
            Iterator<Entry<String, Set<String>>> i = entrySet().iterator();
            while (i.hasNext()) {
                Entry<String, Set<String>> e = i.next();
                if (value.equals(e.getValue()))
                    return true;
            }
            return false;
        }

        @Override
        public boolean isEmpty() {
            return delegate.isEmpty();
        }

        @Override
        public int size() {
            if (size < 0) {
                int s = 0;
                for (Iterator<String> it = uniqueKeysIterator(false); it.hasNext(); it.next())
                    s++;
                if (dawg.isImmutable())
                    size = s;
                else
                    return s;
            }
            return size;
        }
        
        public int flatSize() {
            return delegate.size();
        }
    }
}