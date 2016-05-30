package org.quinto.dawg;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;

public class CompressedDAWGMap extends DAWGMap implements Serializable {
    private static final long serialVersionUID = 1L;
    private transient Integer hashCode;
    
    CompressedDAWGMap(CompressedDAWGSet dawg) {
        super(dawg);
    }
    
    public ModifiableDAWGMap uncompress() {
        return new ModifiableDAWGMap(((CompressedDAWGSet)dawg).uncompress());
    }

    @Override
    public int hashCode() {
        // Hash code should return the same value for equal objects.
        // Simplified equals() method is possible but simplification
        // of hashCode() would give results that differ from other Map implementations.
        if (hashCode == null)
            hashCode = super.hashCode();
        return hashCode;
    }

    @Override
    public boolean equals(Object o) {
        if (o == this)
            return true;
        if (o instanceof CompressedDAWGMap) {
            CompressedDAWGMap map = (CompressedDAWGMap)o;
            return dawg.equals(map.dawg);
        }
        return super.equals(o);
    }
    
    /**
     * This method is invoked when the object is read from input stream.
     * @see Serializable
     */
    private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
        ois.defaultReadObject();
        dawg = (CompressedDAWGSet)ois.readObject();
    }
    
    private void writeObject(ObjectOutputStream oos) throws IOException {
        oos.defaultWriteObject();
        oos.writeObject(dawg);
    }
}