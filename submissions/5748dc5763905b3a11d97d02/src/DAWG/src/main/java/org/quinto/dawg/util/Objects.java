package org.quinto.dawg.util;

public class Objects {
    public static int hashCode(Object o) {
        return o == null ? 0 : o.hashCode();
    }
    
    public static boolean equals(Object a, Object b) {
        return a == b || a != null && a.equals(b);
    }
}