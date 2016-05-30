package org.quinto.dawg;

import org.quinto.dawg.util.Serializer;
import java.io.IOException;
import java.util.Set;
import java.util.TreeSet;
import java.util.Arrays;
import org.junit.Test;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class DAWGSetValuedMapTest {
    private static Set<String> asSet(String... values) {
        return new TreeSet<String>(Arrays.asList(values));
    }
    
    @Test
    public void putSimple() throws IOException, ClassNotFoundException {
        ModifiableDAWGSetValuedMap dawg = new ModifiableDAWGSetValuedMap();
        dawg.put("a", "b");
        assertEquals(asSet("b"), dawg.get("a"));
        dawg.put("d", "ed");
        assertEquals(asSet("ed"), dawg.get("d"));
        dawg.put("a", "c");
        assertEquals(asSet("b", "c"), dawg.get("a"));
        
        CompressedDAWGSetValuedMap cdawg = dawg.compress();
        assertEquals(asSet("ed"), cdawg.get("d"));
        assertEquals(asSet("b", "c"), cdawg.get("a"));
        assertEquals(dawg, cdawg.uncompress());
        assertEquals(cdawg, cdawg.uncompress().compress());
        assertEquals(cdawg, Serializer.serializeAndRead(cdawg));
        
        cdawg = dawg.compress();
        assertEquals(dawg, cdawg.uncompress());
        assertEquals(cdawg, cdawg.uncompress().compress());
        assertEquals(cdawg, Serializer.serializeAndRead(cdawg));
        
        assertFalse(dawg.values().remove(""));
        assertTrue(dawg.values().remove("ed"));
        assertEquals(2, dawg.size());
        dawg.put("d", "ed");
        assertEquals(3, dawg.size());
        dawg.values().remove("ed");
        assertEquals(2, dawg.size());
        
        dawg = cdawg.uncompress();
        assertTrue(dawg.values().remove("b"));
        assertTrue(dawg.values().remove("c"));
        assertEquals(1, dawg.size());
        
        dawg = cdawg.uncompress();
        assertTrue(dawg.removeValue("b"));
        assertTrue(dawg.removeValue("c"));
        assertEquals(1, dawg.size());
        
        dawg = cdawg.uncompress();
        assertTrue(dawg.removeValue("b"));
        assertEquals(2, dawg.size());
    }
}