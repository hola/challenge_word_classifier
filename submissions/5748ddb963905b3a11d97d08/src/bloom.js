(function(exports) {
  exports.init = init;

  var bloomfilter = require('bloomfilter');

  function init(data, offset){
    var bloom;
    var bloomdata = buffer_to_int_array(data, offset);
    var arr_len = bloomdata.length;
    var n_hash_functions = bloomdata[arr_len - 1];
    //console.log(arr_len, n_hash_functions);
    bloom = new bloomfilter.BloomFilter(bloomdata.slice(0, arr_len - 1), n_hash_functions);
    return bloom
  }

  function buffer_to_int_array(buffer, offset){
    //assert that type is ArrayBuffer
    var ret = [];
    var size = buffer.readInt32BE(offset);
    var index = 1; 
    for(index; index < size/4; index++){
      ret.push(buffer.readInt32BE(offset + index*4));//factor of 4 because one Int32 takes 4 octets
    }
    return ret;
  };
})(typeof exports !== "undefined" ? exports : this);
