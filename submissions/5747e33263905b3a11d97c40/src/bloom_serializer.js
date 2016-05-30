const fs = require('fs');

function exportFilters(filters, file){
  var offset = 0;

  fs.open(file, 'w', (err, fd) => {
    if (err) {
      throw `error opening file: ${err}`;
    }
    
    var buffer = buildBuffer(filters);

    fs.write(fd, buffer, 0, buffer.length, 0, (err) => {
      if (err) {
        throw `error writing file: ${err}`;
      }

      fs.close(fd, () => {
        console.log(`file ${file} written`);
      })
    })
  });
}

function buildBuffer(filters){
  var offset = 0,
      totalSize = 0,
      buffer,
      buffers = [];

  filters.forEach((f) => {
     var b = Buffer.alloc(4);
     b.writeInt32LE(f.bitBuffer.length);
     buffers.push(b); 
     totalSize = totalSize + f.bitBuffer.length + 4 
  })

  filters.forEach((f) => {
    buffers.push(f.bitBuffer);
  })
    
  return Buffer.concat(buffers, totalSize);
}

function importFilters(file, count = 4){
   var data = fs.readFileSync(file);
   var buffer = new Buffer(data);
   var bitBuffers = [],
       offset = 0,
       sizes = [];

   for(var i = 0; i < count; i++){
     sizes.push(buffer.readInt32LE(offset));
     offset = offset + 4;
   }

   for(var i = 0; i < count; i++){
     var bitBuffer = Buffer.alloc(sizes[i]);

     buffer.copy(bitBuffer, 0, offset, offset + bitBuffer.length);
     offset = offset + bitBuffer.length;
     bitBuffers.push(bitBuffer)

     //var filter = Filter.loadFromFile(`${i+1}.bloom`, i+1)
     //console.log(`${bitBuffer.compare(filter.bitBuffer)} : ${i+ 1} : ${filter.bitBuffer.toString() == bitBuffer.toString()}`)
   }

  return bitBuffers;
}


module.exports = {
  exportFilters:  exportFilters,
  importFilters:  importFilters
}
