
module.exports.test = (w) => {
    if(w.length>60||w.match("xj|qj|qx|qz|vq|jq|zx|jx|jz|''|'j|'q|'x|'z")) return false
    o=h(w.replace(/'s$/,''))%l;
    return !!(b[(o/8)|0]&(0x1<<(o%8)));
}

module.exports.init = (d) => {
    b=d;l=d.length*8
}

var h = (c)=> 
     {for(var e,a=c.length,r=0^a,t=0;a>=4;)e=255&c.charCodeAt(t)|(255&c.charCodeAt(++t))<<8|(255&c.charCodeAt(++t))<<16|(255&c.charCodeAt(++t))<<24,e=1540483477*(65535&e)+((1540483477*(e>>>16)&65535)<<16),e^=e>>>24,e=1540483477*(65535&e)+((1540483477*(e>>>16)&65535)<<16),r=1540483477*(65535&r)+((1540483477*(r>>>16)&65535)<<16)^e,a-=4,++t;switch(a){case 3:r^=(255&c.charCodeAt(t+2))<<16;case 2:r^=(255&c.charCodeAt(t+1))<<8;case 1:r^=255&c.charCodeAt(t),r=1540483477*(65535&r)+((1540483477*(r>>>16)&65535)<<16)}return r^=r>>>13,r=1540483477*(65535&r)+((1540483477*(r>>>16)&65535)<<16),r^=r>>>15,r>>>0}
