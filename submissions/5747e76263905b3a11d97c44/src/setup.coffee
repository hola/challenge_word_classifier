#!/usr/bin/iced
require 'fy'
fs = require 'fs'
assert = require 'assert'
{
  ProgressBar
} = require 'progress'
# ###################################################################################################
module.exports = (config, cb)->
  _validation_list_get = null
  validation_list_get = (cb)->
    if _validation_list_get?
      return cb null, _validation_list_get
    tic()
    await fs.readFile "./validation_list.json", defer err, blob_txt
    return cb err if err
    validation_pair_list = JSON.parse blob_txt
    ptoc()
    _validation_list_get = validation_pair_list
    cb null, _validation_list_get
    return

  await fs.exists "./validation_count.buffer", defer res1
  await fs.exists "./validation_word.buffer", defer res2

  # if config.compact
    # await fs.readFile config.compact.file, defer err, compact_str ; return cb err if err
    # config.compact.compact_hash = compact_hash = JSON.parse compact_str
  if res1 and res2
    await fs.readFile './validation_count.buffer', defer err, count_map_buffer  ; return cb err if err
    await fs.readFile './validation_word.buffer',  defer err, word_buffer       ; return cb err if err
    assert count_map_buffer.length/4 == word_buffer.length/config.word_max_length
    
    word_base_size = count_map_buffer.length / 4
  else
    await validation_list_get defer err, validation_pair_list                   ; return cb err if err
    # validation_pair_list = validation_pair_list.slice(0, 131072+1024*64+1024)
    # validation_pair_list = validation_pair_list.slice(0, 2*131072)
    # validation_pair_list = validation_pair_list.slice(0, 131072)
    # validation_pair_list = validation_pair_list.slice(0, 131072/8)
    
    read_idx = 0
    
    pb = new ProgressBar
    pb.init validation_pair_list.length/2
    for i in [0 ... validation_pair_list.length/2]
      pb.set()
      word = validation_pair_list[read_idx]
      if word.length > config.word_max_length
        validation_pair_list[read_idx] = word.substr(0, config.word_max_length)
      read_idx+=2
    pb.end()
    
    # if config.compact
      # validation_pair_list_filtered = []
      # read_idx = 0
      # pass_fn = (w)->
        # for L in [0 ... config.compact.max_len]
          # for o in [0 ... w.length-L-1]
            # if LL=compact_hash[w.substr(o,L)]
              # if !LL[o]
                # return false
        
        # return true
      # pb = new ProgressBar
      # pb.init validation_pair_list.length/2
      # for i in [0 ... validation_pair_list.length/2]
        # pb.set()
        # word  = validation_pair_list[read_idx++]
        # count = +validation_pair_list[read_idx++]
        # word  = word.replace /\'/g, '`'
        # global.gc?() if i % 100000 == 0
        # continue if !pass_fn word
        # validation_pair_list_filtered.push word
        # validation_pair_list_filtered.push count
      # pb.end()
      # validation_pair_list = validation_pair_list_filtered
    
    word_base_size_it = validation_pair_list.length / 2
    word_base_size = Math.ceil(word_base_size_it/4)*4 # FIX for int4. uchar4
    
    
    count_map_buffer = new Buffer 4*word_base_size
    count_map_buffer.fill 0
    word_buffer = new Buffer word_base_size*config.word_max_length
    word_buffer.fill 0
    
    
    pb = new ProgressBar
    pb.init word_base_size_it
    read_idx = 0
    # sum_pos = 0
    # sum_neg = 0
    for i in [0 ... word_base_size_it]
      pb.set()
      word  = validation_pair_list[read_idx++]
      count = +validation_pair_list[read_idx++]
      word  = word.replace /\'/g, '`' # DUPE, but sorry
      
      count_map_buffer.writeInt32LE count, i*4
      offset = i*config.word_max_length
      for ch in word
        word_buffer[offset++] = ch.charCodeAt(0)
    pb.end()
    # p "sum_pos=#{sum_pos}"
    # p "sum_neg=#{sum_neg}"
    # xxx
    await fs.writeFile './validation_count.buffer', count_map_buffer, defer(err); return cb err if err
    await fs.writeFile './validation_word.buffer', word_buffer,       defer(err); return cb err if err
    p "write completed"
  
  cb null, {word_base_size, count_map_buffer, word_buffer}
  return
    

