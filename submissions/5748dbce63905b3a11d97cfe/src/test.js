var fs = require('fs');
var settings = require('./settings');

//console.log( fs.readFileSync( "./data.dat" ) );
//console.log( zlib.gunzipSync( fs.readFileSync( "./data.dat" ) ) );
//return;

/*
test_canonical = {};
var words = fs.readFileSync( "./words.txt" ).toString().split( "\n" );
for ( word of words ) {
  test_canonical[ word ] = true;
}
*/

var child_process = require( 'child_process' );
var numCPUs = //1;
( settings.bTrace ? 1 : require('os').cpus().length );

//console.log( t );return;

//console.log( main.test( "achuas's" ) ); return;

//console.log( h );return;
//console.log( b.length );return;
var counter = 0;
var match_counter = 0;
var confirmed_positive = 0;
var confirmed_negative = 0;
var false_positive = 0;
var false_negative = 0;
var bloomed_dict = 0;
var bloomed_nondict = 0;
var bloom_fail = 0;
var bloom_fail_false_positive = 0;
var bloom_fail_false_negative = 0;

var workers = [];

var result = {};
var workers_ended = 0;
function worker_message( message ) {
  if ( message.command === "result" ) {
    //console.log( message );
    for ( variable_name in message ) {
      if ( variable_name !== "command" ) {
        if ( result[ variable_name ] === undefined ) {
          result[ variable_name ] = 0;
        }
        result[ variable_name ] += message[ variable_name ];
      }
    }
    workers_ended++;
    if ( workers_ended == workers.length ) {
      for ( worker of workers ) {
        worker.kill();
      }
      result.bloomed = result.bloomed_dict + result.bloomed_nondict;
      if ( !settings.bCreateBloomList ) {
        console.log( "Total: " + result.counter +
          "\nMatch: " + ( result.match_counter / result.counter ) + " (" + result.match_counter +
          ")\nConfirmed positive: " + ( result.confirmed_positive / result.counter ) + " ("  + result.confirmed_positive +
          ")\nConfirmed negative: " + ( result.confirmed_negative / result.counter ) + " ("  + result.confirmed_negative +
          ")\nBloomed dict: " + ( result.bloomed_dict / result.bloomed ) + " ("  + result.bloomed_dict +
          ")\nBloomed nondict: " + ( result.bloomed_nondict / result.bloomed ) + " ("  + result.bloomed_nondict +
          ")\nNondict as bloom positive: " + ( result.bloomed_nondict_as_dict / result.bloomed_nondict ) + " ("  + result.bloomed_nondict_as_dict +
          ")\nBloom fail false positive unadjusted: " + ( result.bloom_fail_false_positive / result.bloomed ) + " ("  + result.bloom_fail_false_positive +
          ")\nBloom fail false positive: " + ( ( result.bloom_fail_false_positive - result.bloomed_nondict_as_dict ) / result.bloomed ) + " ("  + ( result.bloom_fail_false_positive - result.bloomed_nondict_as_dict ) +
          ")\nBloom fail false negative: " + ( result.bloom_fail_false_negative / result.bloomed ) + " ("  + result.bloom_fail_false_negative +
          ")\nBloom fail: " + ( result.bloom_fail / result.bloomed ) + " ("  + result.bloom_fail +
          ")\nFalse positive: " + ( result.false_positive / result.counter ) + " ("  + result.false_positive +
          ")\nFalse negative: " + ( result.false_negative / result.counter ) + " ("  + result.false_negative +
          ")\nTotal error: " + ( ( result.false_positive + result.false_negative ) / result.counter ) + " ("  + ( result.false_positive + result.false_negative ) + ")\n" );
      }
      process.exit();
    }
  }
}

for ( let i = 0; i < numCPUs; i++ ) {
  let worker = child_process.fork( "./test_worker" );
  workers[ i ] = worker;
  worker.on( "message", worker_message );
  worker.send( {
    command: "test",
    number: i,
    step: numCPUs,
  } );
}

