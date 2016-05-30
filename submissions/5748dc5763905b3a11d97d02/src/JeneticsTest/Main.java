package org.quinto.ldap.jeneticstest;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Consumer;
import java.util.stream.Collectors;
import org.jenetics.GaussianMutator;
import org.jenetics.Genotype;
import org.jenetics.IntegerChromosome;
import org.jenetics.IntegerGene;
import org.jenetics.MultiPointCrossover;
import org.jenetics.Optimize;
import org.jenetics.engine.Engine;
import org.jenetics.engine.EvolutionResult;
import org.jenetics.engine.EvolutionStatistics;
import org.jenetics.util.Factory;

public class Main {
  static List< String > words;
  static List< List< Integer > > allPrefixes;
  static List< List< Integer > > allRoots;
  static List< List< Integer > > allPostfixes;
  static int lengths[];
  
  public static void main( String... args ) throws Exception {
    words = Files
      .lines( Paths.get( args.length == 0 ? "D:\\Hola\\words.txt" : args[ 0 ] ) )
      //.lines( Paths.get( "D:\\compress\\words_short.txt" ) )
      .map( s -> s.trim().toLowerCase() )
      .filter( s -> !s.isEmpty() && s.indexOf( '\'' ) < 0 && s.length() < 17 )
      .distinct()
      .sorted()
      .limit( args.length <= 1 ? 1000000 : Integer.parseInt( args[ 1 ] ) )
      .collect( Collectors.toList() );
    System.out.println( words.size() );
    
    allPrefixes = new ArrayList<>( words.size() );
    allRoots = new ArrayList<>( words.size() );
    allPostfixes = new ArrayList<>( words.size() );
    Map< String, Integer > substrs = new HashMap<>();
    for ( int i = 0; i < words.size(); i++ ) {
      String word = words.get( i );
      int len = word.length();
      int max = ( len + 1 ) * ( len + 2 ) / 2 - 1;
      List< Integer > prefixes = new ArrayList<>();
      List< Integer > roots = new ArrayList<>();
      List< Integer > postfixes = new ArrayList<>();
      for ( int pos = 0; pos <= max; pos++ ) {
        int preLen = len - ( int )( ( Math.sqrt( ( max - pos ) * 8 + 1 ) - 1.0 ) / 2.0 );
        int postLen = ( len * 2 - preLen + 2 ) * ( preLen + 1 ) / 2 - 1 - pos;
        String prefix = word.substring( 0, preLen );
        Integer idx = substrs.get( prefix );
        if ( idx == null )
          substrs.put( prefix, idx = substrs.size() );
        prefixes.add( idx );
        String root = word.substring( preLen, len - postLen );
        idx = substrs.get( root );
        if ( idx == null )
          substrs.put( root, idx = substrs.size() );
        roots.add( idx );
        String postfix = word.substring( len - postLen );
        idx = substrs.get( postfix );
        if ( idx == null )
          substrs.put( postfix, idx = substrs.size() );
        postfixes.add( idx );
      }
      allPrefixes.add( prefixes );
      allRoots.add( roots );
      allPostfixes.add( postfixes );
    }
    lengths = new int[ substrs.size() ];
    substrs.entrySet().stream().forEach( ( Map.Entry< String, Integer > e ) -> lengths[ e.getValue() ] = e.getKey().length() );
    substrs.clear();
    System.out.println( "prepared" );
    
    List< IntegerChromosome > chromosomes = words
      .stream()
      //.peek( s -> System.out.println( ( s.length() + 1 ) * ( s.length() + 2 ) / 2 - 1 ) )
      .map( s -> IntegerChromosome.of( 0, ( s.length() + 1 ) * ( s.length() + 2 ) / 2 - 1 ) )
      .collect( Collectors.toList() );
    //System.out.println( chromosomes );
    
    Factory< Genotype< IntegerGene > > gtf = Genotype.of( chromosomes );
    chromosomes.clear();

    Engine< IntegerGene, Integer > engine = Engine
      .builder( gt -> new Solution( gt, false ).commonSize(), gtf )
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
    System.out.println( new Solution( result.getBestPhenotype().getGenotype(), false ) );
    System.out.println( result.getBestPhenotype().getFitness() + " / " + words.stream().mapToInt( s -> s.length() ).sum() );
  }

  private static class Solution {
    Set< Integer > prefixes = new HashSet<>();
    Set< Integer > roots = new HashSet<>();
    Set< Integer > postfixes = new HashSet<>();

    public Solution( Genotype< IntegerGene > gt, boolean finalOne ) {
      int length = gt.length();
      for ( int i = 0; i < length; i++ ) {
        IntegerChromosome chromosome = ( IntegerChromosome )gt.getChromosome( i );
        int pos = chromosome.intValue();
        Integer prefix = allPrefixes.get( i ).get( pos );
        Integer root = allRoots.get( i ).get( pos );
        Integer postfix = allPostfixes.get( i ).get( pos );
        if ( finalOne )
          System.out.println( prefix + '-' + root + '-' + postfix );
        prefixes.add( prefix );
        roots.add( root );
        postfixes.add( postfix );
      }
    }
    
    public int commonSize() {
      return prefixes.stream().mapToInt( i -> lengths[ i ] ).sum() +
             roots.stream().mapToInt( i -> lengths[ i ] ).sum() +
             postfixes.stream().mapToInt( i -> lengths[ i ] ).sum();
     // return prefixes.size() + roots.size() + postfixes.size();
    }

    @Override
    public String toString() {
      return "prefixes( " + prefixes.size() + " ) = " + /*prefixes.stream().limit( 100 ).collect( Collectors.joining( ", " ) ) +*/ '\n'
           + "roots( " + roots.size() + " ) = " + /*roots.stream().limit( 100 ).collect( Collectors.joining( ", " ) ) +*/ '\n'
           + "postfixes( " + postfixes.size() + " ) = " /*+ postfixes.stream().limit( 100 ).collect( Collectors.joining( ", " ) )*/;
    }
  }
}