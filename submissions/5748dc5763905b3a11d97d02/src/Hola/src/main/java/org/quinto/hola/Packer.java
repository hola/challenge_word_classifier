package org.quinto.hola;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Iterator;
import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import org.apache.commons.lang3.StringUtils;

public class Packer {
  public static void main( String... args ) throws Exception {
    String p[] = new String[ 1 ];
    Files.write( Paths.get( "D:\\Hola\\roots_encoded.txt" ),
      s2i( Files.lines( Paths.get( "D:\\Hola\\roots.txt" ) )
                .map( s -> {
                  String pp = p[ 0 ];
                  p[ 0 ] = s;
                  if ( pp != null ) {
                    int c = getCommonLength( s, pp );
                    s = StringUtils.leftPad( "", c ) + s.substring( c );
                  }
                  return s;
                } ) ) );
  }
  
  private static < T > Iterable< T > s2i( Stream< T > s ) {
    return s::iterator;
  }

  private static int getCommonLength( String s, String pp ) {
    for ( int i = 0; i < Math.min( s.length(), pp.length() ); i++ ) {
      if ( s.charAt( i ) != pp.charAt( i ) )
        return i;
    }
    return Math.min( s.length(), pp.length() );
  }
}