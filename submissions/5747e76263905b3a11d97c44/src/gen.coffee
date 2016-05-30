#!/usr/bin/iced
require 'fy'
require 'codegen'
fs = require 'fs'
global.gpu_profile = true
gpu = require 'gpu'
assert = require 'assert'
{
  ProgressBar
} = require 'progress'
coffee = require 'coffee-script'
Checkpoint = require './checkpoint'
argv = require('minimist')(process.argv)
argv.gpu_id ?= 0
p "gpu_id = #{argv.gpu_id}"
argv = require('minimist')(process.argv.slice(2))
argv.state ?= 'state.json'

await call_later defer()
# ###################################################################################################
#    config
# ###################################################################################################

feature_gen = require './feature'
feature_list = []
feature_list.push feature_gen.zero() # MUST BE FIRST
# feature_list.push feature_gen.letter_count 'a', 0, 4
# # feature_list.push feature_gen.length_gen 3, 9 # WTF
# # feature_list.push feature_gen.length_gen 3, 13 # WTF
# # feature_list.push feature_gen.length_gen 3, 14
# # feature_list.push feature_gen.length_gen 3, 20
feature_list.push feature_gen.length_gen 3, 32 # хорошая, равномерная разбивка
for ch in "aiesrnotl`cdumpghbykfwvjzxq"
  # feature_list.push feature_gen.letter_seq_list [ch], 0, 4
  feature_list.push feature_gen.letter_count ch, 0, 4
for pos in [0 .. 20]
  feature_list.push feature_gen.letter_pos pos
feature_list.push feature_gen.last_gen()

config =
  word_max_length : 64
  map_count       : feature_list.length
  feature_list    : feature_list
  gpu_id          : argv.gpu_id
  feature:
    thread_count    : 4096*4
    work_size       : 32 # default
  endpoint:
    thread_count    : feature_list.length*256
    work_size       : 32 # default

  work_size       : 32 # default

  # TODO optimize it. MORE segment_size_per_thread
  segment :
    thread_count    : 4096*8
    work_size       : 64
    max_offset      : 65536
  use_check : false
  cut_tail  : true
  # TODO array reverse
  compact   :
    max_len : 20
    # file    : 'compact.json'

# feature_list.push feature_gen.compact(config, JSON.parse fs.readFileSync './compact.json')

# ###################################################################################################
#    setup
# ###################################################################################################
gpu_b = {}

device= gpu.gpu_list_get()[config.gpu_id]
ctx   = new gpu.MTContext device
config.ctx = ctx

setup = require './setup'
await setup config, defer err, res ; throw err if err
{
  word_base_size
  count_map_buffer
  word_buffer
} = res

config.word_base_size  = word_base_size
config.feature.word_per_thread  = Math.ceil word_base_size/config.feature.thread_count
config.endpoint.word_per_thread = Math.ceil word_base_size/config.endpoint.thread_count

tmp = require './endpoint'
await tmp config, gpu_b, defer err, tmp2 ; throw err if err
{
  kernel_endpoint_init
  endpoint_seek
  endpoint_split
  endpoint_check
  final_score
} = tmp2

# ###################################################################################################
#    gpu setup
# ###################################################################################################
gpu_b.b_count_map               = ctx.buffer_h2d word_base_size, 'int', count_map_buffer
gpu_b.b_word                    = ctx.buffer_h2d word_base_size*config.word_max_length, 'char', word_buffer
# gpu_b.b_map                     = ctx.buffer_d word_base_size*config.map_count,         'char'
gpu_b.b_map                     = ctx.buffer_d2h word_base_size*config.map_count,         'char'
gpu_b.b_endpoint_n              = ctx.buffer_d2h word_base_size,                        'uint'
gpu_b.b_endpoint_n_dst          = ctx.buffer_d2h word_base_size,                        'uint'
gpu_b.b_endpoint_feature_list   = ctx.buffer_h2d 256*config.map_count,                  'uint4'
# тут 256 == max_feature_range == max_endpoint_list per batch

gpu_b.b_endpoint_b_reduce_done  = ctx.buffer_d2h 256*config.map_count,                  'uint4'

await gpu_b.b_count_map.move  defer err                                           ; throw err if err
await gpu_b.b_word.move       defer err                                           ; throw err if err
await kernel_endpoint_init.go defer err                                           ; throw err if err

for feature,idx in feature_list
  await feature.init config, gpu_b, defer err                                     ; throw err if err
  await feature.go idx, defer err                                                 ; throw err if err
# DEBUG
# for feature,idx in feature_list
  # continue if idx == 0
  # await feature.verify  defer err                                                 ; throw err if err
# xxx
chk = new Checkpoint argv.state,
  tree_gen_list         : []
  endpoint_free_offset  : 1
  endpoint_list         : [
      {
        endpoint_id : 0
        feature_use_list : []
        is_calculated : false
        feature_to_score_hash : {}
      }
    ]
  cum_depth             : 0
  prev_percent          : 0.5

state = chk.state
# BUG b_endpoint_n after reload is 0
# TODO restore b_endpoint_n state
# I can apply tree_gen_list
state.endpoint_free_offset = 1
if state.tree_gen_list.length
  p "RECOVERY"
  pb = new ProgressBar
  pb.init state.tree_gen_list
  for split_cmd in state.tree_gen_list
    pb.set()
    opt = {
      mode_ff               : true
      endpoint              : {endpoint_id : split_cmd.endpoint_id}
      feature_id            : split_cmd.feature_id
      endpoint_free_offset  : state.endpoint_free_offset
    }
    await endpoint_split opt, defer err, res                                          ; throw err if err
    state.endpoint_free_offset = res.endpoint_free_offset
  pb.end()
# await endpoint_check {endpoint_list:state.endpoint_list}, defer err; throw err if err # DEBUG
cum_depth_limit = 8000
# cum_depth_limit = 0
while state.cum_depth < cum_depth_limit
  chk.commit()
  p "DEPTH=#{state.cum_depth} #{(100*state.prev_percent).toFixed(5)} %"
  await endpoint_seek {chk,endpoint_list:state.endpoint_list}, defer err, best_list                       ; throw err if err
  best_score = best_list[0].score
  best_score -= 100
  if best_score <= 0
    p "best_score threshold reached"
    break
  used_endpoint_hash = {}
  best_list = best_list.filter (t)-> t.score > best_score
  best_list = best_list.slice 0, 100 # limit
  p "best_list filter = #{best_list.length}"
  ttl = 10
  for best in best_list
    continue if used_endpoint_hash[best.endpoint.endpoint_id]
    if ttl-- <= 0
      p "TTL"
      break
    used_endpoint_hash[best.endpoint.endpoint_id] = true
    p "#{feature_list[best.feature_id].name.ljust 30} e=#{best.endpoint.endpoint_id.ljust 5} #{best.score.ljust 15} #{best.total.ljust 15}"
    if best.feature_id == 0
      p "WARNING zero feature selected -> no upgrades possible"
      break

    state.tree_gen_list.push {
      endpoint_id : best.endpoint.endpoint_id
      feature_id  : best.feature_id
    }
    opt = {
      endpoint_free_offset: state.endpoint_free_offset
      endpoint_list       : state.endpoint_list
      endpoint            : best.endpoint
      feature_id          : best.feature_id
      # feature_to_score_hash_list: [
        # {0 : best.stat}
      # ]
    }
    # p "best.stat", best.stat
    await endpoint_split opt, defer err, res                                          ; throw err if err
    state.endpoint_free_offset = res.endpoint_free_offset
    
    if config.use_check
      await final_score {endpoint_list:state.endpoint_list}, defer err, res_score                            ; throw err if err
      
      p "positive_endpoint_list = #{(res_score.alt_list.filter (t)-> t.n_decision).length}"
        
      new_percent = res_score.hitrate/res_score.total
      # p res_score
      if new_percent <= state.prev_percent
        perr "WTF new percent is less or equal old #{state.prev_percent} -> #{new_percent}"
        process.exit()
      state.prev_percent = new_percent
    else
      await final_score {lazy:true,endpoint_list:state.endpoint_list}, defer err, res_score                            ; throw err if err
      new_percent = res_score.hitrate/res_score.total
      state.prev_percent = new_percent
    
    # p "#{feature_list[best.feature_id].name.ljust 30} e=#{best.endpoint.endpoint_id.ljust 5} #{best.score.ljust 15} #{best.total.ljust 15}"
  
    state.cum_depth++
    break if state.cum_depth >= cum_depth_limit
p "DONE"
await final_score {endpoint_list:state.endpoint_list}, defer err, res_score                            ; throw err if err
# fs.writeFileSync 'b_endpoint.dump', gpu_b.b_endpoint_n.host_buffer
p "score       = #{res_score.score  }"
p "total       = #{res_score.total  }"
p "hitrate     = #{res_score.hitrate}"
p "hitrate     = #{(100*res_score.hitrate/res_score.total).toFixed(5)} %"

# do ()->
  # size = gpu_b.b_endpoint_n.host_buffer.length/4
  # p "size=#{size}"
  # dst = []
  # for i in [0 ... size]
    # endpoint_id = gpu_b.b_endpoint_n.host_buffer.readUInt32LE i*4
    # n_decision = res_score.alt_list[endpoint_id].n_decision
    # dst.push "#{i} #{!!n_decision} #{endpoint_id}"
  # fs.writeFileSync 'ret_buf.dump', dst.join '\n'
# ###################################################################################################
#
# ###################################################################################################
p "codegen"
tree_js = {
  endpoint_id : 0
  alt_list    : []
}
endpoint_count = 1
# pp state.tree_gen_list
for chunk in state.tree_gen_list
  {
    feature_id
    endpoint_id
  } = chunk
  feature = config.feature_list[feature_id]
  feature.used = true
  walk = (t)->
    if t.endpoint_id == endpoint_id
      count = feature.range_get()
      ret = []
      for i in [0 ... count]
        ret.push {
          endpoint_id : endpoint_count++
          alt_list    : []
        }
      return {
        used_endpoint_id : endpoint_id
        feature_id
        alt_list  : ret
      }
    else
      ret = []
      for v in t.alt_list
        ret.push walk v
      t.alt_list = ret

    return t
  tree_js = walk tree_js
compile_walk = (t)->
  alt_list = []
  if t.alt_list.length == 0
    return res_score.alt_list[t.endpoint_id].n_decision
  for v in t.alt_list
    alt_list.push compile_walk v
  if config.cut_tail
    while alt_list.length and alt_list.last() == 0
      alt_list.pop()
  return "[#{alt_list.join ','}][f#{t.feature_id}]"
# pp tree_js
tree_code = compile_walk tree_js


decl = {}
feature_code = []
for feature,feature_id in feature_list
  continue if !feature.used
  obj_set decl, feature.decl_js
  feature_code.push "f#{feature_id} = #{feature.js_code};"

decl_jl = (v for k,v of decl)

# if config.compact
#   decl_jl.push "chk=#{JSON.stringify config.compact.compact_hash};"
#   # TODO compact remove "
#   code = """
#     #{join_list decl_jl, ''}
#     r=function(w) {
#       w=w.replace(/\\'/g,'`');
#       for(L=0;L<#{config.compact.max_len};L++) {
#         for(o=0,ll=w.length-L-1;o<ll;o++) {
#           if(LL=chk[w.substr(o,L)])if(!LL[o])return false;
#         }
#       }
#       // feature list
#       #{join_list feature_code, '  '}
#       // tree
#       return!!(#{tree_code})
#     }
#     """
# else
if 1
  code = """
    #{join_list decl_jl, ''}
    r=function(w) {
      w=w.replace(/\\'/g,'`');
      // feature list
      #{join_list feature_code, '  '}
      // tree
      return!!(#{tree_code})
    }
    """
p code
code = code.replace /\/\/(.*)/g, ''
p code
code = code.replace /\s+/g, ''
code = code.replace /function(?=[a-z])/g, 'function '
code = code.replace /return(?=[a-z])/g, 'return '
p code
total_buf = Buffer.from(code)
size = total_buf.length
fs.writeFileSync 'serialize', total_buf

zlib = require 'zlib'
await zlib.gzip total_buf, defer err, total_buf_gz

fs.writeFileSync 'serialize.gz', total_buf_gz
size_gz = total_buf_gz.length

fs.writeFileSync "solution.js", "var a;module.exports={init:function(b){a=eval(b.toString())},test:function(b){return a(b)}}"
# fs.writeFileSync "solution.js", coffee.compile """
# r = null
# module.exports =
  # init : (t)->
    # r = eval t.toString()
    # return
  # test : (t)->r t
# """


p "score       = #{res_score.score  }"
p "total       = #{res_score.total  }"
p "hitrate     = #{res_score.hitrate}"
p "hitrate     = #{(100*res_score.hitrate/res_score.total).toFixed(5)} %"

