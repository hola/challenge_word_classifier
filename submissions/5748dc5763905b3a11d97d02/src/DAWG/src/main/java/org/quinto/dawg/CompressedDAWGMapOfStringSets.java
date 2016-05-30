package org.quinto.dawg;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;

class CompressedDAWGMapOfStringSets extends DAWGMapOfStringSets implements Serializable {
    private static final long serialVersionUID = 1L;
    
    CompressedDAWGMapOfStringSets(CompressedDAWGSet dawg) {
        super(dawg);
    }
    
    public ModifiableDAWGMapOfStringSets uncompress() {
        return new ModifiableDAWGMapOfStringSets(((CompressedDAWGSet)dawg).uncompress());
    }

    @Override
    public int hashCode() {
        return dawg.hashCode();
    }

    @Override
    public boolean equals(Object o) {
        if (o == this)
            return true;
        if (o instanceof CompressedDAWGMapOfStringSets) {
            CompressedDAWGMapOfStringSets map = (CompressedDAWGMapOfStringSets)o;
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