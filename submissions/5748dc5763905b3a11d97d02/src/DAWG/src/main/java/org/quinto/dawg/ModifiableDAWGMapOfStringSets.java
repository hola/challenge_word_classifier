package org.quinto.dawg;

class ModifiableDAWGMapOfStringSets extends DAWGMapOfStringSets {
    public ModifiableDAWGMapOfStringSets() {
        super(new ModifiableDAWGSet());
    }
    
    public ModifiableDAWGMapOfStringSets(boolean withIncomingTransitions) {
        super(new ModifiableDAWGSet(withIncomingTransitions));
    }
    
    ModifiableDAWGMapOfStringSets(ModifiableDAWGSet dawg) {
        super(dawg);
    }
    
    public CompressedDAWGMapOfStringSets compress() {
        return new CompressedDAWGMapOfStringSets(((ModifiableDAWGSet)dawg).compress());
    }
}