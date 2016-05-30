var fs = require('fs');
var zlib = require('zlib');
var settings = require('./settings');

// engine code compression

var engine = ";" + fs.readFileSync( "./engine.js" ).toString(); // ";" prefix allows using "0+" below
engine = engine.replace( /\/\*inline skip\*\/[^]*?\/\*inline skip\*\//gm, "" );
engine = engine.replace( /\/\*inline add\*\/\/\*([^]*?)\*\/\/\*inline add\*\//gm, "$1" );
var inline1 = engine.match( /\/\*inline 1 start\*\/[^]*\/\*inline 1 end\*\//gm );
if ( inline1 ) {
  inline1 = inline1[ 0 ].replace( /(\/\*inline 1 start\*\/)|(\*\/inline 1 end\*\/)/gm, "" );
  engine = engine.replace( /\/\*inline 1 start\*\/[^]*\/\*inline 1 end\*\//gm, "" );
  engine = engine.replace( /\/\*inline 1\*\//gm, inline1 );
}
engine = engine.replace( / of /g, "====of====" );
engine = engine.replace( /\/\* \*\//g, "====space====" );
if ( settings.bTrace ) {
  engine = engine.replace( /\/\*\*/g, "" );
  engine = engine.replace( /\*\*\//g, "" );
}
if ( settings.bCreateBloomList ) {
  engine = engine.replace( /\/\*bloom/g, "" );
  engine = engine.replace( /bloom\*\//g, "" );
}
if ( settings.bTestable ) {
  engine = engine.replace( /\/\*testable/g, "" );
  engine = engine.replace( /testable\*\//g, "" );
}
engine = engine.replace( /\/\*.*\*\//g, "" );
engine = engine.replace( /\s/g, "" );
engine = engine.replace( /\r/g, "" );
engine = engine.replace( /\n/g, "" );
engine = engine.replace( /\t/g, "" );
engine = engine.replace( /\=\=\=\=of\=\=\=\=/g, " of " );
engine = engine.replace( /\=\=\=\=space\=\=\=\=/g, " " );
fs.writeFileSync( "./engine.min.js", engine );

// concatenating nonpairs and bloom bit tables

var buff = Buffer.concat( [ 
  Buffer.from( engine ),
  fs.readFileSync( "./transformations.dat" ),
  Buffer.from( [ 0x00 ] ), // transformations terminator
  fs.readFileSync( "./nonpairs.txt" ),
  fs.readFileSync( "./bloom.txt" )
] );

// compressing data

fs.writeFileSync( "./data.gz", zlib.gzipSync( buff, {
  level: zlib.Z_BEST_COMPRESSION,
  memLevel: 9,
  //strategy: zlib.Z_RLE,
  //strategy: zlib.Z_FILTERED,
  //strategy: zlib.Z_HUFFMAN_ONLY, //+++
  //strategy: zlib.Z_FIXED,
  //strategy: zlib.Z_DEFAULT_STRATEGY
} ) );

/*
fs.writeFileSync( "./data_naked.dat", zlib.gzipSync( fs.readFileSync( "./bloom.txt" ), {
  level: zlib.Z_BEST_COMPRESSION,
  memLevel: 9,
  strategy: zlib.Z_RLE,
  //strategy: zlib.Z_DEFAULT_STRATEGY
} ) );
*/

// creating bootstrap code

fs.writeFileSync( "./solution.js", 
  
  // shortest way to bootstrap
  // "0+" converts Buffer to String
  // if we can't use l.test=q since q is not defined before init() call then the following should be used
  //"(l=exports).init=b=>eval(0+b.slice(0,o=" + engine.length + "));l.test=b=>q(b)"
  // but having canonical test program we know that the following will work (l.test is defined in the compressed block):
  "(l=exports).init=b=>eval(0+b.slice(0,o=" + engine.length + "))"
  // using "exports.test" instead of "l.test" in the engine makes it less compressible and consumes exactly 4 bytes back

);
