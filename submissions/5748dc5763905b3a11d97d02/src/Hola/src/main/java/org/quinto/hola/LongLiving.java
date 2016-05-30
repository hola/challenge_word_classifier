package org.quinto.hola;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;
import org.apache.commons.codec.EncoderException;
import org.apache.commons.codec.StringEncoder;
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
import org.apache.commons.lang3.tuple.Pair;
import org.apache.commons.lang3.tuple.Triple;
import static org.quinto.hola.LambdaExceptionUtil.rethrowFunction;

public class LongLiving {
  private static final StringEncoder ENCODERS[] = new StringEncoder[] {
    new BCodec( StandardCharsets.UTF_8 ),
    new BeiderMorseEncoder(),
    new Caverphone1(),
    new Caverphone2(),
    new ColognePhonetic(),
    new DaitchMokotoffSoundex( false ),
    new DoubleMetaphone(),
    new MatchRatingApproachEncoder(),
    new Metaphone(),
    new Nysiis(),
    new QCodec( StandardCharsets.UTF_8 ),
    new QuotedPrintableCodec( StandardCharsets.UTF_8 ),
    new RefinedSoundex(),
    new Soundex(),
    new URLCodec()
  };
  
  public static void main( String... args ) throws Exception {
    Set< String > fake = new TreeSet<>();
    Set< String > right = new TreeSet<>();
    Files.lines( Paths.get( "D:\\Hola\\long_living_fake.txt" ) ).filter( s -> !s.isEmpty() ).forEach( fake::add );
    Files.lines( Paths.get( "D:\\Hola\\long_living_right.txt" ) ).filter( s -> !s.isEmpty() ).forEach( right::add );
    /*fake.stream()
      .map( s -> Pair.of( s, cvq( s ) ) )
      .limit( 10 )
      .map( p -> Pair.of( p.getLeft(), Arrays.toString( p.getRight() ) ) )
      .forEach( System.out::println );
    System.out.println( "fake: " + fake.stream()
      .map( s -> cvq( s ) )
      .map( a -> IntStream.of( a ).max().orElse( 0 ) )
      .collect( Collectors.groupingBy( i -> i, Collectors.counting() ) ) );
    System.out.println( "right: " + right.stream()
      .map( s -> cvq( s ) )
      .map( a -> IntStream.of( a ).max().orElse( 0 ) )
      .collect( Collectors.groupingBy( i -> i, Collectors.counting() ) ) );
    for ( int cv = 1; cv <= 4; cv++ ) {
      final int cvq = cv;
      System.out.println( cv );
      System.out.println( "fake: " + fake.stream()
        .map( s -> cvq( s ) )
        .map( a -> IntStream.of( a ).boxed().collect( Collectors.groupingBy( i -> i, Collectors.counting() ) ).getOrDefault( cvq, 0L ) )
        .collect( Collectors.groupingBy( i -> i, Collectors.counting() ) ) );
      System.out.println( "right: " + right.stream()
        .map( s -> cvq( s ) )
        .map( a -> IntStream.of( a ).boxed().collect( Collectors.groupingBy( i -> i, Collectors.counting() ) ).getOrDefault( cvq, 0L ) )
        .collect( Collectors.groupingBy( i -> i, Collectors.counting() ) ) );
    }
    fake.stream()
      .map( s -> Pair.of( s, getSubstrings( s )
                               .collect( Collectors.groupingBy( w -> w, Collectors.counting() ) )
                               .entrySet()
                               .stream()
                               .filter( e -> e.getValue() > 1 )
                               .map( e -> Pair.of( e.getKey().length(), e.getValue().intValue() ) )
                               .collect( Collectors.toList() ) ) )
      .limit( 10 )
      .forEach( System.out::println );
    System.out.println( "Count of distinct repeating substrings" );
    System.out.println( "fake: " + fake.stream()
      .map( s -> Pair.of( s, getSubstrings( s )
                               .collect( Collectors.groupingBy( w -> w, Collectors.counting() ) )
                               .entrySet()
                               .stream()
                               .filter( e -> e.getValue() > 1 )
                               .map( e -> Pair.of( e.getKey().length(), e.getValue().intValue() ) )
                               .collect( Collectors.toList() )
                               .size() ) )
      .map( p -> p.getValue() )
      .collect( Collectors.groupingBy( i -> i, Collectors.counting() ) ) );
    System.out.println( "right: " + right.stream()
      .map( s -> Pair.of( s, getSubstrings( s )
                               .collect( Collectors.groupingBy( w -> w, Collectors.counting() ) )
                               .entrySet()
                               .stream()
                               .filter( e -> e.getValue() > 1 )
                               .map( e -> Pair.of( e.getKey().length(), e.getValue().intValue() ) )
                               .collect( Collectors.toList() )
                               .size() ) )
      .map( p -> p.getValue() )
      .collect( Collectors.groupingBy( i -> i, Collectors.counting() ) ) );
    for ( int length = 1; length < 16; length++ ) {
      final int len = length;
      System.out.println( "Count of substrings of length " + length );
      Map< String, Long > fakeSubs = right.stream()
        .filter( s -> s.length() >= len )
        .map( s -> s.substring( 0, len ) )
        .collect( Collectors.groupingBy( s -> s, Collectors.counting() ) );
      fake.stream()
        .filter( s -> s.length() >= len )
        .map( s -> s.substring( 0, len ) )
        .collect( Collectors.groupingBy( s -> s, Collectors.counting() ) )
        .entrySet()
        .stream()
        .sorted( ( e1, e2 ) -> e1.getKey().compareTo( e2.getKey() ) )
        .map( e -> Triple.of( e.getKey(), e.getValue(), fakeSubs.getOrDefault( e.getKey(), 0L ) ) )
        .filter( t -> t.getMiddle() > Math.max( t.getRight() * 3 + 4, 20 ) )
        .forEach( System.out::println );
    }*/
   /* System.out.println( fake.stream().filter( s -> s.length() <= 2 ).count() );
    System.out.println( right.stream().filter( s -> s.length() > 2 ).map( s -> s.substring( s.length() - 3 ) ).distinct().count() );
    int partSum[] = new int[ 1 ];
    right.stream().filter( s -> s.length() > 2 ).map( s -> Pair.of( s, s.substring( s.length() - 3 ) ) ).collect( Collectors.groupingBy( p -> p.getRight(), Collectors.counting() ) ).entrySet().stream().sorted( ( e1, e2 ) -> Long.compare( e2.getValue(), e1.getValue() ) ).forEachOrdered( e -> {
      partSum[ 0 ] += e.getValue().intValue();
      if ( partSum[ 0 ] < right.size() * 9 / 10 )
        allowed.add( e.getKey() );
    } );
    System.out.println( fake.stream().filter( s -> s.length() > 2 ).map( s -> s.substring( s.length() - 3 ) ).filter( s -> allowed.contains( s ) ).count() * 100.0 / fake.size() );
    System.out.println( right.stream().filter( s -> s.length() > 2 ).map( s -> s.substring( s.length() - 3 ) ).filter( s -> allowed.contains( s ) ).count() * 100.0 / right.size() );
    System.out.println( allowed.size() );*/
   /* Files.write( Paths.get( "D:\\Hola\\learning.csv" ), s2i( Stream.concat( Stream.of(
      "result" + Stream.concat( Stream.of( "Original" ), Stream.of( ENCODERS ).map( e -> e.getClass().getSimpleName() ) ).map( s -> ';' + s + "Length;" + s + "Hash" ).collect( Collectors.joining() )
    ), Stream.concat( fake.stream().distinct().map( s -> Pair.of( s, false ) ), right.stream().map( s -> Pair.of( s, true ) ) )
      .map( p -> {
        String s = p.getLeft();
        boolean result = p.getRight();
        List< Double > ret = new ArrayList<>();
        ret.add( result ? 1.0 : 0.0 );
        add( ret, s );
        try {
          for ( StringEncoder encoder : ENCODERS )
            add( ret, encoder.encode( s ) );
        } catch ( EncoderException e ) {
          e.printStackTrace();
        }
        return ret.stream().map( d -> d.toString().replace( '.', ',' ) ).collect( Collectors.joining( ";" ) );
      } )
    ) ) );*/
    System.out.println( new TreeMap<>( fake.stream().distinct().collect( Collectors.groupingBy( rethrowFunction( s -> ENCODERS[ 1 ].encode( s ).length() / 100 ), Collectors.counting() ) ) ) );
    System.out.println( new TreeMap<>( right.stream().collect( Collectors.groupingBy( rethrowFunction( s -> ENCODERS[ 1 ].encode( s ).length() / 100 ), Collectors.counting() ) ) ) );
  }
  
  private static void add( List< Double > ret, String s ) {
    ret.add( s.length() / 16.0 );
    ret.add( mod( s.hashCode(), 20011 ) / 20011.0 );
  }
  
  private static int mod( int v, int m ) {
    v %= m;
    if ( v < 0 )
      v += m;
    return v;
  }
  
  public static void generateDeniedSequencesRegex() throws Exception {
    Set< String > fake = new TreeSet<>();
    Set< String > right = new TreeSet<>();
    Files.lines( Paths.get( "D:\\Hola\\long_living_fake.txt" ) ).filter( s -> !s.isEmpty() ).forEach( fake::add );
    Files.lines( Paths.get( "D:\\Hola\\long_living_right.txt" ) ).filter( s -> !s.isEmpty() ).forEach( right::add );
    StringBuilder regex = new StringBuilder();
    for ( int before = 0; before <= 1; before++ ) {
      System.out.println( before == 0 ? "After" : "Before" );
      for ( char checkChar = 'a'; checkChar <= 'z'; checkChar++ ) {
        Pattern p = Pattern.compile( before == 0 ? "(.)" + checkChar : checkChar + "(.)" );
        MultiSet< Character > afterQ = new HashMultiSet<>();
        for ( String s : right ) {
          Matcher m = p.matcher( s );
          int start = 0;
          while ( m.find( start ) ) {
            start = m.end();
            afterQ.add( m.group( 1 ).charAt( 0 ) );
          }
        }
        int partSum[] = new int[ 1 ];
        boolean oneMore[] = new boolean[]{ true };
        Set< Character > allowedChars = new TreeSet<>();
        afterQ.entrySet().stream().sorted( ( e1, e2 ) -> Integer.compare( e2.getCount(), e1.getCount() ) ).forEach( e -> {
          partSum[ 0 ] += e.getCount();
          if ( partSum[ 0 ] < afterQ.size() * 992 / 1000 )
            allowedChars.add( e.getElement() );
          else if ( oneMore[ 0 ] ) {
            allowedChars.add( e.getElement() );
            oneMore[ 0 ] = false;
          }
        } );
        int fakeKills = 0;
        int fakeBorder = 0;
        WordsLoop:
        for ( String s : fake ) {
          Matcher m = p.matcher( s );
          int start = 0;
          while ( m.find( start ) ) {
            start = m.end();
            char c = m.group( 1 ).charAt( 0 );
            if ( !allowedChars.contains( c ) ) {
              fakeKills++;
              continue WordsLoop;
            }
          }
          if ( s.charAt( before == 0 ? 0 : s.length() - 1 ) == checkChar )
            fakeBorder++;
        }
        int rightKills = 0;
        int rightBorder = 0;
        WordsLoop:
        for ( String s : right ) {
          Matcher m = p.matcher( s );
          int start = 0;
          while ( m.find( start ) ) {
            start = m.end();
            char c = m.group( 1 ).charAt( 0 );
            if ( !allowedChars.contains( c ) ) {
              rightKills++;
              continue WordsLoop;
            }
          }
          if ( s.charAt( before == 0 ? 0 : s.length() - 1 ) == checkChar )
            rightBorder++;
        }
        boolean killAtBorder = false;
        if ( fakeBorder > rightBorder ) {
        //if ( ( fakeBorder + fakeKills ) / ( rightBorder + rightKills ) > fakeKills / rightKills ) {
          fakeKills += fakeBorder;
          rightKills += rightBorder;
          killAtBorder = true;
        }
        if ( fakeKills > rightKills * 6 ) {
          System.out.println( checkChar + ": " + fakeKills + " / " + rightKills + " = " + ( rightKills == 0 ? 0 : fakeKills / rightKills ) + ", size = " + allowedChars.size() + ", " + ( killAtBorder ? "" : "do not " ) + "kill at " + ( before == 0 ? "start" : "end" ) );
          regex.append( regex.length() > 0 ? '|' : '(' );
          if ( before == 1 )
            regex.append( checkChar );
          if ( killAtBorder )
            regex.append( '(' );
          regex.append( "[^" );
          for ( char c : allowedChars )
            regex.append( c );
          regex.append( ']' );
          if ( killAtBorder )
            regex.append( '|' ).append( before == 0 ? '^' : '$' ).append( ')' );
          if ( before == 0 )
            regex.append( checkChar );
        }
      }
    }
    regex.append( ')' );
    System.out.println( regex );
  }
  
  private static < T > Iterable< T > s2i( Stream< T > s ) {
    return s::iterator;
  }
  
  private static int[] cvq( String s ) {
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
  
  private static boolean isVowel( String s, int pos ) {
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

  private static Stream< String > getSubstrings( String s ) {
    List< String > ret = new ArrayList<>();
    for ( int len = 1; len < s.length(); len++ )
      for ( int i = 0; i <= s.length() - len; i += len )
        ret.add( s.substring( i, i + len ) );
    return ret.stream();
  }
}