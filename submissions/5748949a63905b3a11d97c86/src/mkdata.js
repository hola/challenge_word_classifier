var fs = require('fs'), readline = require('readline'), zlib = require('zlib'),
stream = require('stream');

const debug = false;
const trim_n = 5;
const bloom_sz = 294907; //Math.floor(65535*4.5);

var bl1, bl2;

var seed = 40;

console.log('seed: ', seed);


function bloom(size,v)
{ var bits, sz = size, h;
  bits = new Uint8Array( Math.ceil(size/8) );
  function t(w)
  { var n = h(w.toLowerCase()), i, b;
	i = Math.floor(n/8);
	b = n % 8;
	return ((bits[i] & (1 << b))>0); 
  }
  function add(w)
  { var n = h(w.toLowerCase()), i, b;
	i = Math.floor(n/8);
	b = n % 8;
	bits[i] |= 1 << b; 
  }
  function ah(n)  // Добавить хэш
  { var i, b;
	  i = Math.floor(n/8);
	  b = n % 8;
	  bits[i] |= 1 << b; 
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
  return {hash:h, test:t, add:add, data:bits, size:sz, addHash:ah};
}

function dataSave()
{ var i, a=bl1.data, n;
  
  buff = new Buffer(4);
  buff.i32 = function(n)
  { this[0]=n & 0xff;
    this[1]=(n >>> 8) & 0xff;
    this[2]=(n >>> 16) & 0xff;
    this[3]=(n >>> 24) & 0xff;
  }
  
  var  f = fs.openSync('data','w');
  n = a.length
  console.log('S1: '+n);
  buff.i32(n);
  fs.writeSync(f, buff, 0, buff.length); //  Кол-во байт
  
  //  Данные фильтра
  for (i in a) 
  { buff.i32(a[i]);
    fs.writeSync(f, buff, 0, 1);
    // if (i<7) console.log('s['+i+']: '+a[i]);
  }

  a = bl2.data;
  n = a.length;
  console.log('S2: '+n);
  
  buff.i32(n);
  fs.writeSync(f, buff, 0, buff.length); //  Кол-во байт

  for (i in a) 
  { buff.i32(a[i]);
    fs.writeSync(f, buff, 0, 1);
    // if (i<7) console.log('s['+i+']: '+a[i]);
  }
  fs.closeSync(f);
  console.log('file data created');
}

function dataUnpack(b)
{ var i=0,j,n,sz,k,a;

  bl1 = new bloom(bloom_sz, 1);
  bl2 = new bloom(bloom_sz-1024, 2);

  sz=0; sz |= b[i] | (b[i+1] << 8) | (b[i+2] << 16) | (b[i+3] << 24); i+=4;
  console.log('S1: '+sz);
  a = bl1.data;
  for (j in a) 
  { a[j]=b[i]; i++
  }

  sz=0; sz |= b[i] | (b[i+1] << 8) | (b[i+2] << 16) | (b[i+3] << 24); i+=4;
  console.log('S2: '+sz);
  a = bl2.data;
  for (j in a) 
  { a[j]=b[i]; i++
  }
}

function dataLoad()
{ var n, c, p, i, b = fs.readFileSync('data');
  dataUnpack(b);
  console.log('Прочитано: '+b.length);
}


var hgw1 = {}, hbw1 = {}; // Хорошие и плогие слова
var hgw2 = {}, hbw2 = {};

function calcH(h)
{ var i,n = 0;
  for (i in h) n++;
  return n;
}

function putH(hs,b,w)
{ var h = b.hash(w.toLowerCase());
  if (hs[h]==undefined) hs[h]=1; else hs[h]++; 
}

function clearH(gh, bh)
{ for (var i in gh)
  { if (bh[i]!=undefined)
    { //  console.log('Х,П:',hgw[i],hbw[i]);
      if ((bh[i]/gh[i])>2.4) delete gh[i];
    }
  }
}

function dataLearn() // Режим обучения
{ bl1 = new bloom(bloom_sz, 1);
  bl2 = new bloom(bloom_sz-1024, 2);
   
  var  a = gw.data, i;
  
  // for (i in a) bl.add( a[i].toLowerCase().substr(0, trim_n) );
  console.log('bloom_sz: '+bloom_sz);
  // Хорошие слова  
  for (i in a) 
  {  putH(hgw1, bl1, a[i]);
     putH(hgw2, bl2, a[i]);
  }
  console.log('Хороших хешей1: '+calcH( hgw1 ));
  console.log('Хороших хешей2: '+calcH( hgw2 ));

  // Плохие слова слова
  a = fw.data;
  for (i in a) 
  { putH(hbw1, bl1, a[i]);
    putH(hbw2, bl2, a[i]);
  }
  console.log('Плохих хешей1: '+calcH( hbw1 ));
  console.log('Плохих хешей2: '+calcH( hbw2 ));
  
  // Почистим хорошие хеши
  clearH(hgw1, hbw1);
  clearH(hgw2, hbw2);

  console.log('Хороших хешей стало 1: '+calcH( hgw1 ));
  console.log('Хороших хешей стало 2: '+calcH( hgw2 ));
  
  for (i in hgw1) bl1.addHash(i);
  for (i in hgw2) bl2.addHash(i);
  
  console.log('Data length 1: ',bl1.data.length);
  console.log('Data length 2: ',bl2.data.length);
  
  dataSave();
  
  var gzip = zlib.createGzip();
  var inp = fs.createReadStream('data');
  var out = fs.createWriteStream('data.gz');
  inp.pipe(gzip).pipe(out).on('finish', function(d)
  { var ds, ss;
    ds =  fs.statSync('data.gz').size;
    ss =  fs.statSync('solution.js').size;
    console.log('data.gz - created\nfree bytes: '+(65535-ds-ss));
  });
}

function test(w)
{  //return bl.test(w.toLowerCase().substr(0, trim_n));      
   w = w.toLowerCase();
   return (bl1.test(w) &&  bl2.test(w) );
}

var fw, gw;

function testAll()
{  var ok=0, n=0, a, i;
  
   a = gw.data;
   for (i in a)
   { 
     n++;
     if ( test( a[i] ) ) ok++;  
   }
   
   console.log('gw: '+(ok/n*100)+'%');
   
   a = fw.data;
   for (i in a)
   { n++;
     if ( !test( a[i] ) ) ok++; else if (debug && Math.random()<0.1) console.log(a[i]);
   }

   console.log('total: '+(ok/n*100)+'%');
}


function txFile(fname)
{ var rs;
  var _data = [];
  this.fin = null;
  this.load = function()
  { rs = readline.createInterface({
    input: fs.createReadStream( fname ),
    output: process.stdout,
    terminal: false
     });
     rs.on('line', function(line) 
     {  _data.push(line);
     }).on("close", this.fin );
  }
  this.data = _data;
  return this;
}

fw = new txFile('../../falseWords.txt');
gw = new txFile('../../words.txt');

gw.fin = function(){ fw.load(); }

// После загрузки всех данных
fw.fin = function()
{   
    dataLearn();
    dataLoad();
    testAll();  
};

gw.load();

exports.test = test;
