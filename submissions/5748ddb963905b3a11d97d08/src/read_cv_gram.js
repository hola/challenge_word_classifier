(function(exports) {
  exports.buffer_to_cv_gram = buffer_to_cv_gram;

  function buffer_to_cv_gram(buffer, offset){
     //assert that type is ArrayBuffer
     var ret = {} 
     var end = offset + buffer.readInt32BE(offset);
     offset += 4; //add size is 4 octets
     while(offset < end){ 
          var keylen = buffer.readInt8(offset);
          buffer.writeInt8(keylen, offset); 
          offset += 1; //int8 is just 1 byte

          var key = buffer.toString(undefined, offset, offset+keylen); 
          offset += keylen;

          var value = buffer.readFloatBE(offset);
          offset += 4; //float is 4 bytes 

          //console.log(keylen, key, value); 
          ret[key] = value;
      }  
      return ret;
  };
})(typeof exports !== "undefined" ? exports : this);
