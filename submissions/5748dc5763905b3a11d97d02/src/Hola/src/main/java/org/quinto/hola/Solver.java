package org.quinto.hola;

import edu.stanford.nlp.process.Stemmer;
import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStreamReader;
import java.math.BigInteger;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.BitSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.IntSummaryStatistics;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.NavigableSet;
import java.util.Random;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.function.Function;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import org.apache.commons.codec.EncoderException;
import org.apache.commons.codec.StringEncoder;
import org.apache.commons.codec.digest.Md5Crypt;
import org.apache.commons.codec.language.Caverphone1;
import org.apache.commons.codec.language.Caverphone2;
import org.apache.commons.codec.language.ColognePhonetic;
import org.apache.commons.codec.language.DaitchMokotoffSoundex;
import org.apache.commons.codec.language.DoubleMetaphone;
import org.apache.commons.codec.language.MatchRatingApproachEncoder;
import org.apache.commons.codec.language.Metaphone;
import org.apache.commons.codec.language.Nysiis;
import org.apache.commons.codec.language.RefinedSoundex;
import org.apache.commons.codec.language.Soundex;
import org.apache.commons.codec.language.bm.BeiderMorseEncoder;
import org.apache.commons.codec.net.BCodec;
import org.apache.commons.codec.net.QCodec;
import org.apache.commons.codec.net.QuotedPrintableCodec;
import org.apache.commons.codec.net.URLCodec;
import org.apache.commons.collections4.MultiSet;
import org.apache.commons.collections4.multiset.HashMultiSet;
import org.apache.commons.collections4.trie.PatriciaTrie;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.tuple.ImmutablePair;
import org.apache.commons.lang3.tuple.Pair;
import org.apache.commons.lang3.tuple.Triple;
import org.json.simple.parser.JSONParser;
import org.quinto.dawg.CompressedDAWGSet;
import org.quinto.dawg.DAWGSet;
import org.quinto.dawg.ModifiableDAWGSet;
import static org.quinto.hola.LambdaExceptionUtil.rethrowFunction;

public class Solver {
  private static final StringEncoder ENCODERS[] = new StringEncoder[] {
   /* new BCodec( StandardCharsets.UTF_8 ),
    new BeiderMorseEncoder(),
    new Caverphone1(),
    new Caverphone2(),
    new ColognePhonetic(),
    new DaitchMokotoffSoundex( false ),
    new DoubleMetaphone(),
    new MatchRatingApproachEncoder(),
    new Metaphone(),
    new Nysiis(),*/
    new QCodec( StandardCharsets.UTF_8 ),
  /*  new QuotedPrintableCodec( StandardCharsets.UTF_8 ),
    new RefinedSoundex(),
    new Soundex(),*/
    new URLCodec(),
    new SaltCodec( "LengthA", s -> "", s -> String.valueOf( s.length() ) ),
    new SaltCodec( "LengthAB", s -> String.valueOf( s.length() ), s -> String.valueOf( s.length() ) ),
    new SaltCodec( "HashA", s -> "", s -> String.valueOf( s.hashCode() ) ),
    new SaltCodec( "HashAB", s -> String.valueOf( s.hashCode() ), s -> String.valueOf( s.hashCode() ) ),
    new SaltCodec( "HashLength", s -> String.valueOf( s.hashCode() ), s -> String.valueOf( s.length() ) ),
    new SaltCodec( "LengthHash", s -> String.valueOf( s.length() ), s -> String.valueOf( s.hashCode() ) )
  };
  public static final Strategy strategies[] = new Strategy[ StrategyEnum.values().length + 1 + ENCODERS.length ];
  private static final PatriciaTrie< Word > otrie = new PatriciaTrie<>();
  
  static {
    int i = 0;
    for ( Strategy s : StrategyEnum.values() )
      strategies[ i++ ] = s;
    strategies[ i++ ] = new CutBloomStrategy();
    for ( StringEncoder encoder : ENCODERS ) {
      strategies[ i++ ] = new EncoderStrategy( encoder );
    }
  }
  
  private static class SaltCodec implements StringEncoder {
    private final Function< String, String > before;
    private final Function< String, String > after;
    private final String name;
    
    public SaltCodec( String name, Function< String, String > before, Function< String, String > after ) {
      this.name = name;
      this.before = before;
      this.after = after;
    }
    
    @Override
    public String encode( String source ) throws EncoderException {
      return before.apply( source ) + source + after.apply( source );
    }

    @Override
    public Object encode( Object source ) throws EncoderException {
      return encode( String.valueOf( source ) );
    }

    public String getName() {
      return name;
    }
  }
  
  public static void main1( String... args ) throws Exception {
   // research();
   /* CutBloomStrategy.init();
    if ( true )
      return;*/
    JSONParser parser = new JSONParser();
    List< Result > results = new ArrayList<>();
    Files.list( Paths.get( "D:\\hola\\output" ) ).limit( 5000 ).map( rethrowFunction( f -> new ImmutablePair< String, Map< String, Boolean > >( f.getFileName().toString(), ( Map< String, Boolean > )parser.parse( Files.lines( f ).collect( Collectors.joining() ) ) ) ) ).forEach( p -> {
      Result test = new Result();
      test.name = p.getLeft();
      Map< String, Boolean > m = p.getRight();
      for ( int i = 0; i < strategies.length; i++ ) {
        Strategy strategy = strategies[ i ];
        int res = 0;
        int fp = 0;
        int fn = 0;
        for ( Map.Entry< String, Boolean > e : m.entrySet() ) {
          String word = e.getKey();
          boolean result = e.getValue();
          if ( strategy.test( word ) == result )
            res++;
          else if ( result )
            fn++;
          else
            fp++;
        }
        test.score[ i ] = res;
        test.fp[ i ] = fp;
        test.fn[ i ] = fn;
      }
      results.add( test );
     // print( test.name, test.score );
    } );
    int counts[] = new int[ strategies.length ];
    int sums[] = new int[ strategies.length ];
    int fp[] = new int[ strategies.length ];
    int fn[] = new int[ strategies.length ];
    int maxs[] = new int[ strategies.length ];
    int mins[] = new int[ strategies.length ];
    int avgs[] = new int[ strategies.length ];
    int avgsLow[] = new int[ strategies.length ];
    int avgsHigh[] = new int[ strategies.length ];
    for ( int i = 0; i < strategies.length; i++ ) {
      final int ii = i;
      MoreIntSummaryStatistics stats = results.stream().mapToInt( r -> r.score[ ii ] ).collect( MoreIntSummaryStatistics::new, MoreIntSummaryStatistics::accept, MoreIntSummaryStatistics::combine );
      counts[ i ] = ( int )stats.getCount();
      sums[ i ] = ( int )stats.getSum();
      maxs[ i ] = stats.getMax();
      mins[ i ] = stats.getMin();
      avgs[ i ] = ( int )stats.getAverage();
      int std = ( int )stats.stdDev();
      avgsLow[ i ] = avgs[ i ] - std;
      avgsHigh[ i ] = avgs[ i ] + std;
      fp[ i ] = results.stream().mapToInt( r -> r.fp[ ii ] ).sum();
      fn[ i ] = results.stream().mapToInt( r -> r.fn[ ii ] ).sum();
    }
    print( "max", maxs );
    print( "high", avgsHigh );
    print( "avg", avgs );
    print( "low", avgsLow );
    print( "min", mins );
    print( "sum", sums );
    print( "fp", fp );
    print( "fn", fn );
    int i = 0;
    while ( true ) {
      System.out.print( StringUtils.leftPad( "", 23 ) );
      boolean existsFilled = false;
      for ( Strategy strategy : strategies ) {
        System.out.print( "  " );
        char c = ' ';
        if ( strategy.getName().length() > i ) {
          c = strategy.getName().charAt( i );
          existsFilled = true;
        }
        System.out.print( StringUtils.leftPad( String.valueOf( c ), 7 ) );
      }
      System.out.println();
      if ( !existsFilled )
        break;
      i++;
    }
  }
  
  private static void print( String label, int scoreArray[] ) {
    System.out.print( StringUtils.leftPad( label, 23 ) );
    boolean first = true;
    for ( int score : scoreArray ) {
      System.out.print( first ? ": " : ", " );
      first = false;
      System.out.print( StringUtils.leftPad( String.valueOf( score ), 7 ) );
    }
    System.out.println();
  }
  
  private static class Result {
    public String name;
    public int score[] = new int[ strategies.length ];
    public int fp[] = new int[ strategies.length ];
    public int fn[] = new int[ strategies.length ];
  }
  
  private static enum StrategyEnum implements Strategy {
    ALWAYS_TRUE() {
      @Override
      public boolean test( String word ) {
        return true;
      }
    },
    ALWAYS_FALSE() {
      @Override
      public boolean test( String word ) {
        return false;
      }
    },
    RANDOM() {
      private final Random r = new Random( System.nanoTime() );
      
      @Override
      public boolean test( String word ) {
        return r.nextBoolean();
      }
    },
    PERFECT() {
      private final PatriciaTrie< Word > trie = new PatriciaTrie<>();
      
      {
        try {
          Files.lines( Paths.get( "D:\\Hola\\words.txt" ) ).map( s -> s.toLowerCase().trim() ).filter( s -> !s.isEmpty() ).forEach( s -> trie.put( s, new Word( s ) ) );
          System.out.println( "perfect: " + trie.size() );
        } catch ( IOException e ) {
          e.printStackTrace();
        }
      }
      
      @Override
      public boolean test( String word ) {
        return trie.containsKey( word );
      }
    },
    STEMMED() {
      private final Stemmer stemmer = new Stemmer();
      private final PatriciaTrie< Word > trie = new PatriciaTrie<>();
      
      {
        try {
          Files.lines( Paths.get( "D:\\Hola\\words.txt" ) ).map( s -> s.toLowerCase().trim() ).filter( s -> s.indexOf( '\'' ) < 0 ).map( s -> stemmer.stem( s ) ).forEach( s -> {
            trie.put( s, new Word( s ) );
          } );
          System.out.println( "stemmed: " + trie.size() );
        } catch ( IOException e ) {
          e.printStackTrace();
        }
      }
      
      @Override
      public boolean test( String word ) {
        if ( word.endsWith( "'s" ) )
          word = word.substring( 0, word.length() - 2 );
        if ( word.indexOf( '\'' ) >= 0 )
          return false;
        if ( word.length() < 3 )
          return true;
        if ( word.length() > 16 )
          return false;
        return trie.containsKey( stemmer.stem( word ) );
      }
    },
    CUT() {
      private final PatriciaTrie< String > trie = new PatriciaTrie<>();
      private final Set< String > prefixesList = new TreeSet<>();
      private final Set< String > suffixesList = new TreeSet<>();
      
      {
        try {
          if ( false ) {
            ModifiableDAWGSet words = new ModifiableDAWGSet();
            Files
              .lines( Paths.get( "D:\\Hola\\words.txt" ) )
              .map( s -> s.toLowerCase().trim() )
              .filter( s -> s.length() > 2 && s.length() < 17 && s.indexOf( '\'' ) < 0 )
              .distinct()
              .sorted()
              .forEach( words::add );
            PatriciaTrie< Integer > prefixes = new PatriciaTrie<>();
            for ( int i = 1; i < 16; i++ ) {
              final int ii = i;
              words.stream().filter( s -> s.length() > ii ).map( s -> s.substring( 0, ii ) ).distinct().forEach( s -> prefixes.put( s, words.prefixSet( s ).size() ) );
            }
            ModifiableDAWGSet reversedWords = new ModifiableDAWGSet();
            words.stream().map( s -> reverse( s ) ).forEach( reversedWords::add );
            prefixes.entrySet().stream().map( e -> new StatsResult( e.getKey(), e.getValue(), words.prefixSet( e.getKey() ).stream().map( w -> Pair.of( w, w.substring( e.getKey().length() ) ) ).filter( p -> words.contains( p.getValue() ) || containsAtLeast( reversedWords.getStringsStartingWith( reverse( p.getValue() ) ), 2, reverse( p.getKey() ) ) ).map( p -> p.getValue() ) ) ).filter( o -> o.contained > 50 && o.getPercent() > 35.0 && words.contains( o.word ) ).sorted( ( o1, o2 ) -> Double.compare( o1.getPercent(), o2.getPercent() ) ).map( o -> o.word )
              //.limit( 2047L )
              .forEach( prefixesList::add );
            System.out.println( prefixesList );
            System.out.println( prefixesList.size() );
            PatriciaTrie< Integer > suffixes = new PatriciaTrie<>();
            for ( int i = 1; i < 16; i++ ) {
              final int ii = i;
              reversedWords.stream().filter( s -> s.length() > ii ).map( s -> s.substring( 0, ii ) ).distinct().forEach( s -> suffixes.put( s, reversedWords.prefixSet( s ).size() ) );
            }
            suffixes.entrySet().stream().map( e -> new StatsResult( e.getKey(), e.getValue(), reversedWords.prefixSet( e.getKey() ).stream().map( w -> Pair.of( w, w.substring( e.getKey().length() ) ) ).filter( p -> reversedWords.contains( p.getValue() ) || containsAtLeast( words.getStringsStartingWith( reverse( p.getValue() ) ), 2, reverse( p.getKey() ) ) ).map( p -> p.getValue() ) ) ).filter( o -> o.contained > 50 && o.getPercent() > 35.0 ).sorted( ( o1, o2 ) -> Double.compare( o1.getPercent(), o2.getPercent() ) ).map( o -> reverse( o.word ) )
              //.limit( 4095L )
              .forEach( suffixesList::add );
            System.out.println( suffixesList );
            System.out.println( suffixesList.size() );
            Files.write( Paths.get( "D:\\Hola\\prefixes.txt" ), prefixesList, StandardCharsets.UTF_8 );
            Files.write( Paths.get( "D:\\Hola\\suffixes.txt" ), suffixesList, StandardCharsets.UTF_8 );
            words
              .stream()
              .map( s -> cutStem( s ) )
              .filter( s -> !s.isEmpty() )
              .forEach( s -> {
              trie.put( s, s );
            } );
            Files.write( Paths.get( "D:\\Hola\\roots.txt" ), trie.keySet(), StandardCharsets.UTF_8 );
          }
          Files.lines( Paths.get( "D:\\Hola\\prefixes.txt" ) ).forEach( prefixesList::add );
          Files.lines( Paths.get( "D:\\Hola\\suffixes.txt" ) ).forEach( suffixesList::add );
          Files.lines( Paths.get( "D:\\Hola\\roots.txt" ) ).forEach( s -> trie.put( s, s ) );
          System.out.println( "cutStem: " + trie.size() );
        } catch ( IOException e ) {
          e.printStackTrace();
        }
      }
      
      private int getCount( DAWGSet set, String suffix ) {
        int cnt = 0;
        for ( String s : set.getStringsEndingWith( suffix ) )
          cnt++;
        return cnt;
      }
      
      private Stream< String > suffixStream( DAWGSet set, String suffix ) {
        return StreamSupport.stream( set.getStringsEndingWith( suffix ).spliterator(), false );
      }
      
      private String cutStem( String word ) {
        while ( true ) {
          boolean cut = false;
          char text[] = word.toCharArray();
          for ( int i = 0; i < text.length; i++ ) {
            String suffix = String.valueOf( text, i, text.length - i );
            if ( suffixesList.contains( suffix ) ) {
              word = String.valueOf( text, 0, i - ( i > 1 && text[ i - 1 ] == text[ i - 2 ] ? 1 : 0 ) );
              cut = true;
              break;
            }
          }
          if ( !cut )
            break;
        }
        while ( true ) {
          boolean cut = false;
          char text[] = word.toCharArray();
          for ( int i = text.length; i > 0; i-- ) {
            String prefix = String.valueOf( text, 0, i );
            if ( prefixesList.contains( prefix ) ) {
              word = String.valueOf( text, i, text.length - i );
              cut = true;
              break;
            }
          }
          if ( !cut )
            break;
        }
        return word;
      }
      
      @Override
      public boolean test( String word ) {
        if ( word.endsWith( "'s" ) )
          word = word.substring( 0, word.length() - 2 );
        if ( word.indexOf( '\'' ) >= 0 )
          return false;
        if ( word.length() < 3 )
          return true;
        if ( word.length() > 16 )
          return false;
        word = cutStem( word );
        return word.isEmpty() || trie.containsKey( word );
      }

      private boolean containsAtLeast( Iterable< String > i, int size, String deniedPrefix ) {
        if ( size <= 0 )
          return true;
        Iterator< String > it = i.iterator();
        while ( it.hasNext() ) {
          String s = it.next();
          if ( !s.startsWith( deniedPrefix ) ) {
            size--;
            if ( size <= 0 )
              return true;
          }
        }
        return false;
      }
    },
    BLOOM() {
      private int mod = 500000;
      private Bloom bloom = new Bloom( mod, s -> s.chars().reduce( 0, ( r, v ) -> r * 31 + v ) );
      
      {
        try {
          Files
            .lines( Paths.get( "D:\\Hola\\words.txt" ) )
            .map( s -> s.toLowerCase().trim() )
            .filter( s -> s.length() > 2 && s.length() < 17 && s.indexOf( '\'' ) < 0 )
            .distinct()
            .sorted()
            .forEach( bloom::add );
        } catch ( IOException e ) {
          e.printStackTrace();
        }
      }
      
      @Override
      public boolean test( String word ) {
        if ( word.endsWith( "'s" ) )
          word = word.substring( 0, word.length() - 2 );
        if ( word.indexOf( '\'' ) >= 0 )
          return false;
        if ( word.length() < 3 )
          return true;
        if ( word.length() > 16 )
          return false;
        return bloom.test( word );
      }
    },
    STEMMED_BLOOM() {
      private final Stemmer stemmer = new Stemmer();
      private int mod = 500000;
      private Bloom bloom = new Bloom( mod, s -> s.chars().reduce( 0, ( r, v ) -> r * 31 + v ) );
      
      {
        try {
          Files
            .lines( Paths.get( "D:\\Hola\\words.txt" ) )
            .map( s -> s.toLowerCase().trim() )
            .filter( s -> s.length() > 2 && s.length() < 17 && s.indexOf( '\'' ) < 0 )
            .map( s -> stemmer.stem( s ) )
            .filter( s -> !s.isEmpty() )
            .distinct()
            .sorted()
            .forEach( bloom::add );
        } catch ( IOException e ) {
          e.printStackTrace();
        }
      }
      
      @Override
      public boolean test( String word ) {
        if ( word.endsWith( "'s" ) )
          word = word.substring( 0, word.length() - 2 );
        if ( word.indexOf( '\'' ) >= 0 )
          return false;
        if ( word.length() < 3 )
          return true;
        if ( word.length() > 16 )
          return false;
        return bloom.test( stemmer.stem( word ) );
      }
    },
    STATS_BLOOM() {
      private final Random r = new Random( System.nanoTime() );
      private final Stemmer stemmer = new Stemmer();
      private int mod = 500000;
      private Bloom bloom = new Bloom( mod, s -> s.chars().reduce( 0, ( r, v ) -> r * 31 + v ) );
      private int all;
      private int rt;
      
      {
        try {
          Files
            .lines( Paths.get( "D:\\Hola\\words.txt" ) )
            .map( s -> s.toLowerCase().trim() )
            .filter( s -> s.length() > 2 && s.length() < 17 && s.indexOf( '\'' ) < 0 )
            .map( s -> stemmer.stem( s ) )
            .filter( s -> !s.isEmpty() )
            .distinct()
            .sorted()
            .forEach( bloom::add );
        } catch ( IOException e ) {
          e.printStackTrace();
        }
      }
      
      @Override
      public boolean test( String word ) {
        if ( all < 100 )
          all++;
        else
          all = rt = 0;
        if ( word.endsWith( "'s" ) )
          word = word.substring( 0, word.length() - 2 );
        if ( word.indexOf( '\'' ) >= 0 )
          return false;
        if ( word.length() < 3 ) {
          rt++;
          return true;
        }
        if ( word.length() > 16 )
          return false;
        if ( !bloom.test( stemmer.stem( word ) ) )
          return false;
        rt++;
        return rt <= 69;
      }
    },
    CUT_BLOOM() {
      private final Map< String, String > stemsList = new TreeMap<>();
      private final Map< String, String > rootsList = new TreeMap<>();
      private final Map< String, Integer > prefixesList = new TreeMap<>();
      private final Map< String, Integer > suffixesList = new TreeMap<>();
      private final Stemmer stemmer = new Stemmer();
      private int mod = 500000;
      private final int m[] = new int[ 12 ];
      private Bloom bloom = new Bloom( mod, s -> s.chars().reduce( 0, ( r, v ) -> r * 31 + v ) );
      
      {
        try {
          int c[] = new int[]{ 1 };
          Files.lines( Paths.get( "D:\\Hola\\prefixes_def.txt" ) ).peek( s -> { if ( s.isEmpty() ) c[ 0 ] = 0; } ).filter( s -> c[ 0 ] == 1 ).forEachOrdered( w -> prefixesList.put( w, 0 ) );
          c[ 0 ] = 1;
          Files.lines( Paths.get( "D:\\Hola\\suffixes_def.txt" ) ).peek( s -> { if ( s.isEmpty() ) c[ 0 ] = 0; } ).filter( s -> c[ 0 ] == 1 ).forEachOrdered( w -> suffixesList.put( w, 0 ) );
          c[ 0 ] = 1;
          System.out.println( "prefixesList: " + prefixesList.size() );//386640
          System.out.println( "suffixesList: " + suffixesList.size() );
          Files
            .lines( Paths.get( "D:\\Hola\\words.txt" ) )
            .map( s -> s.toLowerCase().trim() )
            .filter( s -> s.length() > 2 && s.length() < 17 && s.indexOf( '\'' ) < 0 )
            .map( s -> Pair.of( cutStem( s ), s ) )
            .filter( s -> !s.getKey().isEmpty() )
            .collect( Collectors.groupingBy( s -> s.getKey(), Collectors.mapping( s -> s.getValue(), Collectors.minBy( String::compareTo ) ) ) )
            .entrySet()
            .stream()
            .sorted( ( s1, s2 ) -> s1.getKey().compareTo( s2.getKey() ) )
            .forEachOrdered( w -> rootsList.put( w.getKey(), w.getValue().get() ) );
          c[ 0 ] = 1;
          Files
            .lines( Paths.get( "D:\\Hola\\words.txt" ) )
            .map( s -> s.toLowerCase().trim() )
            .filter( s -> s.length() > 2 && s.length() < 17 && s.indexOf( '\'' ) < 0 )
            .map( s -> Pair.of( stemmer.stem( s ), s ) )
            .filter( s -> !s.getKey().isEmpty() )
            .collect( Collectors.groupingBy( s -> s.getKey(), Collectors.mapping( s -> s.getValue(), Collectors.minBy( String::compareTo ) ) ) )
            .entrySet()
            .stream()
            .sorted( ( s1, s2 ) -> s1.getKey().compareTo( s2.getKey() ) )
            .forEachOrdered( w -> stemsList.put( w.getKey(), w.getValue().get() ) );
          System.out.println( "rootsList: " + rootsList.size() );
          rootsList.keySet().stream().forEach( bloom::add );
         /* System.out.println("CB baglieaniabbl: "+test("baglieaniabbl"));
          System.out.println("CB redeclarato: "+test("redeclarato"));
          System.out.println(cutStem("aarhus"));
          System.out.println(cutStem("uncontrollable"));
          System.out.println( stemsList.keySet().stream().filter( s -> !rootsList.containsKey( s ) ).count() );
          stemsList.entrySet().stream().filter( s -> !rootsList.containsKey( s.getKey() ) ).limit( 10 ).forEach( System.out::println );
          System.out.println( rootsList.keySet().stream().filter( s -> !stemsList.containsKey( s ) ).count() );
          rootsList.entrySet().stream().filter( s -> !stemsList.containsKey( s.getKey() ) ).limit( 10 ).forEach( System.out::println );*/
          Files.write( Paths.get( "D:\\Hola\\roots_map.txt" ), s2i( rootsList.entrySet().stream().map( p -> p.getKey() + '=' + p.getValue() ) ), StandardCharsets.UTF_8 );
        } catch ( IOException e ) {
          e.printStackTrace();
        }
      }
      
      private boolean in( char c, char... cs ) {
        for ( char cc : cs )
          if ( cc == c )
            return true;
        return false;
      }
      
      private int getCount( DAWGSet set, String suffix ) {
        int cnt = 0;
        for ( String s : set.getStringsEndingWith( suffix ) )
          cnt++;
        return cnt;
      }
      
      private Stream< String > suffixStream( DAWGSet set, String suffix ) {
        return StreamSupport.stream( set.getStringsEndingWith( suffix ).spliterator(), false );
      }
      
      private String cutStem( String word ) {
        while ( true ) {
          boolean cut = false;
          char text[] = word.toCharArray();
          for ( int i = 0; i < text.length; i++ ) {
            String suffix = String.valueOf( text, i, text.length - i );
            if ( suffixesList.containsKey( suffix ) ) {
              word = String.valueOf( text, 0, i - ( i > 1 && text[ i - 1 ] == text[ i - 2 ] && in( text[ i - 1 ], 'd', 'g', 'b', 'f', 'l', 'm', 'n', 'p', 'r', 't' ) ? 1 : 0 ) );
              cut = true;
              break;
            }
          }
          if ( !cut )
            break;
        }
        while ( true ) {
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
        }
        return word;
      }
      
      @Override
      public boolean test( String word ) {
        if ( word.endsWith( "'s" ) )
          word = word.substring( 0, word.length() - 2 );
        if ( word.indexOf( '\'' ) >= 0 )
          return false;
        if ( word.length() < 3 )
          return true;
        if ( word.length() > 16 )
          return false;
        word = cutStem( word );
        return word.isEmpty() || bloom.test( word );
      }

      private boolean containsAtLeast( Iterable< String > i, int size ) {
        if ( size <= 0 )
          return true;
        Iterator< String > it = i.iterator();
        while ( it.hasNext() ) {
          it.next();
          size--;
          if ( size <= 0 )
            return true;
        }
        return false;
      }
    },
    STATS_RAND() {
      private final Random r = new Random( System.nanoTime() );
      private int all;
      private int rt;
      private int rf;
      
      @Override
      public boolean test( String word ) {
        if ( all < 100 )
          all++;
        else
          all = rt = rf = 0;
        if ( word.endsWith( "'s" ) )
          word = word.substring( 0, word.length() - 2 );
        if ( word.indexOf( '\'' ) >= 0 ) {
          rf++;
          return false;
        }
        if ( word.length() < 3 ) {
          rt++;
          return true;
        }
        if ( word.length() > 16 ) {
          rf++;
          return false;
        }
        if ( all < 90 ) {
          rt++;
          return true;
        }
        return r.nextDouble() * ( rt + rf ) - rf <= 0.0;
      }
    },
    STATS_DET() {
      private int all;
      private int rt;
      
      @Override
      public boolean test( String word ) {
        if ( all < 100 )
          all++;
        else
          all = rt = 0;
        if ( word.endsWith( "'s" ) )
          word = word.substring( 0, word.length() - 2 );
        if ( word.indexOf( '\'' ) >= 0 )
          return false;
        if ( word.length() < 3 ) {
          rt++;
          return true;
        }
        if ( word.length() > 16 )
          return false;
        rt++;
        return rt <= 69;
      }
    },
    FILTERED() {
      @Override
      public boolean test( String word ) {
        if ( word.endsWith( "'s" ) )
          word = word.substring( 0, word.length() - 2 );
        if ( word.indexOf( '\'' ) >= 0 )
          return false;
        if ( word.length() < 3 )
          return true;
        if ( word.length() > 16 )
          return false;
        return ALWAYS_TRUE.test( word );
      }
    };
    
    @Override
    public abstract boolean test( String word );
    
    @Override
    public String getName() {
      return name();
    }
  }
  
  private static interface Strategy {
    public boolean test( String word );
    public String getName();
  }
  
  public static String reverse( String s ) {
    return new StringBuilder( s ).reverse().toString();
  }
  
  private static String rpad( String s, int l ) {
    while ( s.length() < l )
      s += '{';
    return s;
  }
  
  static int start;
  static int len = 7;
  
  private static String subst( String s ) {
    return rpad( s, start + len ).substring( start, start + len );
  }
  
  public static void main(String... args) throws Exception {
   /* CutBloomStrategy c = new CutBloomStrategy();
    c.words.stream().forEach( s -> c.testWithFeedback( s, true ) );
    c.onEnd();
    if ( true )
      return;*/
    JSONParser parser = new JSONParser();
    Stemmer stemmer = new Stemmer();//17885133
        List< Pair< String, Map< String, Boolean > > > list = Files.list( Paths.get( "D:\\hola\\output" ) ).limit( 50000 ).map( rethrowFunction( f -> new ImmutablePair< String, Map< String, Boolean > >( f.getFileName().toString(), ( Map< String, Boolean > )parser.parse( Files.lines( f ).collect( Collectors.joining() ) ) ) ) ).collect( Collectors.toList() );
      /*  Strategy str = StrategyEnum.STEMMED_BLOOM;
        System.out.println( list.stream().mapToInt( p -> {
              Result test = new Result();
              test.name = p.getLeft();
              Map< String, Boolean > m = p.getRight();
              int res = 0;
              for ( Map.Entry< String, Boolean > e : m.entrySet() ) {
                String word = e.getKey();
                boolean result = e.getValue();
                if ( str.test( word ) == result )
                  res++;
              }
              return res;
            } ).sum() );*/
        CutBloomStrategy cstr = new CutBloomStrategy();
        cstr.sf.stream().forEach( s -> cstr.suffixesList.put( s, 0 ) );
        cstr.pr.stream().forEach( s -> cstr.prefixesList.put( s, 0 ) );
        int maxSum = 0;//398830;
      /*  for ( int h = 0; h < 1000; h++ ) {*/
         /* cstr.initBloom( -1, 31 );
          cstr.visited.clear();
          cstr.words.stream()
              .map( s -> cstr.cutStem( s ) )
              .filter( s -> !s.isEmpty() )
              .map( s -> cstr.encodeForBloom( s ) )
              .forEach( cstr.bloom::add );*/
          IntSummaryStatistics stats = list.stream().mapToInt( p -> {
                Result test = new Result();
                test.name = p.getLeft();
                Map< String, Boolean > m = p.getRight();
                int res = 0;
                for ( Map.Entry< String, Boolean > e : m.entrySet() ) {
                  String word = e.getKey();
                  boolean result = e.getValue();
                  if ( cstr.testWithFeedback( word, result ) == result )
                    res++;
                }
                return res;
              } ).summaryStatistics();
          int sum = ( int )stats.getSum();
          if ( sum > maxSum ) {
           // System.out.println( sum + " <- best" );
            System.out.println( sum );
            int avg = ( int )( stats.getAverage() * 100.0 );
            System.out.println( ( avg / 100 ) + "." + ( avg % 100 ) + " %" );
            maxSum = sum;
          }/* else if ( sum > maxSum * 9 / 10 )
            System.out.println( h + ": " + sum );
        }*/
        System.out.println( 
        cstr.words.stream()
            .map( s -> cstr.cutStem( s ) )
            .filter( s -> !s.isEmpty() ).distinct().count());//396641
        cstr.onEnd();
    //Files.lines( Paths.get( "D:\\Hola\\prefixes_def.txt" ) ).distinct().filter( s -> !s.isEmpty() ).map( s -> Triple.of( s, cstr.pr.contains( s ), cstr.words.stream().filter( w -> w.startsWith( s ) ).count() ) ).sorted( ( o1, o2 ) -> Long.compare( o2.getRight(), o1.getRight() ) ).forEach( System.out::println );
  }
  
  private static class CutBloomStrategy implements Strategy {
      private final Map< String, String > stemsList = new TreeMap<>();
      private final Map< String, String > rootsList = new TreeMap<>();
      private final Map< String, Integer > prefixesList = new TreeMap<>();
      private final Map< String, Integer > suffixesList = new TreeMap<>();
      private Set< String > pr = new TreeSet<>();
      private Set< String > sf = new TreeSet<>();
      private Set< String > nonparts = new HashSet<>();
      private Set< String > words = new TreeSet<>();
      private Set< String > allowedStarts = new TreeSet<>();
      private final Stemmer stemmer = new Stemmer();
      private int mod;//499986
      private final Random r = new Random( System.nanoTime() );
      private Bloom bloom;
      private Bloom nonpartsBloom;
      private boolean lastPr;
      private String lastS;
      private MultiSet< String > visited = new HashMultiSet<>();
      Function< String, String > f = s -> s;
      private static final Pattern deniedSequences = Pattern.compile( "([^acdeghilmnoprstuwy]k|[^abdefghiklmnoprstuy]w|j([^acdehiklnoprsuy]|$)|q([^aeiou]|$)|y[^abcdefghiklmnoprstuvwx])" );
      
      {
        try {
          initBloom( 498780, 31 );
          Files.lines( Paths.get( "D:\\Hola\\containing_f.txt" ) ).filter( s -> !s.isEmpty() ).forEachOrdered( nonparts::add );
          Files.lines( Paths.get( "D:\\Hola\\prefixes_best.txt" ) ).filter( s -> !s.isEmpty() ).forEachOrdered( pr::add );
          Files.lines( Paths.get( "D:\\Hola\\suffixes_best.txt" ) ).filter( s -> !s.isEmpty() ).forEachOrdered( sf::add );
          Files.lines( Paths.get( "D:\\Hola\\allowed_starts.txt" ) ).filter( s -> !s.isEmpty() ).forEachOrdered( allowedStarts::add );
         // System.out.println( "prefixesList: " + pr.size() );//386640
         // System.out.println( "suffixesList: " + sf.size() );
          Files
            .lines( Paths.get( "D:\\Hola\\words.txt" ) )
            .map( s -> s.toLowerCase().trim() )
            .filter( s -> s.length() > 2 && s.length() < 17 && s.indexOf( '\'' ) < 0 )
            .forEachOrdered( words::add );
         // System.out.println( "rootsList: " + rootsList.size() );
         // sf.stream().forEach( s -> suffixesList.put( s, 0 ) );
          
          sf.stream().forEach( s -> suffixesList.put( s, 0 ) );
          pr.stream().forEach( s -> prefixesList.put( s, 0 ) );
          words.stream()
               .map( s -> cutStem( s ) )
               .filter( s -> !s.isEmpty() )
               .map( s -> encodeForBloom( s ) )
               .forEach( bloom::add );
          //Files.write( Paths.get( "D:\\Hola\\bloom_data" ), bloom.data.toByteArray() );
        } catch ( IOException e ) {
          e.printStackTrace();
        }
      }
      
      public void initBloom( int mod, int h ) {
        if ( mod > 0 )
          this.mod = mod;
        bloom = new Bloom( this.mod, s -> s.chars().reduce( 0, ( r, v ) -> r * h + v ) );
       // nonpartsBloom = new Bloom( this.mod * 7 / 10, s -> s.chars().reduce( 0, ( r, v ) -> r * h + v ) );
      }
      
      public boolean left() {
        return /*!pr.isEmpty() ||*/ !sf.isEmpty();
      }
      
      public void fill() {
       /* if ( pr.isEmpty() )
          sfFill();
        else if ( sf.isEmpty() || r.nextBoolean() )
          prFill();
        else*/
          sfFill();
        fillRoots();
      }
      
      public void fillRoots() {
        visited.clear();
        rootsList.clear();
        words.stream()
            .map( s -> cutStem( s ) )
            .filter( s -> !s.isEmpty() )
            .forEachOrdered( w -> rootsList.put( w, w ) );
        bloom.data.clear();
        rootsList.keySet().stream().map( s -> encodeForBloom( s ) ).forEach( bloom::add );
      }
      
      public void sfFill() {
        lastPr = false;
        Iterator< String > it = sf.iterator();
        for ( int i = r.nextInt( sf.size() ) - 1; i >= 0; i-- )
          it.next();
        if ( it.hasNext() ) {
          lastS = it.next();
          it.remove();
          suffixesList.put( lastS, 0 );
        }
      }
      
      public void prFill() {
        lastPr = true;
        Iterator< String > it = pr.iterator();
        for ( int i = r.nextInt( pr.size() ) - 1; i >= 0; i-- )
          it.next();
        if ( it.hasNext() ) {
          lastS = it.next();
          it.remove();
          prefixesList.put( lastS, 0 );
        }
      }
      
      public void cancel() {
        if ( lastPr )
          prefixesList.remove( lastS );
        else
          suffixesList.remove( lastS );
      }
      
      public static void init() throws Exception {//394364
        JSONParser parser = new JSONParser();
        List< Pair< String, Map< String, Boolean > > > list = Files.list( Paths.get( "D:\\hola\\output" ) ).limit( 5000 ).map( rethrowFunction( f -> new ImmutablePair< String, Map< String, Boolean > >( f.getFileName().toString(), ( Map< String, Boolean > )parser.parse( Files.lines( f ).collect( Collectors.joining() ) ) ) ) ).collect( Collectors.toList() );
        /*Strategy str = StrategyEnum.STEMMED_BLOOM;
        System.out.println( list.stream().mapToInt( p -> {
              Result test = new Result();
              test.name = p.getLeft();
              Map< String, Boolean > m = p.getRight();
              int res = 0;
              for ( Map.Entry< String, Boolean > e : m.entrySet() ) {
                String word = e.getKey();
                boolean result = e.getValue();
                if ( str.test( word ) == result )
                  res++;
              }
              return res;
            } ).sum() );
        if ( true)return;*/
        CutBloomStrategy best = null;
        int bestMax = 392969;
        for ( int i = 0; i < 10000; i++ ) {
          System.out.println();
          System.out.println( "It: " + i );
          CutBloomStrategy strategy = new CutBloomStrategy();
          int max = 374473;
          while ( strategy.left() ) {
            strategy.fill();
            int sum = list.stream().parallel().mapToInt( p -> {
              Result test = new Result();
              test.name = p.getLeft();
              Map< String, Boolean > m = p.getRight();
              int res = 0;
              for ( Map.Entry< String, Boolean > e : m.entrySet() ) {
                String word = e.getKey();
                boolean result = e.getValue();
                if ( strategy.test( word ) == result )
                  res++;
              }
              return res;
            } ).sum();
            if ( max >= sum )
              strategy.cancel();
            else {
              System.out.println( sum + ": pr=" + strategy.prefixesList.size() + ", sf=" + strategy.suffixesList.size() + ", r=" + strategy.rootsList.size() );
              max = sum;
            }
          }
          if ( bestMax < max ) {
            bestMax = max;
            best = strategy;
            System.out.println( "Best is " + bestMax + ": pr=" + best.prefixesList.size() + ", sf=" + best.suffixesList.size() + ", r=" + best.rootsList.size() );
           // Files.write( Paths.get( "D:\\Hola\\prefixes_best.txt" ), best.prefixesList.keySet(), StandardCharsets.UTF_8 );
           // Files.write( Paths.get( "D:\\Hola\\suffixes_best2.txt" ), best.suffixesList.keySet(), StandardCharsets.UTF_8 );
          }
        }
        if ( best != null )
          System.out.println( "The very best is " + bestMax + ": pr=" + best.prefixesList.size() + ", sf=" + best.suffixesList.size() + ", r=" + best.rootsList.size() );
      }
      
      private boolean in( char c, char... cs ) {
        for ( char cc : cs )
          if ( cc == c )
            return true;
        return false;
      }
      
      private int getCount( DAWGSet set, String suffix ) {
        int cnt = 0;
        for ( String s : set.getStringsEndingWith( suffix ) )
          cnt++;
        return cnt;
      }
      
      private Stream< String > suffixStream( DAWGSet set, String suffix ) {
        return StreamSupport.stream( set.getStringsEndingWith( suffix ).spliterator(), false );
      }
      
      private String cutStem( String word ) {
        int iteration = 0;
        while ( true ) {
          boolean cut = false;
          char text[] = word.toCharArray();
          Loop:
          for ( int i = 0; i < text.length; i++ ) {
            String suffix = String.valueOf( text, i, text.length - i );
            boolean removeDoubles = false;
            switch ( suffix ) {
              case "s":
                if ( iteration > 0 || i > 0 && text[ i - 1 ] == 's' )
                  continue;
                break;
              case "ing":
              case "ed":
                removeDoubles = true;
                break;
            }
            if ( suffix.startsWith( "ibl" ) || suffix.startsWith( "abl" ) || suffix.startsWith( "iz" ) || suffix.startsWith( "is" ) || suffix.startsWith( "at" ) )
              removeDoubles = true;
            int m = 2;
            switch ( suffix ) {
              case "s":
              case "ful":
              case "less":
                m = 1;
                break;
            }
            if ( suffixesList.containsKey( suffix ) ) {
              if ( m( text, 0, i ) < m )
                continue;
              int extra = 0;
              word = String.valueOf( text, 0, i - ( removeDoubles && i > 1 && text[ i - 1 ] == text[ i - 2 ] && isConsonant( text[ i - 1 ] ) ? 1 : 0 ) + extra );
              cut = true;
              break;
            }
          }
          if ( !cut )
            break;
          iteration++;
        }
        while ( true ) {
          boolean cut = false;
          char text[] = word.toCharArray();
          for ( int i = text.length; i > 0; i-- ) {
            String prefix = String.valueOf( text, 0, i );
            if ( prefixesList.containsKey( prefix ) ) {
              if ( m( text, i, text.length ) < 2 )
                continue;
              word = String.valueOf( text, i, text.length - i );
              cut = true;
              break;
            }
          }
          if ( !cut )
            break;
        }
        return word;
      }
      
      private int m( char text[], int s, int e ) {
        int m = 0;
        boolean prev = false;
        for ( int i = s; i < e; i++ ) {
          char c = text[ i ];
          boolean v = false;
          switch ( c ) {
            case 'a':
            case 'e':
            case 'i':
            case 'o':
            case 'u':
              v = true;
              break;
            case 'y':
              if ( i == 0 )
                v = true;
              else {
                switch ( text[ i - 1 ] ) {
                  case 'a':
                  case 'e':
                  case 'i':
                  case 'o':
                  case 'u':
                    break;
                  default:
                    v = true;
                }
              }
          }
          if ( prev != v ) {
            m++;
            prev = v;
          }
        }
        return m / 2;
      }
      
      private String mCut( String word ) {
        char text[] = word.toCharArray();
        int s;
        Loop:
        for ( s = 0; s < text.length; s++ ) {
          switch ( text[ s ] ) {
            case 'a':
            case 'e':
            case 'i':
            case 'o':
            case 'u':
            case 'y':
              break Loop;
          }
        }
        for ( int e = text.length - 1; e >= s; e-- ) {
          switch ( text[ e ] ) {
            case 'a':
            case 'e':
            case 'i':
            case 'o':
            case 'u':
              break;
            default:
              return String.valueOf( text, s, e - s + 1 );
          }
        }
        return "";
      }
      
      @Override
      public boolean test( String word ) {
        if ( word.endsWith( "'s" ) )
          word = word.substring( 0, word.length() - 2 );
        if ( word.indexOf( '\'' ) >= 0 )
          return false;
        if ( word.length() < 3 )
          return true;
        if ( word.length() > 16 )
          return false;
        word = cutStem( word );
        if ( !bloom.test( encodeForBloom( word ) ) )
          return false;
        int vq = visited.add( word, 1 );
        if ( vq > 0 ) {
          if ( prefixesList.containsKey( word ) )
            return false;
          return vq > getVisitedThreshold( visited.size() );
        }
        if ( word.length() > 13 )
          return false;
        if ( visited.size() > 425245 )
          return false;
        int cvq[] = cvq( word );
        if ( IntStream.of( cvq ).max().orElse( 0 ) > 4 )
          return false;
        Map< Integer, Long > cvqLengths = IntStream.of( cvq )
          .boxed()
          .collect( Collectors.groupingBy( i -> i, Collectors.counting() ) );
        if ( cvqLengths.getOrDefault( 4, 0L ) > 1 ||
             cvqLengths.getOrDefault( 4, 0L ) + cvqLengths.getOrDefault( 3, 0L ) > 2 ||
             cvqLengths.getOrDefault( 4, 0L ) + cvqLengths.getOrDefault( 3, 0L ) + cvqLengths.getOrDefault( 2, 0L ) > 5 )
          return false;
        int m = m( word.toCharArray(), 0, word.length() );
        if ( m == 0 || m > 5 )
          return false;
        if ( deniedSequences.matcher( word ).find() )
          return false;
        return true;
      }
      
      private Map< String, String > fake = new TreeMap<>();
      private Map< String, String > right = new TreeMap<>();
      int fakeCnt;
      int rightCnt;
      MultiSet< String > distinctFakeParts = new HashMultiSet<>();
      MultiSet< String > distinctRightParts = new HashMultiSet<>();
      List< String > fakeList = new ArrayList<>();
      Set< String > rightList = new TreeSet<>();
      int mistakes;
      MultiSet< String > visitedFakes = new HashMultiSet<>();
      MultiSet< String > visitedTrues = new HashMultiSet<>();
      int mis;
      MultiSet< Integer > newVisitedF[] = new MultiSet[ 19 ];
      MultiSet< Integer > newVisitedT[] = new MultiSet[ 19 ];
      
      {
        for ( int i = 0; i < newVisitedF.length; i++ ) {
          newVisitedF[ i ] = new HashMultiSet<>();
          newVisitedT[ i ] = new HashMultiSet<>();
        }
      }
      
      private int getVisitedThreshold( int size ) {
        if ( size < 2500000 )
          return 0;
        if ( size < 4500000 )
          return 1;
        if ( size < 6000000 )
          return 2;
        if ( size < 7000000 )
          return 3;
        return 4;
      }
      
      public boolean testWithFeedback( String word, boolean inList ) {
        if ( word.endsWith( "'s" ) )
          word = word.substring( 0, word.length() - 2 );
        if ( word.indexOf( '\'' ) >= 0 )
          return false;
        if ( word.length() < 3 )
          return true;
        if ( word.length() > 16 )
          return false;
        String cword = cutStem( word );
        if ( !bloom.test( encodeForBloom( cword ) ) )
          return false;
        int vq = visited.add( cword, 1 );
        if ( vq > 0 ) {
          if ( prefixesList.containsKey( cword ) )
            return false;
          if ( vq <= getVisitedThreshold( visited.size() ) ) {
            if ( inList )
              mis++;
            return false;
          }
          if ( vq <= newVisitedF.length ) {
            if ( inList )
              newVisitedT[ vq - 1 ].add( ( visited.size() / 300000 ) * 300000 );
            else
              newVisitedF[ vq - 1 ].add( ( visited.size() / 300000 ) * 300000 );
          }
         /* if ( vq <= visited.size() / 3500000 ) {
            if ( inList )
              mis++;
            return false;
          }*/
          if ( inList )
            visitedTrues.add( cword );
          else {
            visitedFakes.add( cword );
            mistakes++;
          }
          return true;
        }
        if ( word.length() > 13 )
          return false;
        if ( visited.size() > 425245 )
          return false;
        int cvq[] = cvq( cword );
        if ( IntStream.of( cvq ).max().orElse( 0 ) > 4 )
          return false;
        Map< Integer, Long > cvqLengths = IntStream.of( cvq )
          .boxed()
          .collect( Collectors.groupingBy( i -> i, Collectors.counting() ) );
        if ( cvqLengths.getOrDefault( 4, 0L ) > 1 ||
             cvqLengths.getOrDefault( 4, 0L ) + cvqLengths.getOrDefault( 3, 0L ) > 2 ||
             cvqLengths.getOrDefault( 4, 0L ) + cvqLengths.getOrDefault( 3, 0L ) + cvqLengths.getOrDefault( 2, 0L ) > 5 )
          return false;
        int m = m( cword.toCharArray(), 0, cword.length() );
        if ( m == 0 || m > 5 )
          return false;
        if ( deniedSequences.matcher( cword ).find() )
          return false;
        if ( inList ) {
          right.put( cword, word );
          rightCnt++;
          rightList.add( cword );
        } else {
          fake.put( cword, word );
          fakeCnt++;
          fakeList.add( cword );
        }
        return true;
      }
      
      public void onEnd() throws Exception {//398770, 3995968
        System.out.println( "fake: " + fakeCnt );//88582
        System.out.println( "right: " + rightCnt );//183629
        System.out.println( "distinct fake: " + fake.size() );//80369
        System.out.println( "distinct right: " + right.size() );//133486
        System.out.println( fake.entrySet().stream().filter( s -> s.getKey().startsWith( "b" ) ).limit( 20 ).map( s -> s.getKey() + '=' + s.getValue() + '/' + splitWord( s.getKey(), null ) ).collect( Collectors.joining( ", " ) ) );
        System.out.println( right.entrySet().stream().filter( s -> s.getKey().startsWith( "b" ) ).limit( 20 ).map( s -> s.getKey() + '=' + s.getValue() + '/' + splitWord( s.getKey(), null ) ).collect( Collectors.joining( ", " ) ) );
        System.out.println( fake.keySet().stream().map( s -> splitWord( s, false ) ).filter( s -> !s.equals( "0" ) ).count() );
        System.out.println( right.keySet().stream().map( s -> splitWord( s, true ) ).filter( s -> !s.equals( "0" ) ).count() );
        System.out.println( distinctFakeParts.size() );
        System.out.println( distinctRightParts.size() );
        System.out.println( distinctFakeParts.uniqueSet().size() );
        System.out.println( distinctRightParts.uniqueSet().size() );
        System.out.println( distinctFakeParts.entrySet().stream().filter( e -> !distinctRightParts.contains( e.getElement() ) ).count() );
        System.out.println( distinctFakeParts.entrySet().stream().filter( e -> distinctRightParts.contains( e.getElement() ) ).count() );
        System.out.println( distinctFakeParts.entrySet().stream().filter( e -> !distinctRightParts.contains( e.getElement() ) ).mapToInt( e -> e.getCount() ).sum() );
        System.out.println( distinctFakeParts.entrySet().stream().filter( e -> distinctRightParts.contains( e.getElement() ) ).mapToInt( e -> e.getCount() ).sum() );
        Iterator< MultiSet.Entry< String > > it = visited.entrySet().iterator();
        while ( it.hasNext() ) {
          MultiSet.Entry< String > e = it.next();
          if ( e.getCount() <= 1 )
            it.remove();
        }
        System.out.println( visited.size() );
        Set< String > cutWords = words.stream().map( s -> cutStem( s ) ).filter( s -> !s.isEmpty() ).collect( Collectors.toSet() );
        System.out.println( visited.stream().filter( s -> cutWords.contains( s ) ).count() );
        System.out.println( visited.uniqueSet().stream().filter( s -> cutWords.contains( s ) ).count() );
        System.out.println( visited.stream().filter( s -> !cutWords.contains( s ) ).count() );
        System.out.println( visited.uniqueSet().stream().filter( s -> !cutWords.contains( s ) ).count() );
        System.out.println( cutWords.size() );
        System.out.println( mistakes );
        System.out.println( visited.uniqueSet().size() );
        System.out.println( "visited" );
        System.out.println( mis );
        System.out.println( visitedFakes.size() );
        System.out.println( visitedFakes.uniqueSet().size() );
       // Files.write( Paths.get( "D:\\Hola\\visited_fake.csv" ), s2i( visitedFakes.entrySet().stream().collect( Collectors.groupingBy( e -> e.getCount(), Collectors.counting() ) ).entrySet().stream().sorted( ( e1, e2 ) -> Integer.compare( e2.getKey(), e1.getKey() ) ).map( e -> e.getKey() + ";" + e.getValue() ) ) );
       // Files.write( Paths.get( "D:\\Hola\\visited_right.csv" ), s2i( visitedTrues.entrySet().stream().collect( Collectors.groupingBy( e -> e.getCount(), Collectors.counting() ) ).entrySet().stream().sorted( ( e1, e2 ) -> Long.compare( e2.getValue(), e1.getValue() ) ).map( e -> e.getKey() + ";" + e.getValue() ) ) );
        System.out.println( visitedFakes.entrySet().stream().sorted( ( e1, e2 ) -> Integer.compare( e2.getCount(), e1.getCount() ) ).limit( 20 ).map( e -> e.toString() ).collect( Collectors.joining( ", " ) ) );
        System.out.println( visitedFakes.entrySet().stream().sorted( ( e1, e2 ) -> Integer.compare( e1.getCount(), e2.getCount() ) ).limit( 20 ).map( e -> e.toString() ).collect( Collectors.joining( ", " ) ) );
        System.out.println( visitedFakes.entrySet().stream().map( e -> e.getCount() ).collect( MoreIntSummaryStatistics::new, MoreIntSummaryStatistics::accept, MoreIntSummaryStatistics::combine ) );
        System.out.println( visitedTrues.size() );
        System.out.println( visitedTrues.uniqueSet().size() );
        System.out.println( visitedTrues.entrySet().stream().sorted( ( e1, e2 ) -> Integer.compare( e2.getCount(), e1.getCount() ) ).limit( 20 ).map( e -> e.toString() ).collect( Collectors.joining( ", " ) ) );
        System.out.println( visitedTrues.entrySet().stream().sorted( ( e1, e2 ) -> Integer.compare( e1.getCount(), e2.getCount() ) ).limit( 20 ).map( e -> e.toString() ).collect( Collectors.joining( ", " ) ) );
        System.out.println( visitedTrues.entrySet().stream().map( e -> e.getCount() ).collect( MoreIntSummaryStatistics::new, MoreIntSummaryStatistics::accept, MoreIntSummaryStatistics::combine ) );
        System.out.println( prefixesList.keySet().stream().filter( s -> words.contains( s ) ).count() );
        System.out.println( visitedFakes.entrySet().stream().collect( Collectors.groupingBy( e -> e.getCount(), Collectors.counting() ) ).entrySet().stream().sorted( ( e1, e2 ) -> Integer.compare( e1.getKey(), e2.getKey() ) ).limit( 20 ).map( e -> e.toString() ).collect( Collectors.joining( ", " ) ) );
        System.out.println( visitedTrues.entrySet().stream().collect( Collectors.groupingBy( e -> e.getCount(), Collectors.counting() ) ).entrySet().stream().sorted( ( e1, e2 ) -> Integer.compare( e1.getKey(), e2.getKey() ) ).limit( 20 ).map( e -> e.toString() ).collect( Collectors.joining( ", " ) ) );
       /* for ( int i = 0; i < newVisitedF.length; i++ ) {
          System.out.println( "Quantity of new words visited " + ( i + 2 ) + " times" );
          System.out.println( newVisitedF[ i ].entrySet().stream().sorted( ( e1, e2 ) -> Integer.compare( e1.getElement(), e2.getElement() ) ).map( e -> e.toString() ).collect( Collectors.joining( ", " ) ) );
          System.out.println( newVisitedT[ i ].entrySet().stream().sorted( ( e1, e2 ) -> Integer.compare( e1.getElement(), e2.getElement() ) ).map( e -> e.toString() ).collect( Collectors.joining( ", " ) ) );
        }*/
        //fakeList.sort( null );
        //rightList.sort( null );
        //Files.write( Paths.get( "D:\\Hola\\long_living_fake.txt" ), fakeList );
        //Files.write( Paths.get( "D:\\Hola\\long_living_right.txt" ), rightList );
       // System.out.println( distinctFakeParts.entrySet().stream().filter( e -> !distinctRightParts.contains( e.getElement() ) ).map( e -> e.getElement() ).sorted().collect( Collectors.joining( "\n" ) ) );
      }
      
      private String splitWord( String word, Boolean right ) {
        if ( word.length() < 3 )
          return "0";
        List< String > ret = new ArrayList<>();
        for ( int i = 3; i < word.length() - 3; i++ ) {
          String first = word.substring( 0, i );
          String second = word.substring( i );
          String split;
          if ( words.contains( first ) ) {
            if ( words.contains( second ) )
              split = first + '-' + second;
            else
              split = first + '-' + splitWord( second, null );
          } else if ( words.contains( second ) )
            split = splitWord( first, null ) + '-' + second;
          else
            split = "0";
          ret.add( split );
        }
        String split = ret.stream().min( ( s1, s2 ) -> {
          int r = Long.compare( s1.chars().filter( c -> c == '0' ).count(), s2.chars().filter( c -> c == '0' ).count() );
          if ( r == 0 ) {
            r = Long.compare( s1.chars().filter( c -> c == '-' ).count(), s2.chars().filter( c -> c == '-' ).count() );
            if ( r == 0 )
              r = s1.compareTo( s2 );
          }
          return r;
        } ).orElse( "0" );
        if ( right != null ) {
          String parts[] = split.split( "-" );
          for ( String part : parts ) {
            if ( !"0".equals( part ) ) {
              if ( right )
                distinctRightParts.add( part );
              else
                distinctFakeParts.add( part );
            }
          }
        }
        return split;
      }
  
  private int[] cvq( String s ) {
    boolean prev = false;
    int q = 0;
    List< Integer > ret = new ArrayList<>();
    for ( int i = 0; i <= s.length(); i++ ) {
      boolean v = i == s.length() ? !prev : isVowel( s, i );
      if ( i == 0 || v == prev )
        q++;
      else {
        ret.add( q );
        q = 1;
      }
      prev = v;
    }
    return ret.stream().mapToInt( i -> i ).toArray();
  }
  
  private boolean isVowel( String s, int pos ) {
    char c = s.charAt( pos );
    switch ( c ) {
      case 'a':
      case 'e':
      case 'i':
      case 'o':
      case 'u':
        return true;
      case 'y':
        if ( pos == 0 )
          return true;
        return !isVowel( s, pos - 1 );
      default:
        return false;
    }
  }

      private boolean containsAtLeast( Iterable< String > i, int size ) {
        if ( size <= 0 )
          return true;
        Iterator< String > it = i.iterator();
        while ( it.hasNext() ) {
          it.next();
          size--;
          if ( size <= 0 )
            return true;
        }
        return false;
      }

    @Override
    public String getName() {
      return "CutBloom";
    }

    private boolean isConsonant( char c ) {
     /* switch ( c ) {
        case 'a':
        case 'e':
        case 'i':
        case 'o':
        case 'u':
        case 'y':
        case 'l':
        case 's':
        case 'z':
          return false;
      }
      return true;*/
      switch ( c ) {
        case 'b':
        case 'd':
        case 'f':
        case 'g':
        case 'l':
        case 'm':
        case 'n':
        case 'p':
        case 'r':
        case 't':
          return true;
      }
      return false;
    }

    private String encodeForBloom( String word ) {
      return f.apply( word );
    }
  }
  
  private static class BloomStrategy implements Strategy {
    private final Stemmer stemmer = new Stemmer();
    private final Bloom bloom;
    private final int h;

    public BloomStrategy( int h ) {
      this.h = h;
      bloom = new Bloom( 500000, s -> s.chars().reduce( 0, ( r, v ) -> r * h + v ) );
      try {
        Files.lines( Paths.get( "D:\\Hola\\words.txt" ) ).map( s -> s.toLowerCase().trim() ).filter( s -> s.indexOf( '\'' ) < 0 ).map( s -> stemmer.stem( s ) ).forEach( s -> {
          bloom.add( s );
        } );
      } catch ( IOException e ) {
        e.printStackTrace();
      }
    }

    @Override
    public boolean test( String word ) {
      if ( word.endsWith( "'s" ) )
        word = word.substring( 0, word.length() - 2 );
      if ( word.indexOf( '\'' ) >= 0 )
        return false;
      if ( word.length() < 3 )
        return true;
      if ( word.length() > 16 )
        return false;
      if ( !bloom.test( stemmer.stem( word ) ) )
        return false;
      return true;
    }

    @Override
    public String getName() {
      return "Bloom" + h;
    }
  }
  
  private static class EncoderStrategy implements Strategy {
    private static List< String > words;
    private static List< String > random;
    private static final Random r = new Random( System.nanoTime() );
    private static final CutBloomStrategy cbs = new CutBloomStrategy();
    private final Bloom bloom;
    private final StringEncoder encoder;
    
    static {
      try {
        words = Files.lines( Paths.get( "D:\\Hola\\words.txt" ) )
          .map( s -> s.toLowerCase().trim() )
          .filter( s -> s.length() > 2 && s.length() < 17 && s.indexOf( '\'' ) < 0 )
          .collect( Collectors.toList() );
        random = words.stream().filter( s -> r.nextDouble() < 0.001 ).limit( 10 ).collect( Collectors.toList() );
      } catch ( IOException e ) {
        e.printStackTrace();
      }
    }

    public EncoderStrategy( StringEncoder encoder ) {
      this.encoder = encoder;
      bloom = new Bloom( 500009, s -> s.chars().reduce( 0, ( r, v ) -> r * 31 + v ) );
      words.stream()
        .map( s -> encode( s ) )
        .filter( s -> !s.isEmpty() )
        .forEach( bloom::add );
     /* System.out.println();
      System.out.println( getName() );
      random.stream().map( s -> Pair.of( s, encode( s ) ) ).forEach( System.out::println );*/
    }
    
    private String encode( String word ) {
      try {
        word = cbs.cutStem( word );
        word = encoder.encode( word );
        return word;
      } catch ( EncoderException e ) {
        e.printStackTrace();
        System.exit( 1 );
        return null;
      }
    }

    @Override
    public boolean test( String word ) {
      if ( word.endsWith( "'s" ) )
        word = word.substring( 0, word.length() - 2 );
      if ( word.indexOf( '\'' ) >= 0 )
        return false;
      if ( word.length() < 3 )
        return true;
      if ( word.length() > 16 )
        return false;
      word = encode( word );
      if ( !bloom.test( word ) )
        return false;
      return true;
    }

    @Override
    public String getName() {
      if ( encoder instanceof SaltCodec )
        return "Salt" + ( ( SaltCodec )encoder ).getName();
      return encoder.getClass().getSimpleName();
    }
  }
  
  private static < T > Iterable< T > s2i( Stream< T > s ) {
    return s::iterator;
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
  
  public static class StatsResult {
    public String word;
    public int all;
    public int contained;
    public List< String > examples = new ArrayList<>();

    public StatsResult( String word, int all, Stream< String > containedStream ) {
      this.word = word;
      this.all = all;
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
  
  private static class Word {
    public String word;
    private final Set< String > wordPrefixes = new TreeSet<>();
    
    public Word( String word ) {
      this.word = word;
    }

    private void addPrefix( String prefix ) {
      wordPrefixes.add( prefix );
    }

    @Override
    public String toString() {
      return '(' + wordPrefixes.stream().collect( Collectors.joining( "|" ) ) + ')' + word;
    }
  }

  public static void research() throws Exception {
    Stemmer stemmer = new Stemmer();
    try {
      Files.lines( Paths.get( "D:\\Hola\\words.txt" ) ).map( s -> s.toLowerCase().trim() ).filter( s -> s.indexOf( '\'' ) < 0 ).forEach( s -> otrie.put( s, new Word( s ) ) );
    } catch ( IOException e ) {
      e.printStackTrace();
    }
    TreeSet< String > prefixesList = new TreeSet<>();
    PatriciaTrie< Word > trie = new PatriciaTrie<>( otrie );
    for ( int level = 0; true; level++ ) {
      PatriciaTrie< Integer > prefixes = new PatriciaTrie<>();
      for ( int i = 1; i < 16; i++ ) {
        final int ii = i;
        trie.keySet().stream().filter( s -> s.length() > ii ).map( s -> s.substring( 0, ii ) ).distinct().forEach( s -> prefixes.put( s, trie.prefixMap( s ).size() ) );
      }
      boolean newWords[] = new boolean[ 1 ];
      prefixes.entrySet().stream().map( e -> new StatsResult( e.getKey(), e.getValue(), trie.prefixMap( e.getKey() ).keySet().stream().map( w -> w.substring( e.getKey().length() ) ).filter( w -> trie.containsKey( w ) ) ) ).filter( o -> o.contained > 50 && o.getPercent() > 35.0 && trie.containsKey( o.word ) ).sorted( ( o1, o2 ) -> Double.compare( o1.getPercent(), o2.getPercent() ) ).forEach( o -> {
       // System.out.println( o );
        if ( prefixesList.add( o.word ) )
          newWords[ 0 ] = true;
      } );
      if ( !newWords[ 0 ] )
        break;
     // System.out.println( prefixesList.size() );
      for ( Iterator< String > it = trie.keySet().iterator(); it.hasNext(); ) {
        String word = it.next();
        String floor = findPrefix( prefixesList, word );
        if ( floor != null ) {
          word = word.substring( floor.length() );
          Word w = trie.get( word );
          if ( w != null )
            it.remove();
        }
      }
    }
    for ( Iterator< Word > it = otrie.values().iterator(); it.hasNext(); ) {
      Word current = it.next();
      String word = current.word;
      StringBuilder prefixB = new StringBuilder();
      Word parent = null;
      String prefix = null;
      String floor = findPrefix( prefixesList, word );
      while ( floor != null ) {
        word = word.substring( floor.length() );
        prefixB.append( floor );
        Word w = otrie.get( word );
        if ( w != null ) {
          parent = w;
          prefix = prefixB.toString();
        }
        floor = findPrefix( prefixesList, word );
      }
      if ( parent != null ) {
       // it.remove();
        parent.addPrefix( prefix );
      }
    }
    Map< String, Set< String > > allPrefixes = new TreeMap<>();
    for ( Word w : otrie.values() ) {
      for ( String prefix : w.wordPrefixes ) {
        Set< String > s = allPrefixes.get( prefix );
        if ( s == null )
          allPrefixes.put( prefix, s = new TreeSet<>() );
        s.add( w.word );
      }
    }
    allPrefixes = new TreeMap<>( allPrefixes.entrySet().stream().filter( e -> e.getValue().size() > 30 ).collect( Collectors.toMap( e -> e.getKey(), e -> e.getValue() ) ) );
   // allPrefixes.entrySet().stream().sorted( ( o1, o2 ) -> Integer.compare( o1.getValue().size(), o2.getValue().size() ) ).map( e -> e.getKey() + " (" + e.getValue().size() + "): " + e.getValue().stream().limit( 10 ).collect( Collectors.joining( ", " ) ) ).forEach( System.out::println );
   // System.out.println( allPrefixes.size() );
    for ( Word w : otrie.values() )
      w.wordPrefixes.clear();
    prefixesList.clear();
    prefixesList.addAll( allPrefixes.keySet() );
    for ( Iterator< Word > it = otrie.values().iterator(); it.hasNext(); ) {
      Word current = it.next();
      String word = current.word;
      if ( "romance".equals(word))
        System.out.println("");
      String floor = findPrefix( prefixesList, word );
      if ( floor != null ) {
        word = word.substring( floor.length() );
        Word w = otrie.get( word );
        while ( w == null ) {
          if ( floor.length() <= 1 )
            break;
          floor = floor.substring( 0, floor.length() - 1 );
          if ( prefixesList.contains( floor ) ) {
            word = current.word.substring( floor.length() );
            w = otrie.get( word );
          }
        }
        if ( w != null ) {
          w.addPrefix( floor );
          for ( String p : current.wordPrefixes )
            w.addPrefix( p + floor );
          it.remove();
        }
      }
    }
    otrie.values().stream().filter( w -> !w.wordPrefixes.isEmpty() ).limit( 100 ).forEach( System.out::println );
    System.out.println( otrie.size() );
    Map< Set< String >, Set< String > > prefixClasses = new HashMap<>();
    otrie.values().stream().forEach( w -> {
      Set< String > s = prefixClasses.get( w.wordPrefixes );
      if ( s == null )
        prefixClasses.put( w.wordPrefixes, s = new TreeSet<>() );
      s.add( w.word );
    } );
    prefixClasses.entrySet().stream().sorted( ( o1, o2 ) -> Integer.compare( o1.getValue().size(), o2.getValue().size() ) ).limit( 100 ).map( e -> e.getKey() + " -> (" + e.getValue().size() + ") " + e.getValue().stream().limit( 10 ).collect( Collectors.joining( ", " ) ) ).forEach( System.out::println );
    System.out.println( prefixClasses.size() );
   /* try ( FileWriter fw = new FileWriter( "D:\\Hola\\words_no_prefix.txt" ) ) {
      for ( String s : prefixClasses.get( new TreeSet<>() ) )
        fw.append( s ).append( '\n' );
      fw.flush();
    }*/
    prefixClasses.entrySet().stream().map( e -> new ImmutablePair< Integer, Integer >( e.getKey().size(), e.getValue().size() ) ).collect( Collectors.groupingBy( s -> s.getLeft(), Collectors.collectingAndThen( Collectors.summarizingInt( s -> s.getRight() ), stats -> new ImmutablePair< Integer, Integer >( ( int )stats.getCount(), ( int )stats.getSum() ) )  ) ).entrySet().stream().sorted( ( o1, o2 ) -> Integer.compare( o1.getKey(), o2.getKey() ) ).forEach( System.out::println );
  }
  
  private static String findPrefix( TreeSet< String > prefixesList, String word ) {
    String floor = prefixesList.floor( word );
    if ( floor != null ) {
      int length = Math.min( word.length(), floor.length() );
      int i;
      for ( i = 0; i < length; i++ ) {
        if ( word.charAt( i ) != floor.charAt( i ) )
          break;
      }
      floor = floor.substring( 0, i );
      if ( prefixesList.contains( floor ) )
        return floor;
    }
    return null;
  }
}