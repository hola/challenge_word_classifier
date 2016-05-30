package org.quinto.hola;

import edu.stanford.nlp.process.Stemmer;
import edu.stanford.nlp.simple.Sentence;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import org.apache.commons.collections4.trie.PatriciaTrie;
import org.apache.commons.lang3.tuple.Pair;
import org.quinto.dawg.DAWGNode;
import org.quinto.dawg.DAWGSet;
import org.quinto.dawg.ModifiableDAWGSet;
import static org.quinto.hola.LambdaExceptionUtil.rethrowConsumer;
import static org.quinto.hola.LambdaExceptionUtil.rethrowFunction;

public class Research {
  public static void main( String... args ) throws Exception {
    PatriciaTrie< String > names = new PatriciaTrie<>();
    DAWGSet regular = new ModifiableDAWGSet();
    DAWGSet prefixesList = new ModifiableDAWGSet();
    Files
      .lines( Paths.get( "D:\\Hola\\prefixes_raw.txt" ) )
      .map( s -> s.split( " " ) )
      .map( s -> {
        StatsResult ret = new StatsResult( s[ 0 ].replaceAll( ":", "" ), Integer.parseInt( s[ 1 ].replaceAll( "(all=|,)", "" ) ), null );
        ret.contained = Integer.parseInt( s[ 2 ].replaceAll( "(contained=|,)", "" ) );
        return ret;
      } )
      .sorted( ( o1, o2 ) -> Double.compare( o1.getPercent(), o2.getPercent() ) )
      .forEach( o -> prefixesList.add( o.word ) );
    Files
      .lines( Paths.get( "D:\\Hola\\words.txt" ) )
      .map( s -> s.trim() )
      .filter( s -> s.indexOf( '\'' ) < 0 && !s.isEmpty() )
      .forEach( rethrowConsumer( s -> {
        if ( Character.isUpperCase( s.charAt( 0 ) ) )
          names.put( s.toLowerCase(), s );
        else
          regular.add( s.toLowerCase() );
      } ) );
    Iterator< String > it = regular.iterator();
    while ( it.hasNext() ) {
      String s = it.next();
      String css = names.get( s );
      if ( css != null && ( css.length() == 1 || Character.isUpperCase( css.charAt( 1 ) ) ) )
        it.remove();
    }
    System.out.println( regular.size() );
    regular
      .stream()
      .filter( word -> word.startsWith( "necroman" ) )
      .map( word -> Pair.of( word,
        getPrefixes( prefixesList, word )
          .stream()
          .map( prefix -> Pair.of( prefix, word.substring( prefix.length() ) ) )
          .map( p -> Pair.of( p.getKey(),
            StreamSupport
              .stream( regular.getStringsEndingWith( p.getValue() ).spliterator(), false )
              .map( s -> s.substring( 0, s.length() - p.getValue().length() ) )
              .filter( s -> s.isEmpty() || prefixesList.contains( s ) )
              .count() + ( regular.contains( p.getValue() ) ? 1 : 0 ) ) )
                .map(p->{System.out.println(p);return p;})
          .sorted( ( p1, p2 ) -> then( Long.compare( p2.getValue(), p1.getValue() ),
                                       Integer.compare( p2.getKey().length(), p1.getKey().length() ) ) )
          .map( p -> p.getKey() )
          .findFirst()
          .orElse( "" ) ) )
      .map( p -> Pair.of( p.getValue(), p.getKey().substring( p.getValue().length() ) ) )
      .forEach( System.out::println );
  }
  
  public static void main0( String... args ) throws Exception {
    PatriciaTrie< String > names = new PatriciaTrie<>();
    PatriciaTrie< String > regular = new PatriciaTrie<>();
    Files
      .lines( Paths.get( "D:\\Hola\\words.txt" ) )
      .map( s -> s.trim() )
      .filter( s -> s.indexOf( '\'' ) < 0 && !s.isEmpty() )
      .forEach( rethrowConsumer( s -> {
        if ( Character.isUpperCase( s.charAt( 0 ) ) )
          names.put( s.toLowerCase(), s );
        else
          regular.put( s.toLowerCase(), s );
      } ) );
    Iterator< String > it = regular.keySet().iterator();
    while ( it.hasNext() ) {
      String s = it.next();
      if ( names.containsKey( s ) )
        it.remove();
    }
    PatriciaTrie< String > reversed = new PatriciaTrie<>();
    regular.keySet().stream().map( s -> Pair.of( reverse( s ), s ) ).forEach( p -> reversed.put( p.getKey(), p.getValue() ) );
    /*regular.keySet().stream().forEach( s -> {
      System.out.println( s + ": " + new Sentence( s ).lemma( 0 ) );
    } );*/
    PatriciaTrie< Integer > prefixes = new PatriciaTrie<>();
    for ( int i = 1; i < 16; i++ ) {
      final int ii = i;
      regular.keySet().stream().filter( s -> s.length() > ii ).map( s -> s.substring( 0, ii ) ).distinct().forEach( s -> prefixes.put( s, regular.prefixMap( s ).size() ) );
    }
    System.out.println( names.size() );
    System.out.println( regular.size() );
    Set< String > prefixesList = new TreeSet<>();
    prefixes.entrySet().stream()
      .map( e -> new StatsResult( e.getKey(), e.getValue(), regular.prefixMap( e.getKey() ).keySet().stream()
                                                              .map( w -> w.substring( e.getKey().length() ) )
                                                              .filter( w -> !w.isEmpty() && ( regular.containsKey( w ) || reversed.prefixMap( reverse( w ) ).size() > 2 ) )
                                                              .map( w -> Pair.of( w, null/*reversed.prefixMap( reverse( w ) ).values().stream().limit( 10 ).collect( Collectors.toList() )*/ ) ) ) )
      .filter( o -> o.contained > 50 && o.getPercent() > 35.0 )
      //.sorted( ( o1, o2 ) -> Double.compare( o1.getPercent(), o2.getPercent() ) )
      .forEach( o -> {
      prefixesList.add( o.word );
      System.out.println( o );
    } );
  }
  
  private static String reverse( String s ) {
    return new StringBuilder( s ).reverse().toString();
  }

  private static List< String > getPrefixes( DAWGSet prefixesList, String word ) {
    List< String > ret = new ArrayList<>();
    DAWGNode node = prefixesList.getSourceNode();
    int i = 1;
    for ( char c : word.toCharArray() ) {
      node = node.transition( c );
      if ( node == null )
        break;
      if ( node.isAcceptNode() )
        ret.add( word.substring( 0, i ) );
      i++;
    }
    return ret;
  }

  private static int then( int c1, int c2 ) {
    return c1 == 0 ? c2 : c1;
  }
  
  public static class StatsResult {
    public String word;
    public int all;
    public int contained;
    public List< Pair< String, List< String > > > examples = new ArrayList<>();

    public StatsResult( String word, int all, Stream< Pair< String, List< String > > > containedStream ) {
      this.word = word;
      this.all = all;
      if ( containedStream != null )
        containedStream.forEach( s -> {
          if ( examples.size() < 10 )
            examples.add( s );
          contained++;
        } );
    }
    
    public double getPercent() {
      return contained * 100.0 / all;
    }

    @Override
    public String toString() {
      return word + ": all=" + all + ", contained=" + contained + ", percent=" + getPercent() + ", examples: " + examples;
    }
  }
}