fs = require 'fs'
class Wrapper
  name  : ''
  state : null
  constructor : (@name, default_state)->
    if fs.existsSync @name
      @state = JSON.parse fs.readFileSync @name
    else
      @state = default_state
  
  commit : ()->
    fs.writeFileSync @name, JSON.stringify @state
    name = "checkpoint/#{@name}.#{@state.cum_depth//100}"
    if !fs.existsSync name
      fs.writeFileSync name, JSON.stringify @state
module.exports = Wrapper