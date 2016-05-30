package org.quinto.dawg;

import java.util.Collection;
import java.util.Map;
import java.util.Map.Entry;
import java.util.NavigableSet;
import java.util.Set;

public class DAWGSetValuedMap {
    DAWGMapOfStringSets mapOfSets;
    
    DAWGSetValuedMap() {
    }
    
    DAWGSetValuedMap(DAWGMapOfStringSets mapOfSets) {
        this.mapOfSets = mapOfSets;
    }
    
    public DAWGSet getUnderlyingSet() {
        return mapOfSets.getUnderlyingSet();
    }
    
    public int size() {
        return mapOfSets.flatSize();
    }
    
    public boolean isEmpty() {
        return mapOfSets.isEmpty();
    }
    
    public boolean containsKey(Object key) {
        return mapOfSets.containsKey((String)key);
    }
    
    public boolean containsValue(Object value) {
        return mapOfSets.containsValue((String)value);
    }
    
    public boolean containsMapping(Object key, Object value) {
        return mapOfSets.containsMapping(key, value);
    }
    
    // TODO: implement NavigableSet interface.
    public Set<String> get(String key) {
        return mapOfSets.get(key);
    }
    
    public boolean put(String key, String value) {
        return mapOfSets.put(key, value);
    }
    
    public boolean putAll(String key, Iterable<? extends String> values) {
        return mapOfSets.putAll(key, values);
    }
    
    public boolean putAll(Map<? extends String, ? extends String> map) {
        return mapOfSets.putAll(map.entrySet());
    }
    
    public boolean putAll(DAWGSetValuedMap map) {
        return mapOfSets.putAll(map.entries());
    }
    
    public Set<String> remove(Object key) {
        return mapOfSets.remove((String)key);
    }
    
    public boolean removeValue(Object value) {
        return mapOfSets.removeValue(value);
    }
    
    public boolean removeMapping(Object key, Object item) {
        return mapOfSets.remove(key, item);
    }
    
    public void clear() {
        mapOfSets.clear();
    }
    
    public Collection<Entry<String, String>> entries() {
        return mapOfSets.entries();
    }
    
    public NavigableSet<String> keySet() {
        return mapOfSets.keySet();
    }
    
    public Collection<String> values() {
        return mapOfSets.flatValues();
    }
    
    public Map<String, Set<String>> asMap() {
        return mapOfSets;
    }
    
    public Collection<String> keys() {
        return mapOfSets.keys();
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj)
            return true;
        if (obj instanceof DAWGSetValuedMap)
            return mapOfSets.equals(((DAWGSetValuedMap)obj).mapOfSets);
        return false;
    }
    
    @Override
    public int hashCode() {
        return mapOfSets.hashCode();
    }
    
    @Override
    public String toString() {
        return mapOfSets.toString();
    }
}