module.exports = new (function(){
    this.init = function(d) {
        str_len = d.readUInt32LE(0)
        eval("this.t = " + d.toString('utf8', 4, str_len + 4))
        this.d = d.slice(str_len + 4)
    }
    this.test = function(w) {
        return this.t(this.d, w)
    }
})()
