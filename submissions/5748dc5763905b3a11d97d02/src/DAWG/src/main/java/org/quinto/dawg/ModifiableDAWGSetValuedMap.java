package org.quinto.dawg;

public class ModifiableDAWGSetValuedMap extends DAWGSetValuedMap {
    public ModifiableDAWGSetValuedMap() {
        super(new ModifiableDAWGMapOfStringSets());
    }
    
    public ModifiableDAWGSetValuedMap(boolean withIncomingTransitions) {
        super(new ModifiableDAWGMapOfStringSets(withIncomingTransitions));
    }
    
    ModifiableDAWGSetValuedMap(ModifiableDAWGMapOfStringSets dawg) {
        super(dawg);
    }
    
    public CompressedDAWGSetValuedMap compress() {
        return new CompressedDAWGSetValuedMap(((ModifiableDAWGMapOfStringSets)mapOfSets).compress());
    }
}