const BUF3 = 2197;
var bloom = {
    hash: [],
    size: 0x07FFFF,
    init(){
        function f(s){
            var r = 1;
            for (var i = 0; i < s.length; ++i){
                var c = s.charCodeAt(i)-95;
                if (c<0)c=0;
                r = (133*r+c)& 0x00FFFFF;
            }

            return r;
        };
        this.hash.push(f);
    },
    setBit(u8,bit){
        var byte= BUF3+Math.floor(bit/8);
        var mask = 1 << (bit % 8);
        u8[byte] = u8[byte] | mask;
    },
    getBit(u8,bit){
        var byte= BUF3+Math.floor(bit/8);
        var mask = 1 << (bit % 8);
        return u8[byte] & mask;
    },
    add(u8,s){
        for (var i = 0; i < this.hash.length; ++i)
            this.setBit(u8,this.hash[i](s) % this.size);
        //    console.log(s,'  ',this.hash[0](s) % this.size)
    },
    test(u8,s){
        for (var i = 0; i < this.hash.length; ++i)
            if (this.getBit(u8,this.hash[i](s) % this.size) == 0) return false;
        return true;
    }

}
module.exports = bloom;
