package org.quinto.dawg;

import org.quinto.dawg.util.Serializer;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Map.Entry;
import java.util.NavigableMap;
import java.util.TreeMap;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import org.junit.Test;

public class DAWGMapTest {
    @Test
    public void putSimple() throws IOException, ClassNotFoundException {
        ModifiableDAWGMap dawg = new ModifiableDAWGMap();
        dawg.put("a", "b");
        assertEquals("b", dawg.get("a"));
        dawg.put("d", "ed");
        assertEquals("ed", dawg.get("d"));
        dawg.put("a", "c");
        assertEquals("c", dawg.get("a"));
        
        CompressedDAWGMap cdawg = dawg.compress();
        assertEquals("ed", cdawg.get("d"));
        assertEquals("c", cdawg.get("a"));
        assertEquals(dawg, cdawg.uncompress());
        assertEquals(cdawg, cdawg.uncompress().compress());
        assertEquals(cdawg, Serializer.serializeAndRead(cdawg));
        
        cdawg = dawg.compress();
        assertEquals(dawg, cdawg.uncompress());
        assertEquals(cdawg, cdawg.uncompress().compress());
        assertEquals(cdawg, Serializer.serializeAndRead(cdawg));
        
        assertFalse(dawg.values().remove(""));
        assertTrue(dawg.values().remove("ed"));
        assertEquals(1, dawg.size());
        dawg.put("d", "ed");
        assertEquals(2, dawg.size());
        dawg.subMap("a", "g").values().remove("ed");
        assertEquals(1, dawg.size());
    }
    
    private static String concat(Entry<String, String> e) {
        return e.getKey() + '@' + e.getValue();
    }
    
    @Test
    public void put() {
        ModifiableDAWGMap dawg = new ModifiableDAWGMap();
        for (String key : new String[]{"kex", "kex1", "kexx", "kexy", "key", "key1", "keyx", "keyy", "kez"}) {
            for (String value : new String[]{"val0", "val1", "val2"}) {
                dawg.put(key, value);
            }
        }
        assertEquals("kexy@val2", concat(dawg.lowerEntry("key")));
        assertEquals("key@val2", concat(dawg.floorEntry("key")));
        assertEquals("key@val2", concat(dawg.ceilingEntry("key")));
        assertEquals("key1@val2", concat(dawg.higherEntry("key")));
        
        assertEquals("key1@val2", concat(dawg.descendingMap().lowerEntry("key")));
        assertEquals("key@val2", concat(dawg.descendingMap().floorEntry("key")));
        assertEquals("key@val2", concat(dawg.descendingMap().ceilingEntry("key")));
        assertEquals("kexy@val2", concat(dawg.descendingMap().higherEntry("key")));
        
        assertEquals(dawg, dawg.prefixMap("ke"));
        NavigableMap<String, String> prefixed = dawg.prefixMap("key");
        assertEquals(4, prefixed.size());
        assertEquals(2, prefixed.subMap("key", true, "key1", true).size());
        assertEquals("key", prefixed.subMap("key", true, "key1", true).firstKey());
        assertEquals(2, prefixed.subMap("key", true, "key2", true).size());
        assertEquals(2, prefixed.subMap("key", true, "key2", false).size());
        assertEquals(1, prefixed.subMap("key", true, "key1", false).size());
        assertEquals(0, prefixed.subMap("key", false, "key1", false).size());
        assertEquals(1, prefixed.subMap("key", false, "key1", true).size());
        assertEquals("key1", prefixed.subMap("key", false, "key1", true).firstKey());
        assertEquals(Arrays.asList("keyy", "keyx", "key1", "key"), new ArrayList<String>(prefixed.descendingMap().keySet()));
        
        assertEquals("key@val2", concat(dawg.tailMap("key", true).entrySet().iterator().next()));
        assertEquals("key1@val2", concat(dawg.tailMap("key", false).entrySet().iterator().next()));
        assertEquals("key", dawg.tailMap("key", true).navigableKeySet().iterator().next());
        assertEquals("key1", dawg.tailMap("key", false).navigableKeySet().iterator().next());
        assertEquals("key@val2", concat(dawg.descendingMap().tailMap("key", true).entrySet().iterator().next()));
        assertEquals("kexy@val2", concat(dawg.descendingMap().tailMap("key", false).entrySet().iterator().next()));
        assertEquals("key@val2", concat(dawg.headMap("key", true).descendingMap().entrySet().iterator().next()));
        assertEquals("kexy@val2", concat(dawg.headMap("key", false).descendingMap().entrySet().iterator().next()));
        assertEquals("key", dawg.headMap("key", true).descendingKeySet().iterator().next());
        assertEquals("kexy", dawg.headMap("key", false).descendingKeySet().iterator().next());
        assertEquals("key", dawg.headMap("key", true).navigableKeySet().descendingIterator().next());
        assertEquals("kexy", dawg.headMap("key", false).navigableKeySet().descendingIterator().next());
    }
    
    @Test
    public void putTreeMap() {
        NavigableMap<String, String> dawg = new TreeMap<String, String>();
        for (String key : new String[]{"kex", "kex1", "kexx", "kexy", "key", "key1", "keyx", "keyy", "kez"}) {
            for (String value : new String[]{"val0", "val1", "val2"}) {
                dawg.put(key, value);
            }
        }
        assertEquals("kexy@val2", concat(dawg.lowerEntry("key")));
        assertEquals("key@val2", concat(dawg.floorEntry("key")));
        assertEquals("key@val2", concat(dawg.ceilingEntry("key")));
        assertEquals("key1@val2", concat(dawg.higherEntry("key")));
        
        assertEquals("key1@val2", concat(dawg.descendingMap().lowerEntry("key")));
        assertEquals("key@val2", concat(dawg.descendingMap().floorEntry("key")));
        assertEquals("key@val2", concat(dawg.descendingMap().ceilingEntry("key")));
        assertEquals("kexy@val2", concat(dawg.descendingMap().higherEntry("key")));
        
        assertEquals("key@val2", concat(dawg.tailMap("key", true).entrySet().iterator().next()));
        assertEquals("key1@val2", concat(dawg.tailMap("key", false).entrySet().iterator().next()));
        assertEquals("key", dawg.tailMap("key", true).navigableKeySet().iterator().next());
        assertEquals("key1", dawg.tailMap("key", false).navigableKeySet().iterator().next());
        assertEquals("key@val2", concat(dawg.descendingMap().tailMap("key", true).entrySet().iterator().next()));
        assertEquals("kexy@val2", concat(dawg.descendingMap().tailMap("key", false).entrySet().iterator().next()));
        assertEquals("key@val2", concat(dawg.headMap("key", true).descendingMap().entrySet().iterator().next()));
        assertEquals("kexy@val2", concat(dawg.headMap("key", false).descendingMap().entrySet().iterator().next()));
        assertEquals("key", dawg.headMap("key", true).descendingKeySet().iterator().next());
        assertEquals("kexy", dawg.headMap("key", false).descendingKeySet().iterator().next());
        assertEquals("key", dawg.headMap("key", true).navigableKeySet().descendingIterator().next());
        assertEquals("kexy", dawg.headMap("key", false).navigableKeySet().descendingIterator().next());
    }
    
    @Test(expected = IllegalArgumentException.class)
    public void putOutOfRange() {
        ModifiableDAWGMap dawg = new ModifiableDAWGMap();
        NavigableMap<String, String> map = dawg.subMap("bac", "baw");
        map.put("baa", "value");
    }
}