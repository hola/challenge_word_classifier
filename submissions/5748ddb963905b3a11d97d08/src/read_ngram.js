(function(exports) {
  exports.buffer_to_ngram = buffer_to_ngram;

  function buffer_to_ngram(buffer, offset){
     //assert that type is ArrayBuffer
     var ret = {} 
     var text = buffer.toString(undefined, offset);
     var lines = text.split('\n');
     lines.forEach(function(line) {
       var lineparts = line.split(/\s+/); 
       var value = +(lineparts[0]);
       var str_arr = lineparts.slice(1);
       //console.log(value, str_arr);
       str_arr.forEach(function(str){
          ret[str] = value;
       });
     }); 
     return ret;
  };
})(typeof exports !== "undefined" ? exports : this);
