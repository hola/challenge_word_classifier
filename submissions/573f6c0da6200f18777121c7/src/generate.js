'use strict'

imports:

    var fs = require('fs')
    var zlib = require('zlib')
    var solution = require('./solution')

dictionary_generation:

    var dict = new Uint8Array( solution.size );

    var prefixes = new Map

    /*var xxx = {}
    fs.readFileSync( 'unique.txt' ).toString()
    .split( '\n' )
    .map( word => word.length )
    .forEach( length => {
        xxx[ length ] = ( xxx[ length ] || 0 ) + 1
    } )
    console.log(xxx)

    var xxx = {}
    fs.readFileSync( 'nowords.txt' ).toString()
    .split( '\n' )
    .map( word => word.length )
    .forEach( length => {
        xxx[ length ] = ( xxx[ length ] || 0 ) + 1
    } )
    console.log(xxx)*/

    fs.readFileSync( 'unique.txt' ).toString()
    .split( '\n' )
    .forEach( word => {
        solution.hashes.forEach( hash => {
            var index = hash( word )
            dict[ Math.floor( index / 8 ) ] |= ( 1 << ( index % 8 ) )
        } )
    } )

    var gzOptions = { chunkSize : 1024*1024 , level : 9 , strategy : 3 }
    fs.writeFileSync( 'dict.bin.gz' , zlib.gzipSync( Buffer( dict ) , gzOptions ) )

solution_testion:

    solution.init( zlib.gunzipSync( fs.readFileSync( 'dict.bin.gz' ) ) )

    var stat = { 'true' : { 'true' : 0 , 'false' : 0 } , 'false' : { 'true' : 0 , 'false' : 0 } }

    var words = {
        'true' : fs.readFileSync( 'words.txt' ).toString().toLowerCase().trim().split('\n') ,
        'false' : fs.readFileSync( 'nowords.txt' ).toString().toLowerCase().trim().split('\n')
    }
    var www = {}
    words['true'].forEach( word => {
        www[ word ] = true
    })
    var test = {__proto__:null}
    for( var i = 0 ; i < 1000000 ; ++i ) {
        var answer = Math.random() >= .5
        var word = words[ answer ][ Math.floor( Math.random() * words[ answer ].length ) ]
        test[ word ] = www[ word ] || false
    }
    //var test = JSON.parse( fs.readFileSync( 'test.json' ).toString() )

    for( var word in test ) ++ stat[ test[ word ] ][ solution.test( word ) ]

    console.log( stat )
    console.log( ( stat['true']['true'] + stat['false']['false'] ) * 100 / Object.keys( test ).length )
