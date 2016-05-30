var fs = require('fs');
var zlib = require('zlib');
var main = require('./solution');
var settings = require('./settings');

//console.log( main );return;

main.init( zlib.gunzipSync( fs.readFileSync( "./data.gz" ) ) );

if ( settings.bCreateBloomList ) {
  test_canonical = {};
  var words = fs.readFileSync( "./words.txt" ).toString().split( "\n" );
  for ( word of words ) {
    test_canonical[ word ] = true;
  }
  test = test_canonical;
  //eval( "test = " + fs.readFileSync( "./test_data_original_.json" ).toString() + ";" );
  //console.log( s );
} else {
  //eval( "test = " + fs.readFileSync( "./test_data_original.json" ).toString() + ";" );
  eval( "test = " + fs.readFileSync( "./test_data_original_.json" ).toString() + ";" );
  test_canonical = {};
  var words = fs.readFileSync( "./bloom_words_after_transformations.txt" ).toString().split( "\n" );
  for ( word of words ) {
    test_canonical[ word ] = true;
  }
}

var counter = 0;
var match_counter = 0;
var confirmed_positive = 0;
var confirmed_negative = 0;
var false_positive = 0;
var false_negative = 0;
var bloomed_dict = 0;
var bloomed_nondict = 0;
var bloomed_nondict_as_dict = 0;
var bloom_fail = 0;
var bloom_fail_false_positive = 0;
var bloom_fail_false_negative = 0;

a="";

//main.test( "ing" );return;

function process_message( message ) {
  if ( message.command === "test" ) {
    var i = 0;
    for ( key in test ) {
      //console.log( key );
      i++;
      if ( ( i % message.step ) !== message.number ) continue;
      //if ( counter > 1000 ) break;

      var bMatch = main.test( String( key ) );

      // creation of bloom-dependent word list

      if ( settings.bCreateBloomList ) {
        if ( typeof bMatch === "string" && test_canonical[ key ] ) {
          var bloomed_string = bMatch.toString().replace(/\{/g,'\'');
          if ( bloomed_string === key ) {
            // else conversions made a non-dict word
            console.log( bloomed_string );
            //bloomed_string = key;
          }
          //console.log( key );
        }
        continue;
      }

      //console.log( a );
      if ( o != u ) { // bloom table was used in test()
        if ( test[ key ] ) {
          bloomed_dict++;
        } else {
          bloomed_nondict++;
          if ( test_canonical[ a ] ) {
            bloomed_nondict_as_dict++;
          }
        }
        if ( bMatch && !test[ key ] ) {
          //console.log( key );
          bloom_fail++;
          bloom_fail_false_positive++;
        } else if ( !bMatch && test[ key ] ) {
          bloom_fail++;
          bloom_fail_false_negative++;
        }
      }

      if ( bMatch ) {
        match_counter++;
        if ( test[ key ] ) {
          confirmed_positive++;
        } else {
          false_positive++;
        }
      } else {
        if ( test[ key ] ) {
          //if((j=key.indexOf("'"))>-1&&j!=1&&j!=2&&j!=key.length-2&&j!=key.length-3){        console.log( key );      }
          //console.log( key );
          false_negative++;
          //console.log( key.split('').reverse().join('') + "     " + key );
          //console.log( key );
          //console.log( "+" + key );
        } else {
          confirmed_negative++;
        }
      }
      counter++;
    }
    process.send( { 
      command: "result",
      counter,
      match_counter,
      confirmed_positive,
      confirmed_negative,
      false_positive,
      false_negative,
      bloomed_dict,
      bloomed_nondict,
      bloom_fail,
      bloom_fail_false_positive,
      bloom_fail_false_negative,
      bloomed_nondict_as_dict,
    } );
  }
}

process.on( "message", process_message );

