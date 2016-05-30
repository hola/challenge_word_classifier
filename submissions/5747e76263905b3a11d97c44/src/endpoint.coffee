fs = require 'fs'
{
  ProgressBar
} = require 'progress'
module.exports = (config, gpu_b, on_end)->
  res = {}
  res.kernel_endpoint_init = config.ctx.kernel
    name        : 'kernel_endpoint_init'
    kernel_str  : kernel_str = 
      """
      #pragma OPENCL EXTENSION cl_amd_media_ops : enable
      #pragma OPENCL EXTENSION cl_amd_media_ops2: enable
      
      __kernel void main(
                          __global uint *out
                          )
      {
        uint id = get_global_id(0);
        
        uint from   = id*#{config.endpoint.word_per_thread}u;
        uint to     = min(from + #{config.endpoint.word_per_thread}u, #{config.word_base_size}u);
        
        if (from >= #{config.word_base_size}u) return;
        
        for(;from<to;from++) {
          out[from] = 0;
        }
      }
      """
    arg_list_fn  : ()=>
      ret = [
        gpu_b.b_endpoint_n
      ]
    thread_count: config.endpoint.thread_count
    work_size   : config.endpoint.work_size
  
  endpoint_seek = {}
  endpoint_seek.endpoint_feature_list_length = 0
  res.kernel_endpoint_seek = config.ctx.kernel
    name        : 'kernel_endpoint_seek'
    kernel_str  : kernel_str = 
      """
      #pragma OPENCL EXTENSION cl_amd_media_ops : enable
      #pragma OPENCL EXTENSION cl_amd_media_ops2: enable
      
      __kernel void main(
                          __global  int  *b_count_map,
                          __global uchar *b_map,
                          __global uint4 *b_endpoint_feature_list,
                          const    uint  endpoint_feature_list_length,
                          __global uint  *b_endpoint_n,
                          __global  int4 *out
                          )
      {
        uint id = get_global_id(0);
        if (id >= endpoint_feature_list_length) return;
        
        uint endpoint_id = b_endpoint_feature_list[id].x;
        uint feature_id  = b_endpoint_feature_list[id].y;
        
        // == feature_offset
        uint from_map       = feature_id*#{config.word_base_size};
        
        uint i;
        int4 bag[256] = {0};
        uint map_offset = 0;
        for(;map_offset<#{config.word_base_size};map_offset++) {
          bool select_me = b_endpoint_n[map_offset] == endpoint_id;
          uchar feature_value = b_map[from_map++];
          int score           = b_count_map[map_offset];
          bag[feature_value].x += (select_me&&(score>0))? score:0;
          bag[feature_value].y += (select_me&&(score<0))?-score:0;
        }
        int4 sum = {0,0,0,0};
        for(i=0;i<256;i++) {
          int pos = bag[i].x;
          int neg = bag[i].y;
          sum.x += abs(pos-neg);  // score
          sum.y += pos+neg;       // total
          sum.z += max(pos, neg); // hitrate
          sum.w += pos;           // pos
        }
        out[id] = sum;
      }
      """
    arg_list_fn  : ()=>
      ret = [
        gpu_b.b_count_map
        gpu_b.b_map
        gpu_b.b_endpoint_feature_list
        endpoint_seek.endpoint_feature_list_length
        gpu_b.b_endpoint_n
        gpu_b.b_endpoint_b_reduce_done
      ]
    thread_count: config.endpoint.thread_count
    work_size   : config.endpoint.work_size
  
  res.endpoint_feature_calc = (_task_list, on_end)->
    while _task_list.length > 0
      p "endpoint_feature_calc #{_task_list.length}"
      task_list = _task_list.splice(0, 256*config.map_count-1)
      buf_offset = 0
      
      if task_list.length >= 256*config.map_count
        throw new Error("task_list.length=#{task_list.length} >= 256*config.map_count = #{256*config.map_count}")
      for task in task_list
        gpu_b.b_endpoint_feature_list.host_buffer.writeUInt32LE task.endpoint.endpoint_id,  buf_offset
        gpu_b.b_endpoint_feature_list.host_buffer.writeUInt32LE task.feature_id,            buf_offset+4
        buf_offset += 16
      endpoint_seek.endpoint_feature_list_length = task_list.length
      await gpu_b.b_endpoint_feature_list.move  defer err     ; return on_end err if err
      await res.kernel_endpoint_seek.go         defer err     ; return on_end err if err
      await gpu_b.b_endpoint_b_reduce_done.move defer err     ; return on_end err if err
      
      for task, pair_id in task_list
        {
          endpoint
          feature_id
        } = task
        
        score   = gpu_b.b_endpoint_b_reduce_done.host_buffer.readInt32LE 16*pair_id
        total   = gpu_b.b_endpoint_b_reduce_done.host_buffer.readInt32LE 16*pair_id + 4
        hitrate = gpu_b.b_endpoint_b_reduce_done.host_buffer.readInt32LE 16*pair_id + 8
        pos     = gpu_b.b_endpoint_b_reduce_done.host_buffer.readInt32LE 16*pair_id + 12
        
        endpoint.feature_to_score_hash[feature_id] = {
          score
          total
          hitrate
          pos
        }
      for task, pair_id in task_list
        {
          endpoint
          feature_id
        } = task
        
        endpoint.zero_score ?= endpoint.feature_to_score_hash[0].score
        endpoint.feature_to_score_hash[feature_id].score -= endpoint.zero_score
        {
          score
          total
          hitrate
          pos
        } = endpoint.feature_to_score_hash[feature_id]
        name = config.feature_list[feature_id].name
        # p "e=#{endpoint.endpoint_id.ljust 6} #{name.ljust 30} #{score.ljust 10}  #{hitrate.ljust 10} #{total.ljust 10} #{pos.ljust 10}"
    
    on_end null
    
  res.endpoint_seek = (opt, on_end)->
    if !opt.endpoint_list? then throw new Error "missing endpoint_list"
    
    best_list = []
    pb = new ProgressBar
    # pb.init opt.endpoint_count*config.map_count
    buf_offset = 0
    task_list = []
    for endpoint in opt.endpoint_list
      {
        endpoint_id
        is_calculated
        feature_to_score_hash
        feature_use_list
      } = endpoint
      if !is_calculated
        # p "endpoint_id=#{endpoint_id} CALC"
        for feature_id in [0 ... config.map_count]
          continue if feature_use_list.has feature_id
          task_list.push {
            endpoint
            feature_id
          }
        endpoint.is_calculated = true
        break if task_list.length >= 4096
    
    await res.endpoint_feature_calc task_list, defer err; on_end err if err
    for endpoint in opt.endpoint_list
      {
        endpoint_id
        is_calculated
        feature_to_score_hash
        feature_use_list
      } = endpoint
      for feature_id, v of feature_to_score_hash
        {
          score
          hitrate
          total
          pos
        } = v
        name = config.feature_list[feature_id].name
        # p "#{name.ljust 30} #{score.ljust 10}  #{hitrate.ljust 10} #{total.ljust 10} #{pos.ljust 10}"
        best_list.push {
          stat       : v
          score      : score
          total      : total
          feature_id : feature_id
          endpoint   : endpoint
        }
        if best_list.length > 1000
          best_list.sort (a,b)->-(a.score-b.score)
          best_list = best_list.slice 0, 500
          
    
    # pb.end()
    best_list.sort (a,b)->-(a.score-b.score)
    
    on_end null, best_list
  
  endpoint_split = {}
  res.kernel_endpoint_split = config.ctx.kernel
    name        : 'kernel_endpoint_split'
    kernel_str  : kernel_str = 
      """
      #pragma OPENCL EXTENSION cl_amd_media_ops : enable
      #pragma OPENCL EXTENSION cl_amd_media_ops2: enable
      
      __kernel void main(
                          __global uchar *b_map,
                          const    uint   feature_id,
                          const    uint   endpoint_id,
                          const    uint   endpoint_free_offset,
                          __global uint  *b_endpoint_n
                          )
      {
        uint id = get_global_id(0);
        
        uint from   = id*#{config.endpoint.word_per_thread}u;
        uint to     = min(from + #{config.endpoint.word_per_thread}u, #{config.word_base_size}u);
        
        if (from >= #{config.word_base_size}u)return;
        
        uint feature_offset = from + #{config.word_base_size}*feature_id;
        for(;from<to;from++) {
          uint old_endpoint_id = b_endpoint_n[from];
          bool select_me = old_endpoint_id == endpoint_id;
          uint feature_value = b_map[feature_offset++];
          feature_value += endpoint_free_offset;
          b_endpoint_n[from] = select_me?feature_value:old_endpoint_id;
        }
      }
      """
    arg_list_fn  : ()=>
      ret = [
        gpu_b.b_map
        endpoint_split.feature_id
        endpoint_split.endpoint_id
        endpoint_split.endpoint_free_offset
        gpu_b.b_endpoint_n
      ]
    thread_count: config.endpoint.thread_count
    work_size   : config.endpoint.work_size
  # p kernel_str
  # p "thread_count   =",config.endpoint.thread_count
  # p "word_per_thread=",config.endpoint.word_per_thread
  # p "thread_count*word_per_thread=",config.endpoint.word_per_thread*config.endpoint.thread_count
  # p "word_base_size =",config.word_base_size
  # xxx
  res.kernel_endpoint_split2 = config.ctx.kernel
    name        : 'kernel_endpoint_split2'
    kernel_str  : kernel_str = 
      """
      #pragma OPENCL EXTENSION cl_amd_media_ops : enable
      #pragma OPENCL EXTENSION cl_amd_media_ops2: enable
      
      __kernel void main(
                          __global uchar *b_map,
                          const    uint   feature_id,
                          const    uint   endpoint_id,
                          const    uint   endpoint_free_offset,
                          __global uint  *b_endpoint_n,
                          __global uint  *b_endpoint_n_dst
                          )
      {
        uint id = get_global_id(0);
        
        uint from   = id*#{config.endpoint.word_per_thread}u;
        uint to     = min(from + #{config.endpoint.word_per_thread}u, #{config.word_base_size}u);
        
        if (from >= #{config.word_base_size}u)return;
        
        uint feature_offset = from + #{config.word_base_size}*feature_id;
        for(;from<to;from++) {
          uint old_endpoint_id = b_endpoint_n[from];
          bool select_me = old_endpoint_id == endpoint_id;
          uint feature_value = b_map[feature_offset++];
          feature_value += endpoint_free_offset;
          b_endpoint_n_dst[from] = select_me?feature_value:old_endpoint_id;
        }
      }
      """
    arg_list_fn  : ()=>
      ret = [
        gpu_b.b_map
        endpoint_split.feature_id
        endpoint_split.endpoint_id
        endpoint_split.endpoint_free_offset
        gpu_b.b_endpoint_n
        gpu_b.b_endpoint_n_dst
      ]
    thread_count: config.endpoint.thread_count
    work_size   : config.endpoint.work_size
  res.endpoint_check = (opt, on_end)->
    if !opt.endpoint_list?  then throw new Error "missing endpoint_list"
    
    # ###################################################################################################
    #    recheck endpoints presence/total
    # ###################################################################################################
    endpoint_hash = {}
    for endpoint in opt.endpoint_list
      endpoint_hash[endpoint.endpoint_id] = endpoint
      endpoint.real_total = 0
      
    await gpu_b.b_endpoint_n.move defer err ; throw err if err
    fail = false
    result_hash = {}
    for i in [0 ... gpu_b.b_endpoint_n.host_buffer.length] by 4
      endpoint_id = gpu_b.b_endpoint_n.host_buffer.readUInt32LE i
      count       = abs gpu_b.b_count_map.host_buffer.readInt32LE i
      result_hash[endpoint_id] ?= 0
      result_hash[endpoint_id] += count
      if !endpoint_hash[endpoint_id]
        fail = true
        perr "Check fail. No such endpoint_id #{endpoint_id}"
      endpoint_hash[endpoint_id].real_total += count
    # pp result_hash
    for endpoint in opt.endpoint_list
      # if endpoint.is_calculated
      if endpoint.feature_to_score_hash[0]?
        if endpoint.real_total != endpoint.feature_to_score_hash[0].total
          fail = true
          perr "Check fail. Total mismatch at endpoint #{endpoint.endpoint_id} real=#{va = endpoint.real_total} feature=#{vb = endpoint.feature_to_score_hash[0].total} diff=#{va-vb}"
    if fail
      fs.writeFileSync 'dump.buffer', gpu_b.b_endpoint_n.host_buffer
      throw new Error "Check fail. See log for details"
    # p "endpoint_check done"
    on_end null
  
  res.endpoint_split = (opt, on_end)->
    if !opt.endpoint?       then throw new Error "missing endpoint"
    if !opt.feature_id?     then throw new Error "missing feature_id"
    if !opt.mode_ff
      if !opt.endpoint_list?  then throw new Error "missing endpoint_list"
    
    endpoint_split.endpoint_id          = opt.endpoint.endpoint_id
    endpoint_split.feature_id           = opt.feature_id
    endpoint_split.endpoint_free_offset = opt.endpoint_free_offset
    
    # await res.kernel_endpoint_split.go defer err ; return on_end err if err
    await res.kernel_endpoint_split2.go                     defer err ; return on_end err if err
    await gpu_b.b_endpoint_n_dst.d2d_to gpu_b.b_endpoint_n, defer err ; return on_end err if err
    
    range = config.feature_list[opt.feature_id].range_get()
    
    if !opt.mode_ff
      opt.endpoint_list.remove opt.endpoint
      feature_use_list = clone opt.endpoint.feature_use_list
      feature_use_list.push +opt.feature_id
      for i in [0 ... range]
        opt.endpoint_list.push {
          endpoint_id           : opt.endpoint_free_offset+i
          feature_use_list
          is_calculated         : false
          # feature_to_score_hash : opt.feature_to_score_hash_list?[i] or {}
          feature_to_score_hash : {}
        }
      # await res.endpoint_check opt, defer err; on_end err if err # DEBUG
    
    on_end null, {
      endpoint_free_offset : opt.endpoint_free_offset + range
    }
    
  res.final_score = (opt, on_end)->
    if !opt.endpoint_list? then throw new Error "missing endpoint_list"
    
    result = {
      score       : 0
      total       : 0
      hitrate     : 0
      alt_list    : []
    }
    pb = new ProgressBar
    # pb.init opt.endpoint_count
    if !opt.lazy
      task_list = []
      for endpoint in opt.endpoint_list
        {
          endpoint_id
          is_calculated
          feature_to_score_hash
        } = endpoint
        
        if !feature_to_score_hash[0]
          task_list.push {
            endpoint
            feature_id : 0
          }
      
      await res.endpoint_feature_calc task_list, defer err; on_end err if err
    for endpoint in opt.endpoint_list
      {
        endpoint_id
        is_calculated
        feature_to_score_hash
      } = endpoint
      
      continue if !feature_to_score_hash[0]
      {
        score
        total
        hitrate
        pos
      } = feature_to_score_hash[0]
      
      # p "endp=#{endpoint_id.ljust 5} #{score.ljust 10}  #{hitrate.ljust 10} #{total.ljust 10} #{pos.ljust 10} #{if pos > total/2 then '+' else '-'}"
      result.score    += endpoint.zero_score
      result.total    += total
      result.hitrate  += hitrate
      result.alt_list[endpoint_id] = {
        score
        total
        hitrate
        n_decision : if pos > total/2 then 1 else 0
      }
    # pb.end()
    on_end null, result
  
  await res.kernel_endpoint_init.init         defer err     ; throw err if err
  await res.kernel_endpoint_seek.init         defer err     ; throw err if err
  await res.kernel_endpoint_split.init        defer err     ; throw err if err
  await res.kernel_endpoint_split2.init       defer err     ; throw err if err
  
  on_end null, res
