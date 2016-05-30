package org.quinto.dawg;

public abstract class DAWGNode {
    public static final int EMPTY = -1;
    public static final int START = 0;
    public static final int END = 1;
    
    public abstract int getId();
    
    public abstract boolean isAcceptNode();
    
    /**
     * Follows an outgoing transition of this node labeled with a given char.
     
     * @param letter        the char representation of the desired transition's label
     * @return              the DAWGNode that is the target of the transition labeled with {@code letter},
     *                      or null if there is no such labeled transition from this node
     */
    public abstract DAWGNode transition(char letter);
    
    /**
     * Follows a transition path starting from this node.
     
     * @param str               a String corresponding a transition path in the DAWG
     * @return                  the ModifiableDAWGNode at the end of the transition path corresponding to
                          {@code str}, or null if such a transition path is not present in the DAWG
     */
    public DAWGNode transition(String str) {
        DAWGNode currentNode = this;
        
        //Iteratively transition through the DAWG using the chars in str
        for (char c : str.toCharArray()) {
            currentNode = currentNode.transition(c);
            if (currentNode == null)
                break;
        }
        
        return currentNode;
    }
}