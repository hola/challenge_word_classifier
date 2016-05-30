module = @
fs = require 'fs'
{
  ProgressBar
} = require 'progress'

require 'codegen'
class @Feature
  # decision_size : 0
  name     : ''
  clap_min : 0
  clap_max : 255
  code     : "" # opencl
  decl_js  :  {}
  js_code  : ""
  kernel   : ''
  constructor:()->
    @decl_js = {}
  
  feature_offset : 0
  range_get: ()->@clap_max - @clap_min + 1
  init     : (@config, @gpu_b, on_end)->
    code = @code config
    @kernel = config.ctx.kernel
      name        : 'feature_to_map'
      kernel_str  : kernel_str = 
        """
        #pragma OPENCL EXTENSION cl_amd_media_ops : enable
        #pragma OPENCL EXTENSION cl_amd_media_ops2: enable
        
        __kernel void main( 
                            __global uchar *b_word,
                            const uint      map_offset,
                            __global  char *out
                            )
        {
          uint id = get_global_id(0);
          
          uint from   = id*#{config.feature.word_per_thread}u;
          uint to     = min(from + #{config.feature.word_per_thread}u, #{config.word_base_size}u);
          
          if (from >= #{config.word_base_size}u) return;
          
          for(;from<to;from++) {
            uint word_offset = from*#{config.word_max_length}u;
            char res = 0;
            #{make_tab code, '    '}
            out[map_offset+from] = res;
          }
        }
        """
      arg_list_fn  : ()=>
        # p "gpu.map_offset=", @feature_offset*config.word_base_size
        ret = [
          gpu_b.b_word
          @feature_offset*config.word_base_size
          gpu_b.b_map
        ]
      thread_count: config.feature.thread_count
      work_size   : config.feature.work_size
    # p kernel_str
    # p "thread_count   =",config.feature.thread_count
    # p "word_per_thread=",config.feature.word_per_thread
    # p "thread_count*word_per_thread=",config.feature.word_per_thread*config.feature.thread_count
    # p "word_base_size =",config.word_base_size
    await @kernel.init defer err                                           ; return on_end err if err
    
    on_end null
    return
  go : (@feature_offset, on_end)->
    await @kernel.go defer err                                            ; return on_end err if err
    
    on_end null
  verify : (on_end)->
    p "verify #{@name}"
    await @gpu_b.b_map.move defer err ; return on_end err if err
    buf = @gpu_b.b_map.host_buffer
    decl_list = (v for k,v of @decl_js)
    fn_code = """
      #{decl_list.join '\n'}
      r=function(w) {
        w=w.replace(/\\'/g,'`');
        return #{@js_code}
      }
      """
    fn = eval fn_code
    found = false
    limit = 100
    for offset in [0 ... buf.length/4/@config.map_count]
    # for offset in [8680000 ... buf.length/4/@config.map_count] # FASTER
      # p "read_offset=#{(offset + @config.word_base_size*@feature_offset)}"
      value = buf.readInt8 (offset + @config.word_base_size*@feature_offset)
      word = @gpu_b.b_word.host_buffer.slice(start = offset*@config.word_max_length, end = start + @config.word_max_length).toString().replace /\0/g, ''
      expected_result = +fn word
      if offset % 10000 == 0
        p "offset=#{offset}"
        global.gc()
      if value != expected_result
        p "#{@name} #{offset.ljust 10} '#{word.ljust 40}' #{value} != #{expected_result}"
        found = true
      xxx if 0 == limit--
    p "done"
    xxx
    throw new Error "verify fail @#{@name}" if found
    on_end null
# ###################################################################################################
#    Generators
# ###################################################################################################
# TODO вынести clapping code от в module.Feature что б точно была обрезка
# ###################################################################################################
#    decl_js
# ###################################################################################################
# TODO 0,4 may be optimized into letter_count, so no L,H params needed
decl_js = 
  clap            : "function c(a,l,h){return (a<l)?0:(a>h)?h-l:a-l};"
  letter_count    : "m=function(w,a,l,h){return c((w.match(a)||[]).length,l,h)};"
  letter_count_nc : "mn=function(w,a){return (w.match(a)||[]).length};"
regch = (ch)->
  "/#{RegExp.escape ch}/g"
regch_any = (ch)->
  "/[#{RegExp.escape ch}]/g"
# ###################################################################################################
#    trash
# ###################################################################################################

@zero = ()->
  ret = new module.Feature
  ret.name = "zero"
  ret.clap_min = 0
  ret.clap_max = 0
  ret.js_code = """
    false
    """
  ret.code = (config)->
    """
    res = 0;
    """
  
  ret

# NOT needed, because more flexible letter_count_sum
@letter_count = (ch, min, max)->
  code = ch.charCodeAt 0
  ret = new module.Feature
  ret.name = "letter_count(#{ch})[#{min},#{max}]"
  ret.clap_min = min
  ret.clap_max = max
  ret.code = (config)->
    """
    uint i;
    for(i=0;i<#{config.word_max_length};i++) {
      uint ch = b_word[word_offset + i];
      res = (ch==#{code})?res+1:res;
    }
    res = min(res, (char)#{max});
    res = max(res, (char)#{min});
    res -= #{min};
    """
  ret.decl_js.clap          = decl_js.clap
  ret.decl_js.letter_count  = decl_js.letter_count
  ret.js_code = "m(w,#{regch ch},#{min},#{max})"
  
  ret

# BAD, no additional value
@letter_count_diff = (ch1, ch2, min, max)->
  code1 = ch1.charCodeAt 0
  code2 = ch2.charCodeAt 0
  ret = new module.Feature
  ret.name = "letter_count_diff(#{ch1},#{ch2})[#{min},#{max}]"
  ret.clap_min = min
  ret.clap_max = max
  ret.code = (config)->
    """
    uint i;
    for(i=0;i<#{config.word_max_length};i++) {
      uint ch = b_word[word_offset + i];
      res = (ch==#{code1})?res+1:res;
      res = (ch==#{code2})?res-1:res;
    }
    res = min(res, (char)#{max});
    res = max(res, (char)#{min});
    res -= #{min};
    """
  ret.decl_js.clap          = decl_js.clap
  ret.decl_js.letter_count  = decl_js.letter_count
  ret.js_code = """
    c(mn(w,#{regch ch1})-mn(w,#{regch ch2}),#{min},#{max})
    """
  
  ret

# ###################################################################################################

@length_gen = (min, max)->
  ret = new module.Feature
  ret.name = "length_gen()[#{min},#{max}]"
  ret.clap_min = min
  ret.clap_max = max
  ret.code = (config)->
    """
    uint i;
    for(i=0;i<#{config.word_max_length};i++) {
      uint ch = b_word[word_offset + i];
      res = ch?res+1:res;
    }
    res = min(res, (char)#{max});
    res = max(res, (char)#{min});
    res -= #{min};
    """
  ret.decl_js.clap          = decl_js.clap
  ret.js_code = """
    c(w.length,#{min},#{max})
    """
  
  ret

@letter_count_sum = (ch_list, min, max)->
  jl = []
  for ch in ch_list
    jl.push "res = (ch==#{ch.charCodeAt 0})?res+1:res;"
  ret = new module.Feature
  ret.name = "letter_count_sum(#{JSON.stringify ch_list})[#{min},#{max}]"
  ret.clap_min = min
  ret.clap_max = max
  ret.code = (config)->
    """
    uint i;
    for(i=0;i<#{config.word_max_length};i++) {
      uint ch = b_word[word_offset + i];
      #{join_list jl, '  '}
    }
    res = min(res, (char)#{max});
    res = max(res, (char)#{min});
    res -= #{min};
    """
  ret.decl_js.clap          = decl_js.clap
  ret.decl_js.letter_count  = decl_js.letter_count
  ret.js_code = """
    c(m(w,#{regch_any ch_list}),#{min},#{max})
    """
  
  ret

@letter_seq_list = (seq_list, min, max)->
  jl = []
  max_ch_list_len = 0
  for ch_list in seq_list
    max_ch_list_len = Math.max max_ch_list_len, ch_list.length
    condition_list = []
    for ch, idx in ch_list
      condition_list.push "(b_word[word_offset + i + #{idx}]==#{ch.charCodeAt 0})"
    jl.push "res = (#{condition_list.join '&&'})?res+1:res;"
  ret = new module.Feature
  ret.name = "letter_seq_list(#{JSON.stringify seq_list})[#{min},#{max}]"
  ret.clap_min = min
  ret.clap_max = max
  ret.code = (config)->
    """
    uint i;
    for(i=0;i<#{config.word_max_length-max_ch_list_len};i++) {
      #{join_list jl, '  '}
    }
    res = min(res, (char)#{max});
    res = max(res, (char)#{min});
    res -= #{min};
    """
  throw new Error "no js code"
  
  ret
@letter_pos = (pos, min=96, max=122)->
  ret = new module.Feature
  ret.name = "letter_pos(#{pos})[#{min},#{max}]"
  ret.clap_min = min
  ret.clap_max = max
  ret.code = (config)->
    """
    res = b_word[word_offset + #{pos}];
    res = min(res, (char)#{max});
    res = max(res, (char)#{min});
    res -= #{min};
    """
  ret.decl_js.clap          = decl_js.clap
  ret.js_code = """
    c(w.charCodeAt(#{pos})||0,#{min},#{max})
    """
  
  ret

@last_gen = (min=96, max=122)->
  ret = new module.Feature
  ret.name = "last_gen()[#{min},#{max}]"
  ret.clap_min = min
  ret.clap_max = max
  ret.code = (config)->
    """
    uint i;
    for(i=0;i<#{config.word_max_length};i++) {
      uint ch = b_word[word_offset + i];
      res = ch?ch:res;
    }
    res = min(res, (char)#{max});
    res = max(res, (char)#{min});
    res -= #{min};
    """
  ret.decl_js.clap          = decl_js.clap
  ret.js_code = """
    c(w.charCodeAt(w.length-1)||0,#{min},#{max})
    """
  
  ret


@compact = (config, compact_hash)->
  ret = new module.Feature
  ret.name = "compact()"
  ret.clap_min = 0
  ret.clap_max = 1
  
  # # CUT
  # cut_hash = {}
  # limit = 5
  # for k,v of compact_hash
  #   cut_hash[k] = v
  #   break if 0 == limit--
  # compact_hash = cut_hash
  # 
  # string_count = h_count compact_hash
  
  # update_jl = []
  # res_set_jl= []
  # str_idx = 0
  # for k,v of compact_hash
  #   for ch,char_idx in k
  #     update_jl.push "state[#{str_idx}] = (ch==#{ch.charCodeAt(0)} && state[#{str_idx}] == #{char_idx})?(state[#{str_idx}]+1):0;"
  #   update_jl.push "position[#{str_idx}] = (ch==#{ch.charCodeAt(0)} && state[#{str_idx}] == 0)?i:position[#{str_idx}];"
  #   for position_idx in [0 ... config.compact.max_len]
  #     allowed = v[position_idx]
  #     if !allowed
  #       res_set_jl.push "res = (state[#{str_idx}] == #{k.length} && position[#{str_idx}] == #{position_idx})?0:res;"
  #   res_set_jl.push "state[#{str_idx}] = (state[#{str_idx}] == #{k.length})?0:state[#{str_idx}];"
  #   str_idx++
  # 
  # ret.code = (config)->
  #   """
  #   uint i;
  #   uchar state[#{string_count}]    = {0};
  #   char position[#{string_count}] = {-1};
  #   res = 1;
  #   for(i=0;i<#{config.word_max_length};i++) {
  #     uint ch = b_word[word_offset + i];
  #     #{join_list update_jl, '  '}
  #     #{join_list res_set_jl, '  '}
  #   }
  #   """
  ret.decl_js.chk          = """
    chk=#{JSON.stringify compact_hash};
    CHK=function(w){
      for(L=1;L<#{config.compact.max_len};L++) {
        for(o=0,ll=w.length-L+1;o<ll;o++) {
          if(LL=chk[w.substr(o,L)])if(!LL[o])return 0;
        }
      }
      return 1;
    };
    """
  ret.js_code = """
    CHK(w)
    """
  ret.init = ((@config, @gpu_b, on_end)->
    if fs.existsSync './compact.buffer'
      buf = fs.readFileSync './compact.buffer'
      if (buf.length != gpu_b.b_compact.host_buffer.length)
        throw new Error "length mismatch #{buf.length} != #{gpu_b.b_compact.host_buffer.length}"
      gpu_b.b_compact.host_buffer = buf
      await gpu_b.b_compact.move defer err; return on_end err if err
    else
      pass_fn = (w)->
        for L in [1 ... config.compact.max_len]
          for o in [0 ... w.length-L+1]
            if LL=compact_hash[w.substr(o,L)]
              if !LL[o]
                return 0
        return 1
      pb = new ProgressBar
      pb.init gpu_b.b_word.host_buffer.length/config.word_max_length
      for i in [0 ... gpu_b.b_word.host_buffer.length/config.word_max_length]
        pb.set()
        word  = gpu_b.b_word.host_buffer.slice(start = i*config.word_max_length, start+config.word_max_length).toString()
        word  = word.replace /\0/g, ''
        global.gc?() if i % 100000 == 0
        gpu_b.b_compact.host_buffer.writeInt8 pass_fn(word), i
      pb.end()
      fs.writeFileSync './compact.buffer', gpu_b.b_compact.host_buffer
      await gpu_b.b_compact.move defer err; return on_end err if err
    
    @kernel = config.ctx.kernel
      name        : 'feature_to_map'
      kernel_str  : kernel_str = 
        """
        #pragma OPENCL EXTENSION cl_amd_media_ops : enable
        #pragma OPENCL EXTENSION cl_amd_media_ops2: enable
        
        __kernel void main( 
                            __global  char *in,
                            const uint      map_offset,
                            __global  char *out
                            )
        {
          uint id = get_global_id(0);
          
          uint from   = id*#{config.feature.word_per_thread}u;
          uint to     = min(from + #{config.feature.word_per_thread}u, #{config.word_base_size}u);
          
          if (from >= #{config.word_base_size}u) return;
          
          for(;from<to;from++) {
            out[map_offset+from] = in[from];
          }
        }
        """
      arg_list_fn  : ()=>
        # p "gpu.map_offset=", @feature_offset*config.word_base_size
        ret = [
          gpu_b.b_compact
          @feature_offset*config.word_base_size
          gpu_b.b_map
        ]
      thread_count: config.feature.thread_count
      work_size   : config.feature.work_size
    
    await @kernel.init defer err                                           ; return on_end err if err
    
    on_end null
    return
  ).bind ret
  
  ret
















