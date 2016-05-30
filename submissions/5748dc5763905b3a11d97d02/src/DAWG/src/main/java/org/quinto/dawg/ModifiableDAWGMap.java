package org.quinto.dawg;

public class ModifiableDAWGMap extends DAWGMap {
    public ModifiableDAWGMap() {
        super(new ModifiableDAWGSet());
    }
    
    public ModifiableDAWGMap(boolean withIncomingTransitions) {
        super(new ModifiableDAWGSet(withIncomingTransitions));
    }
    
    ModifiableDAWGMap(ModifiableDAWGSet dawg) {
        super(dawg);
    }
    
    public CompressedDAWGMap compress() {
        return new CompressedDAWGMap(((ModifiableDAWGSet)dawg).compress());
    }
}