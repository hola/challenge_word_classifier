package org.quinto.dawg;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;

public class CompressedDAWGSetValuedMap extends DAWGSetValuedMap implements Serializable {
    private static final long serialVersionUID = 1L;
    
    CompressedDAWGSetValuedMap(CompressedDAWGMapOfStringSets dawg) {
        super(dawg);
    }
    
    public ModifiableDAWGSetValuedMap uncompress() {
        return new ModifiableDAWGSetValuedMap(((CompressedDAWGMapOfStringSets)mapOfSets).uncompress());
    }
    
    /**
     * This method is invoked when the object is read from input stream.
     * @see Serializable
     */
    private void readObject(ObjectInputStream ois) throws IOException, ClassNotFoundException {
        ois.defaultReadObject();
        CompressedDAWGSet dawg = (CompressedDAWGSet)ois.readObject();
        mapOfSets = new CompressedDAWGMapOfStringSets(dawg);
    }
    
    private void writeObject(ObjectOutputStream oos) throws IOException {
        oos.defaultWriteObject();
        oos.writeObject(mapOfSets.dawg);
    }
}