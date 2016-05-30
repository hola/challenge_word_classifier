'use strict'
var size = exports.size = 83000
var dict
var hashes = exports.hashes = [ 29 ].map( seed => word => {
    if( word.length < 4 || word.length > 14 ) return -1
    word = word.toLowerCase()
    .replace( /(^[od]'|'?[s]$)/g , '' )
    .replace( /'/g , '' )
    .substring( 0 , 6 )
    var result = 1
    for( var i = 0 ; i < word.length ; ++i ) {
        result = ( seed * result + word.charCodeAt( i ) ) % ( size * 8 )
    }
    return result
} )
exports.init = data => { dict = new Uint8Array( data ) }
exports.test = word => {
    if( word.length < 3 ) return true
    return hashes.every( hash => {
        var index = hash( word )
        return dict[ Math.floor( index / 8 ) ] & ( 1 << ( index % 8 ) )
    } )
}
