const bloom_sz = 294907, seed = 40, trim_n = 5;
var bl1, bl2;

function bloom(size,v)
{ var bits, sz = size, h;
  bits = new Uint8Array( Math.ceil(size/8) );
  function t(w)
  { var n = h(w.toLowerCase()), i, b;
	i = Math.floor(n/8);
	b = n % 8;
	return ((bits[i] & (1 << b))>0); 
  }
  function h1(s)
  { var r = 1;
    for (var i = 0; i < s.length; ++i)
    r = (seed * r + s.charCodeAt(i)) & 0xFFFFFFFF;
    if (r<0) r*=-1;
    return r % sz;
  }
  function hLy(s)
  { var hash = 0;
    for(var i=0; i<s.length && i<trim_n; i++)
    hash = 0xffffffff & ( (hash * 1664525) + s.charCodeAt(i) + 1013904223 );
    if (hash<0) hash*=-1;
    return hash % sz;
  }
  if (v==1) h=h1; else h=hLy;
  return {hash:h, test:t, data:bits, size:sz };
}
function Unpack(b)
{ var i=0,j,n,sz,k,a;

  bl1 = new bloom(bloom_sz, 1);
  bl2 = new bloom(bloom_sz-1024, 2);

  sz=0; sz |= b[i] | (b[i+1] << 8) | (b[i+2] << 16) | (b[i+3] << 24); i+=4;
  a = bl1.data;
  for (j in a) 
  { a[j]=b[i]; i++
  }

  sz=0; sz |= b[i] | (b[i+1] << 8) | (b[i+2] << 16) | (b[i+3] << 24); i+=4;
  a = bl2.data;
  for (j in a) 
  { a[j]=b[i]; i++
  }
}
function test(w)
{  w = w.toLowerCase();
   return (bl1.test(w) &&  bl2.test(w) );
}
exports.init = Unpack;
exports.test = test;
