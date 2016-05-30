package org.quinto.holatests;

import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.SecureRandom;

public class Downloader {
  public static void main( String... args ) throws Exception {
    SecureRandom r = new SecureRandom();
    byte bytes[] = new byte[ 8 ];
    for ( int i = 0; i < 100000; i++ ) {
      r.nextBytes( bytes );
      long n = ( ( long )bytes[ 0 ] << 56 ) + ( ( long )bytes[ 1 ] << 48 ) + ( ( long )bytes[ 2 ] << 40 ) + ( ( long )bytes[ 3 ] << 32 ) + ( ( long )bytes[ 4 ] << 24 ) + ( ( long )bytes[ 5 ] << 16 ) + ( ( long )bytes[ 6 ] << 8 ) + ( long )bytes[ 7 ];
      try ( InputStream is = new URL( "https://hola.org/challenges/word_classifier/testcase/" + n ).openStream() ) {
        Path target = Paths.get( "D:\\HolaTests\\output\\" + n );
        Files.copy( is, target, StandardCopyOption.REPLACE_EXISTING );
      }
    }
  }
}