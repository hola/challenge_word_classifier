##About
**DAWG** (Directed Acyclic Word Graph) is a **Java library** capable of constructing character-sequence-storing, directed acyclic graphs of minimal size.

This is a new version of a [MDAG](https://github.com/klawson88/MDAG) library initially started by [Kevin Lawson](https://github.com/klawson88). This fork was renamed to simplify googling.

The library is small, deceptively simple, fast and powerful. It differs from other libraries capable of creating minimal directed acyclic graphs
(also known as **MAFSA** (Minimal Acyclic Finite State Automaton), **MDAG** (Minimalistic Directed Acyclic Graph), **DAWG** ([Directed Acyclic Word Graph](https://en.wikipedia.org/wiki/Directed_acyclic_word_graph)) or **DAFSA** ([Deterministic Acyclic Finite State Automaton](https://en.wikipedia.org/wiki/Deterministic_acyclic_finite_state_automaton))) in the following ways:

- Graphs are constructed directly from input (instead of from a preliminarily constructed trie)
- Graphs can be constructed from unsorted input
- Graphs can be constructed from either files or collections
- Graphs can be modified on the fly (words can be added and/or removed from the represented lexicon)
- Graphs can be compressed to an array for even more space-savings
- Out of the box convenience methods are provided for perusing the graph

The code well structured, easy to follow, and extensively commented for the
benefit of developers seeking to understand the data structure, as well as
developers seeking to add homogeneous, functionality-extending code with ease.

The code has also been fully tested for correct functionality and performance.

Additions in this fork:

- Methods to draw the structure in GraphViz
- Map class
- MultiMap class
- NavigableSet and NavigableMap implementations
- Various optimizations
- Better compression for small alphabets
- Raw int array representation of a compressed DAWG
- Inverse links between nodes for fast suffix search
- Slight bug fixes (like empty strings support)
- Issues of original repository resolved
- Pull requests included

Beware: this fork isn't API compatible with the original library.

Requirements:

- Java 6
- No additional runtime dependencies
- JUnit (for tests)

##How to use

    ModifiableDAWGSet dawg = new ModifiableDAWGSet();
    
    //Add a single String to the lexicon
    dawg.add("str0");
    
    //Add a collection of Strings to the lexicon
    dawg.addAll(Arrays.asList("str1", "str2", "str3"));
    
    //Remove a String from the lexicon
    dawg.remove("str0");
    
    //Determine if the lexicon contains a given String, O(1)
    //Here and further O(1) means that time does not depend on DAWG size
    //But it linearly depends on input length
    boolean doesContain = dawg.contains("str0"); //false
    
    //Get all Strings starting with "str1", O(1) - returns lazy Iterable.
    //Iteration would take O(output quantity)
    Iterable<String> startingWithSet = dawg.getStringsStartingWith("str1"); //{"str1"}

    //Get all String ending with "2", O(output quantity) for iteration
    Iterable<String> endingWithSet = dawg.geStringsEndingWith("2"); //{"str2"}
    
    //Get all String containing "r3", O(DAWG size) for iteration in worst case
    //But this method is optimized not to check each value against the filter condition
    //If a string containing a given substring is found then all child nodes would match
    Iterable<String> containingSet = dawg.getStringsWithSubstring("r3"); //{"str3"}
    
    //Get all Strings, O(DAWG size) for iteration
    Iterable<String> entireSet = dawg.getAllStrings(); //{"str1", "str2", "str3"}
    
    //Compress graph structure to an array (further space reduction)
    //cdawg is immutable, unmodifiable and serializable
    CompressedDAWGSet cdawg = dawg.compress();

Further plans:

- ~~Better format of compression for large alphabets~~ (finished)
- ~~Lower the requirements to Java 6~~ (finished)
- Optimize nodes traversal via `TreeSet.subSet` methods
- Replace SemiNavigableMap (internal class) with NavigableMap (for API publication)
- Public API for graph traversal
- Implement NavigableSet for values() in DAWGSetValuedMap
- Implement Apache Commons Collections interfaces (Trie, MultiValuedMap etc.)
- Add and implement NavigableMultiValuedMap interface
- Add API documentation, internal structure description, usage examples and javadoc
- Add benchmarks and features comparison with other data structures

##Licensing and usage information

MDAG is licensed under the Apache License, Version 2.0.

[Original repository](https://github.com/klawson88/MDAG)

##Reference material

- Incremental Construction of Minimal Acyclic Finite-State Automata (2000) by Jan Daciuk , Stoyan Mihov , Bruce W. Watson , Richard E. Watson
  (http://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.37.7600)
  (Presented algorithms used as bases for MDAG construction and manipulation algorithms)
  
- Programming Abstractions (Lecture 25)- Julie Zelinsky (Stanford University)
  (http://www.youtube.com/watch?v=TJ8SkcUSdbU)
  (Presented size reduction process used as basis for MDAG simplification algorithm)