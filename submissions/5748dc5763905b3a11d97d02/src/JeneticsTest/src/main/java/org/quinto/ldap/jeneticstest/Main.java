package org.quinto.ldap.jeneticstest;

import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.BitSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;
import java.util.function.Consumer;
import java.util.function.Function;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.stream.Collectors;
import org.apache.commons.collections4.MultiSet;
import org.apache.commons.collections4.multiset.HashMultiSet;
import org.apache.commons.collections4.trie.PatriciaTrie;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.commons.math4.linear.Array2DRowRealMatrix;
import org.apache.commons.math4.linear.MatrixUtils;
import org.apache.commons.math4.linear.RealMatrix;
import org.jenetics.BitChromosome;
import org.jenetics.BitGene;
import org.jenetics.Chromosome;
import org.jenetics.GaussianMutator;
import org.jenetics.Genotype;
import org.jenetics.IntegerChromosome;
import org.jenetics.IntegerGene;
import org.jenetics.MultiPointCrossover;
import org.jenetics.Mutator;
import org.jenetics.Optimize;
import org.jenetics.Phenotype;
import org.jenetics.SinglePointCrossover;
import org.jenetics.SwapMutator;
import org.jenetics.engine.Engine;
import org.jenetics.engine.EvolutionResult;
import org.jenetics.engine.EvolutionStatistics;
import org.jenetics.stat.DoubleMomentStatistics;
import org.jenetics.util.Factory;
import org.json.simple.parser.JSONParser;
import org.quinto.dawg.ModifiableDAWGSet;
import static org.quinto.ldap.jeneticstest.LambdaExceptionUtil.rethrowConsumer;
import static org.quinto.ldap.jeneticstest.LambdaExceptionUtil.rethrowFunction;

public class Main {
  static List< Pair< String, Map< String, Boolean > > > list;
  static String suffixes[];
  static Set< String > words;
  static int mod = 500000;
  static int best[] = new int[]{ 390693 };
  
  public static void main( String... args ) throws Exception {
    JSONParser parser = new JSONParser();
    Set< String > pr = new TreeSet<>();
    Set< String > sf = new TreeSet<>();
    words = new TreeSet<>();
    list = Files.list( Paths.get( "D:\\hola\\output" ) ).limit( 5000 ).map( rethrowFunction( f -> new ImmutablePair< String, Map< String, Boolean > >( f.getFileName().toString(), ( Map< String, Boolean > )parser.parse( Files.lines( f ).collect( Collectors.joining() ) ) ) ) ).collect( Collectors.toList() );
    Files.lines( Paths.get( "D:\\Hola\\prefixes_def.txt" ) ).filter( s -> !s.isEmpty() ).forEach( pr::add );
    Files.lines( Paths.get( "D:\\Hola\\suffixes_def.txt" ) ).filter( s -> !s.isEmpty() ).forEach( sf::add );
    Files.lines( Paths.get( "D:\\Hola\\words.txt" ) )
         .map( s -> s.toLowerCase().trim() )
         .filter( s -> s.length() > 2 && s.length() < 17 && s.indexOf( '\'' ) < 0 )
         .forEach( words::add );
    suffixes = sf.toArray( new String[ sf.size() ] );
    BitSet set = new BitSet( suffixes.length );
    Set< String > etalon = Files.lines( Paths.get( "D:\\Hola\\suffixes_best.txt" ) ).filter( s -> !s.isEmpty() ).collect( Collectors.toSet() );
    for ( int i = 0; i < suffixes.length; i++ )
      if ( etalon.contains( suffixes[ i ] ) )
        set.set( i );
    Factory< Genotype< BitGene > > gtf = Genotype.of( BitChromosome.of( set, suffixes.length ), BitChromosome.of( suffixes.length, 0.1 ), BitChromosome.of( suffixes.length ) );
    
    Engine< BitGene, Integer > engine = Engine
      .builder( gt -> calc( gt ), gtf )
      .optimize( Optimize.MAXIMUM )
      //.alterers( new MultiPointCrossover<>( 0.2, 3 ), new Mutator<>( 0.3 ) )
      .build();
    
    Consumer< ? super EvolutionResult< BitGene, Integer > > statistics = EvolutionStatistics.ofNumber();
    
    EvolutionResult< BitGene, Integer > result = engine
      .stream()
      .limit( 50000 )
      .peek( statistics )
      .collect( EvolutionResult.toBestEvolutionResult() );
    System.out.println( statistics );
    //System.out.println( result.getBestPhenotype() );
    System.out.println( calc( result.getBestPhenotype().getGenotype() ) );
    System.out.println( result.getBestPhenotype().getFitness() );
  }
  
  private static int calc( Genotype< BitGene > gt ) {
    Chromosome< BitGene > ch = gt.getChromosome();
    Set< String > suffixesList = new HashSet<>();
    for ( int i = 0; i < ch.length(); i++ ) {
      BitGene gene = ch.getGene( i );
      if ( gene.booleanValue() )
        suffixesList.add( suffixes[ i ] );
    }
    return calc( suffixesList );
  }
  
  private static int calc( Set< String > suffixesList ) {
    Bloom bloom = new Bloom( mod, s -> s.chars().reduce( 0, ( r, v ) -> r * 31 + v ) );
    words.stream()
         .map( s -> cutStem( s, suffixesList ) )
         .filter( s -> !s.isEmpty() )
         .forEach( bloom::add );
    int sum = list.stream().parallel().mapToInt( p -> {
      Map< String, Boolean > m = p.getRight();
      int res = 0;
      for ( Map.Entry< String, Boolean > e : m.entrySet() ) {
        String word = e.getKey();
        boolean result = e.getValue();
        if ( test( word, suffixesList, bloom ) == result )
          res++;
      }
      return res;
    } ).sum();
    if ( sum > best[ 0 ] ) {
      synchronized ( Main.class ) {
        if ( sum > best[ 0 ] ) {
          best[ 0 ] = sum;
          System.out.println( "Found better: " + sum );
          try {
            Files.write( Paths.get( "D:\\Hola\\suffixes_genetics.txt" ), suffixesList.stream().sorted().collect( Collectors.toList() ), StandardCharsets.UTF_8 );
            Files.write( Paths.get( "D:\\Hola\\suffixes_genetics_value.txt" ), Arrays.asList( String.valueOf( sum ) ), StandardCharsets.UTF_8 );
          } catch ( IOException e ) {
            e.printStackTrace();
          }
        }
      }
    }
    return sum;
  }
  
  static boolean test( String word, Set< String > suffixesList, Bloom bloom ) {
    if ( word.endsWith( "'s" ) )
      word = word.substring( 0, word.length() - 2 );
    if ( word.indexOf( '\'' ) >= 0 )
      return false;
    if ( word.length() < 3 )
      return true;
    if ( word.length() > 16 )
      return false;
    word = cutStem( word, suffixesList );
    return word.isEmpty() || bloom.test( word );
  }
      
  private static boolean in( char c, char... cs ) {
    for ( char cc : cs )
      if ( cc == c )
        return true;
    return false;
  }
      
  private static String cutStem( String word, Set< String > suffixesList ) {
    while ( true ) {
      boolean cut = false;
      char text[] = word.toCharArray();
      for ( int i = 0; i < text.length; i++ ) {
        String suffix = String.valueOf( text, i, text.length - i );
        if ( suffixesList.contains( suffix ) ) {
          word = String.valueOf( text, 0, i - ( i > 1 && text[ i - 1 ] == text[ i - 2 ] && in( text[ i - 1 ], 'd', 'g', 'b', 'f', 'l', 'm', 'n', 'p', 'r', 't' ) ? 1 : 0 ) );
          cut = true;
          break;
        }
      }
      if ( !cut )
        break;
    }
  /*  while ( true ) {
      boolean cut = false;
      char text[] = word.toCharArray();
      for ( int i = text.length; i > 0; i-- ) {
        String prefix = String.valueOf( text, 0, i );
        if ( prefixesList.containsKey( prefix ) ) {
          word = String.valueOf( text, i, text.length - i );
          cut = true;
          break;
        }
      }
      if ( !cut )
        break;
    }*/
    return word;
  }
  
  private static class Bloom {
    private final int size;
    private final BitSet data;
    private final Function< String, Integer > hash[];
    
    public Bloom( int size, Function< String, Integer >... hash ) {
      this.hash = hash;
      this.size = size;
      data = new BitSet( size );
    }
    
    public void add( String word ) {
      for ( Function< String, Integer > h : hash )
        data.set( mod( h.apply( word ), size ) );
    }
    
    public boolean test( String word ) {
      for ( Function< String, Integer > h : hash )
        if ( !data.get( mod( h.apply( word ), size ) ) )
          return false;
      return true;
    }
  }
  
  private static int mod( int v, int m ) {
    v %= m;
    if ( v < 0 )
      v += m;
    return v;
  }
  
  public static void main2( String... args ) throws Exception {
    ModifiableDAWGSet trueWords = Files
      .lines( Paths.get( "D:\\Hola\\words.txt" ) )
      .map( s -> s.trim().toLowerCase() )
      .filter( s -> !s.isEmpty() && s.indexOf( '\'' ) < 0 && s.length() < 17 )
      .distinct()
      .sorted()
      .collect( Collectors.toCollection( ModifiableDAWGSet::new ) );
    System.out.println( trueWords.size() );
    MultiSet< String > suffixes = new HashMultiSet<>();
    int cnt = 0;
    for ( String s : trueWords.getStringsEndingWith( "ia" ) ) {
      cnt++;
      for ( String w : trueWords.getStringsStartingWith( s.substring( 0, s.length() - 2 ) ) ) {
        suffixes.add( w.substring( s.length() - 2 ) );
      }
    }
    System.out.println( cnt );
    suffixes.entrySet().stream().sorted( ( e1, e2 ) -> Integer.compare( e2.getCount(), e1.getCount() ) ).limit( 20 ).forEach( System.out::println );
    System.out.println( suffixes.getCount( "iac" ) );
  }
  
  public static void main1( String... args ) throws Exception {
    List< String > trueWords = Files
      .lines( Paths.get( "D:\\Hola\\words.txt" ) )
      .map( s -> s.trim().toLowerCase() )
      .filter( s -> !s.isEmpty() && s.indexOf( '\'' ) < 0 && s.length() < 17 )
      .distinct()
      .sorted()
      .collect( Collectors.toList() );
    List< String > falseWords = Files
      .lines( Paths.get( "D:\\HolaTests\\words_map.txt" ) )
      .map( s -> s.trim().toLowerCase() )
      .filter( s -> !s.isEmpty() && s.indexOf( '\'' ) < 0 && s.length() < 17 )
      .distinct()
      .sorted()
      .collect( Collectors.toList() );
    for ( int len = 1; len < 17; len++ ) {
      final int llen = len;
      List< String > tw = trueWords
        .stream()
        .filter( s -> s.length() == llen )
        .collect( Collectors.toList() );
      int size = tw.size();
      List< String > fw = falseWords
        .stream()
        .filter( s -> s.length() == llen )
        //.limit( size )
        .collect( Collectors.toList() );
      System.out.println( llen + ": " + size + " / " + fw.size() );
      tw.addAll( fw );
      List< double[] > m = tw
        .stream()
        .map( s -> s.chars().asDoubleStream().map( c -> func( c ) ).toArray() )
        .collect( Collectors.toList() );
      double md[][] = m.toArray( new double[ m.size() ][ llen ] );
      RealMatrix a = MatrixUtils.createRealMatrix( md );
      double res[] = new double[ m.size() ];
      Arrays.fill( res, 0, size, 1000.0 );
      RealMatrix b = MatrixUtils.createColumnRealMatrix( res );
      RealMatrix at = a.transpose();
      RealMatrix x = MatrixUtils.inverse( at.multiply( a ) ).multiply( at ).multiply( b );
      System.out.println( a.multiply( x ).subtract( b ).getFrobeniusNorm() / Math.sqrt( m.size() ) );
      System.out.println( x );
      MoreDoubleSummaryStatistics stats = fw.stream()
        .map( s -> Pair.of( s, s.chars().asDoubleStream().map( c -> func( c ) ).toArray() ) )
        .map( d -> Pair.of( d.getKey(), MatrixUtils.createRowRealMatrix( d.getValue() ) ) )
        .map( d -> Pair.of( d.getKey(), d.getValue().multiply( x ).getEntry( 0, 0 ) ) )
        .mapToDouble( d -> d.getValue() )
        .collect( MoreDoubleSummaryStatistics::new, MoreDoubleSummaryStatistics::accept, MoreDoubleSummaryStatistics::combine );
      System.out.println( "false: " + stats );
      stats = tw.stream()
        .limit( size )
        .map( s -> Pair.of( s, s.chars().asDoubleStream().map( c -> func( c ) ).toArray() ) )
        .map( d -> Pair.of( d.getKey(), MatrixUtils.createRowRealMatrix( d.getValue() ) ) )
        .map( d -> Pair.of( d.getKey(), d.getValue().multiply( x ).getEntry( 0, 0 ) ) )
        .mapToDouble( d -> d.getValue() )
        .collect( MoreDoubleSummaryStatistics::new, MoreDoubleSummaryStatistics::accept, MoreDoubleSummaryStatistics::combine );
      System.out.println( "true: " + stats );
    }
  }
  
  private static final double primes[] = { 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101 };
  
  public static double func( double n ) {
    return primes[ ( int )( n - 97.0 ) ];
  }
  
  public static void main0( String... args ) throws Exception {
    ArrayList< String > words = ( ArrayList< String > )Files
      .lines( Paths.get( args.length == 0 ? "D:\\Hola\\words.txt" : args[ 0 ] ) )
      //.lines( Paths.get( "D:\\compress\\words_short.txt" ) )
      .map( s -> s.trim().toLowerCase() )
      .filter( s -> !s.isEmpty() && s.indexOf( '\'' ) < 0 && s.length() < 17 )
      .distinct()
      .sorted()
      .limit( args.length <= 1 ? 1000000 : Integer.parseInt( args[ 1 ] ) )
      .collect( Collectors.toList() );
    System.out.println( words.size() );
    
    List< IntegerChromosome > chromosomes = words
      .stream()
      //.peek( s -> System.out.println( ( s.length() + 1 ) * ( s.length() + 2 ) / 2 - 1 ) )
      .map( s -> IntegerChromosome.of( 0, ( s.length() + 1 ) * ( s.length() + 2 ) / 2 - 1 ) )
      .collect( Collectors.toList() );
    //System.out.println( chromosomes );
    
    Factory< Genotype< IntegerGene > > gtf = Genotype.of( chromosomes );
    chromosomes.clear();

    Engine< IntegerGene, Integer > engine = Engine
      .builder( gt -> new Solution( gt, words, false ).commonSize(), gtf )
      .optimize( Optimize.MINIMUM )
      .alterers( new MultiPointCrossover<>( 0.2, 3 ),
                 new GaussianMutator<>( 0.2 ) )
      .populationSize( 50 )
      .maximalPhenotypeAge( 70L )
      .build();
    
    Consumer< ? super EvolutionResult< IntegerGene, Integer > > statistics = EvolutionStatistics.ofNumber();

    EvolutionResult< IntegerGene, Integer > result = engine
      .stream()
      .limit( 6 )
      .peek( statistics )
      .collect( EvolutionResult.toBestEvolutionResult() );
    System.out.println( statistics );
    //System.out.println( result.getBestPhenotype() );
    System.out.println( new Solution( result.getBestPhenotype().getGenotype(), words, true ) );
    System.out.println( result.getBestPhenotype().getFitness() + " / " + words.stream().mapToInt( s -> s.length() ).sum() );
  }

  private static class Solution {
    Set< String > prefixes = new HashSet<>();
    Set< String > roots = new HashSet<>();
    Set< String > postfixes = new HashSet<>();

    public Solution( Genotype< IntegerGene > gt, ArrayList< String > words, boolean finalOne ) {
      int length = gt.length();
      for ( int i = 0; i < length; i++ ) {
        IntegerChromosome chromosome = ( IntegerChromosome )gt.getChromosome( i );
        int pos = chromosome.intValue();
        int max = chromosome.getMax();
        String word = words.get( i );
        int len = word.length();
        int preLen = len - ( int )( ( Math.sqrt( ( max - pos ) * 8 + 1 ) - 1.0 ) / 2.0 );
        int postLen = ( len * 2 - preLen + 2 ) * ( preLen + 1 ) / 2 - 1 - pos;
        String prefix = word.substring( 0, preLen );
        String root = word.substring( preLen, len - postLen );
        String postfix = word.substring( len - postLen );
        if ( finalOne )
          System.out.println( prefix + '-' + root + '-' + postfix );
        prefixes.add( prefix );
        roots.add( root );
        postfixes.add( postfix );
      }
    }
    
    public int commonSize() {
      return ( prefixes.stream().mapToInt( s -> s.length() ).sum() +
               postfixes.stream().mapToInt( s -> s.length() ).sum() ) / 6 +
             roots.size() / 8;
     // return prefixes.size() + roots.size() + postfixes.size();
    }

    @Override
    public String toString() {
      return "prefixes( " + prefixes.size() + " ) = " + prefixes.stream().limit( 100 ).collect( Collectors.joining( ", " ) ) + '\n'
           + "roots( " + roots.size() + " ) = " + roots.stream().limit( 100 ).collect( Collectors.joining( ", " ) ) + '\n'
           + "postfixes( " + postfixes.size() + " ) = " + postfixes.stream().limit( 100 ).collect( Collectors.joining( ", " ) );
    }
  }
}