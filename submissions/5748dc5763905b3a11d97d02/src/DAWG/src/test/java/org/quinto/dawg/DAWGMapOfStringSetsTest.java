package org.quinto.dawg;

import org.quinto.dawg.util.Serializer;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.NavigableMap;
import java.util.Set;
import java.util.TreeSet;
import static java.util.Arrays.asList;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import org.junit.Test;

public class DAWGMapOfStringSetsTest {
    @Test(expected = IllegalArgumentException.class)
    public void getAndPutWithZeros() {
        ModifiableDAWGMapOfStringSets map = new ModifiableDAWGMapOfStringSets();
        Set<String> set = map.get("a");
        set.add("c\0b");
    }
    
    @Test
    public void putAll() {
        Map<String, Set<String>> data = new HashMap<String, Set<String>>();
        Set<String> set = new HashSet<String>();
        set.add("0");
        set.add("1");
        set.add("2");
        data.put("a", set);
        Set<String> another = new HashSet<String>();
        another.add("3");
        another.add("4");
        another.add("5");
        data.put("b", another);
        ModifiableDAWGMapOfStringSets map = new ModifiableDAWGMapOfStringSets();
        map.putAll(data);
        assertEquals(6, map.flatSize());
        assertEquals(2, map.size());
        assertEquals(3, map.get("a").size());
        assertEquals(3, map.get("b").size());
        assertEquals(0, map.get("c").size());
        assertEquals(set, map.get("a"));
        assertEquals(another, map.get("b"));
        assertEquals(Collections.EMPTY_SET, map.get("c"));
    }
    
    private static Set<String> asSet(String... values) {
        return new TreeSet<String>(asList(values));
    }
    
    @Test
    public void putSimple() throws IOException, ClassNotFoundException {
        ModifiableDAWGMapOfStringSets dawg = new ModifiableDAWGMapOfStringSets();
        dawg.put("a", "b");
        assertEquals(asSet("b"), dawg.get("a"));
        dawg.put("d", "ed");
        assertEquals(asSet("ed"), dawg.get("d"));
        dawg.put("a", "c");
        assertEquals(asSet("b", "c"), dawg.get("a"));
        
        CompressedDAWGMapOfStringSets cdawg = dawg.compress();
        assertEquals(asSet("ed"), cdawg.get("d"));
        assertEquals(asSet("b", "c"), cdawg.get("a"));
        assertEquals(dawg, cdawg.uncompress());
        assertEquals(cdawg, cdawg.uncompress().compress());
        assertEquals(cdawg, Serializer.serializeAndRead(cdawg));
        
        cdawg = dawg.compress();
        assertEquals(dawg, cdawg.uncompress());
        assertEquals(cdawg, cdawg.uncompress().compress());
        assertEquals(cdawg, Serializer.serializeAndRead(cdawg));
        
        assertFalse(dawg.values().remove(asSet("")));
        assertTrue(dawg.values().remove(asSet("ed")));
        assertEquals(1, dawg.size());
        dawg.put("d", "ed");
        assertEquals(2, dawg.size());
        dawg.subMap("a", "g").values().remove(asSet("ed"));
        assertEquals(1, dawg.size());
        
        dawg = cdawg.uncompress();
        assertFalse(dawg.values().remove(asSet("b")));
        assertTrue(dawg.values().remove(asSet("b", "c")));
        assertEquals(1, dawg.size());
        
        dawg = cdawg.uncompress();
        assertFalse(dawg.removeValue(asSet("b")));
        assertTrue(dawg.removeValue(asSet("b", "c")));
        assertEquals(1, dawg.size());
        
        dawg = cdawg.uncompress();
        assertTrue(dawg.removeValue("b"));
        assertEquals(2, dawg.size());
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void putOutOfRange() {
        ModifiableDAWGMapOfStringSets dawg = new ModifiableDAWGMapOfStringSets();
        NavigableMap<String, Set<String>> map = dawg.subMap("bac", "baw");
        map.put("baa", asSet("value"));
    }
    
    private static List<String> concat(Entry<String, Set<String>> e) {
        List<String> ret = new ArrayList<String>();
        for (String value : e.getValue())
          ret.add(e.getKey() + '@' + value);
        return ret;
    }
    
    @Test
    public void put() {
        ModifiableDAWGMapOfStringSets dawg = new ModifiableDAWGMapOfStringSets();
        for (String key : new String[]{"kex", "kex1", "kexx", "kexy", "key", "key1", "keyx", "keyy", "kez"}) {
            for (String value : new String[]{"val0", "val1", "val2"}) {
                dawg.put(key, value);
            }
        }
        assertEquals(asList("kexy@val0", "kexy@val1", "kexy@val2"), concat(dawg.lowerEntry("key")));
        assertEquals(asList("key@val0", "key@val1", "key@val2"), concat(dawg.floorEntry("key")));
        assertEquals(asList("key@val0", "key@val1", "key@val2"), concat(dawg.ceilingEntry("key")));
        assertEquals(asList("key1@val0", "key1@val1", "key1@val2"), concat(dawg.higherEntry("key")));
        
        assertEquals(asList("key1@val2", "key1@val1", "key1@val0"), concat(dawg.descendingMap().lowerEntry("key")));
        assertEquals(asList("key@val2", "key@val1", "key@val0"), concat(dawg.descendingMap().floorEntry("key")));
        assertEquals(asList("key@val2", "key@val1", "key@val0"), concat(dawg.descendingMap().ceilingEntry("key")));
        assertEquals(asList("kexy@val2", "kexy@val1", "kexy@val0"), concat(dawg.descendingMap().higherEntry("key")));
        
        assertEquals(dawg, dawg.prefixMap("ke"));
        NavigableMap<String, Set<String>> prefixed = dawg.prefixMap("key");
        assertEquals(4, prefixed.size());
        assertEquals(9, dawg.size());
        assertEquals(27, dawg.flatSize());
        assertEquals(2, prefixed.subMap("key", true, "key1", true).size());
        assertEquals("key", prefixed.subMap("key", true, "key1", true).firstKey());
        assertEquals(2, prefixed.subMap("key", true, "key2", true).size());
        assertEquals(2, prefixed.subMap("key", true, "key2", false).size());
        assertEquals(1, prefixed.subMap("key", true, "key1", false).size());
        assertEquals(0, prefixed.subMap("key", false, "key1", false).size());
        assertEquals(1, prefixed.subMap("key", false, "key1", true).size());
        assertEquals("key1", prefixed.subMap("key", false, "key1", true).firstKey());
        assertEquals(Arrays.asList("keyy", "keyx", "key1", "key"), new ArrayList<String>(prefixed.descendingMap().keySet()));
        
        assertEquals(asList("key@val0", "key@val1", "key@val2"), concat(dawg.tailMap("key", true).entrySet().iterator().next()));
        assertEquals(asList("key1@val0", "key1@val1", "key1@val2"), concat(dawg.tailMap("key", false).entrySet().iterator().next()));
        assertEquals("key", dawg.tailMap("key", true).navigableKeySet().iterator().next());
        assertEquals("key1", dawg.tailMap("key", false).navigableKeySet().iterator().next());
        assertEquals(asList("key@val2", "key@val1", "key@val0"), concat(dawg.descendingMap().tailMap("key", true).entrySet().iterator().next()));
        assertEquals(asList("kexy@val2", "kexy@val1", "kexy@val0"), concat(dawg.descendingMap().tailMap("key", false).entrySet().iterator().next()));
        assertEquals(asList("key@val2", "key@val1", "key@val0"), concat(dawg.headMap("key", true).descendingMap().entrySet().iterator().next()));
        assertEquals(asList("kexy@val2", "kexy@val1", "kexy@val0"), concat(dawg.headMap("key", false).descendingMap().entrySet().iterator().next()));
        assertEquals("key", dawg.headMap("key", true).descendingKeySet().iterator().next());
        assertEquals("kexy", dawg.headMap("key", false).descendingKeySet().iterator().next());
        assertEquals("key", dawg.headMap("key", true).navigableKeySet().descendingIterator().next());
        assertEquals("kexy", dawg.headMap("key", false).navigableKeySet().descendingIterator().next());
    }
}