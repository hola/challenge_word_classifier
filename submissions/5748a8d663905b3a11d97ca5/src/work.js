'use strict';

const lineByLine = require('n-readlines');
const fs = require('fs');
const zlib = require('zlib');
const http = require('http');
const request = require('sync-request');

function* substr(str, len, nullElem)
{
  var pos = 0;

  while(pos < str.length)
  {
    var r = str.substring(pos, len + pos);

    while(r.length < len)
    {
      r += nullElem;
    }
    yield r;

    pos += len;
  }

  return;
}
var N1 = 0;

//------------------------------------------------------------------------------
class WordDetector
{
  //----------------------------------------------------------------------------
  constructor(lenSeq, buf, buf1)
  {
    this.alphobet = ['-', "'","A","B","C","D","E","F","G","H","I","J","K","L","M",
    "N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
    "^", "$"];
    this.lenChars = (this.alphobet.length - 1).toString(2).length;

    this.lenSeq = lenSeq;

    if(typeof this.lenSeq !== 'number')
    {
      throw Error('Error type lenSeq')
    }

    if((this.lenSeq * this.lenChars) > 32)
    {
      throw Error('Error len lenSeq')
    }

    this.buf = buf;

    this.buf1 = buf1;

    if(!!!buf)
    {
      let tmpStr = '';
      for(let i = 0; i < this.lenSeq; ++i)
      {
        tmpStr += this.alphobet[this.alphobet.length - 1];
      }
      //console.log('tmpStr', tmpStr);

      let hs = this.hash(tmpStr);
      //console.log('hs', hs);

      this.buf = new Buffer(
        ((hs % 8) === 0)
        ?
        (hs / 8)
        :
        (parseInt(hs / 8) + 1)
      );

      this.buf.fill(0);

      this.sumMod = 440;//TODO: check
    }

    if(!!!buf)
    {

      this.buf1 = new Buffer(this.sumMod * this.sumMod);

      this.buf1.fill(0);

      //console.log('this.buf.length', this.buf.length);

      //console.log(this.buf);
    }
  }
  //----------------------------------------------------------------------------
  nullElem()
  {
    return this.alphobet[0];
  }
  //----------------------------------------------------------------------------
  hash(word)
  {
    if(typeof word !== 'string')
    {
      throw new Error('Error type lenSeq')
    }

    if(this.lenSeq !== word.length)
    {
      throw new Error('Error len word ' + word.length)
    }

    var res = 0;

    for(let i = 0; i < this.lenSeq; ++i)
    {
      let t = this.alphobet.indexOf(word[i]);

      if(t === -1)
      {
        throw new Error('Error char ' + word[i]);
      }

      let tt = t << (i * this.lenChars);

      res = res | tt;
      //console.log(t, t.toString(2), word[i], tt, tt.toString(2), res, res.toString(2));
    }

    return res;
  }
  //----------------------------------------------------------------------------
  hash1(h)
  {
    return h % this.sumMod;
  }
  //----------------------------------------------------------------------------
  __pos(position)
  {
    if(position >= (this.buf.length * 8))
    {
      throw new Error('Error position ' + position);
    }

    return  [ parseInt(position / 8), position % 8 ];
  }
  //----------------------------------------------------------------------------
  __pos1(h1, h2)
  {
    var position = this.sumMod * h1 + h2;
    if(position >= (this.buf1.length * 8))
    {
      throw new Error('Error position ' + position + " " + this.buf1.length);
    }

    return  [ parseInt(position / 8), position % 8 ];
  }
  //----------------------------------------------------------------------------
  __setBit(numb, val, pos)
  {
    return (!!val ? (numb | (1 << pos)) : (numb & (~(1 << pos))));
  }
  //----------------------------------------------------------------------------
  setBit(position, val)
  {
    var p = this.__pos(position);

    this.buf.writeUInt8(this.__setBit(this.buf.readUInt8(p[0]), val, p[1]),
    p[0]);
  }
  //----------------------------------------------------------------------------
  setBit1(h1, h2, val)
  {
    var p = this.__pos1(h1, h2);

    this.buf1.writeUInt8(this.__setBit(this.buf1.readUInt8(p[0]), val, p[1]),
    p[0]);
  }
  //----------------------------------------------------------------------------
  getBit1(h1, h2)
  {
    var p = this.__pos1(h1, h2);

    var t = this.buf1.readUInt8(p[0]);

    //console.log(t.toString(2), t & 1 << p[1]);

    return !!(t & 1 << p[1]);
  }
  //----------------------------------------------------------------------------
  getBit(position)
  {
    var p = this.__pos(position);

    var t = this.buf.readUInt8(p[0]);

    //console.log(t.toString(2), t & 1 << p[1]);

    return !!(t & 1 << p[1]);
  }
  //----------------------------------------------------------------------------
  saveWord(word)
  {
    let gen = substr("^" +  word + "$", this.lenSeq, this.nullElem());
    //let gen = substr(word, this.lenSeq, this.nullElem());

    let lastVal = null;

    while(true)
    {
      let subword = gen.next();

      if(subword.done)
      {
        break;
      }

      let hs = this.hash(subword.value);

      this.setBit(hs, 1);

      if(lastVal !== null)
      {
        let h1 = this.hash1(lastVal);
        let h2 = this.hash1(hs);

        this.setBit1(h1, h2, 1);
      }

      lastVal = hs;
    }
  }
  //----------------------------------------------------------------------------
  testWord(word)
  {
    var r = true;

    let gen = substr("^" +  word + "$", this.lenSeq, this.nullElem());
    //let gen = substr(word, this.lenSeq, this.nullElem());

    let lastVal = null;

    while(true)
    {
      let subword = gen.next();
      if(subword.done)
      {
        break;
      }

      let hs = this.hash(subword.value);

      if(!this.getBit(hs))
      {
        r = false;
        break;
      }

      if(lastVal !== null)
      {
        let h1 = this.hash1(lastVal);
        let h2 = this.hash1(hs);

        if(!this.getBit1(h1, h2))
        {
          //console.log(word, this.lenSeq);
          N1++;
          r = false;
          break;
        }
      }

      lastVal = hs;

    }

    return r;
  }
  //----------------------------------------------------------------------------
}
//------------------------------------------------------------------------------

console.log('Begin');

var wordDetector6 = new WordDetector(6);
var wordDetector5 = new WordDetector(5);
var wordDetector4 = new WordDetector(4);
var wordDetector3 = new WordDetector(3);
var wordDetector2 = new WordDetector(2);

var liner = new lineByLine('./words.txt');

var line;
var lineNumber = 1;
while (line = liner.next())
{
  let word = line.toString('utf-8').toUpperCase();
  wordDetector6.saveWord(word);
  wordDetector5.saveWord(word);
  wordDetector4.saveWord(word);
  wordDetector3.saveWord(word);
  wordDetector2.saveWord(word);
}

/*console.log(wordDetector.buf.length,
  wordDetector1.buf.length,
  wordDetector.buf.length + wordDetector1.buf.length,
  (wordDetector.buf.length + wordDetector1.buf.length) / 1024
)*/

/*var test = 'ZZZZZZZZ'

console.log('\n\n\nTest ' + test);

let gen = substr(test, substrLength, wordDetector.nullElem());

while(true)
{
  let subword = gen.next();

  if(subword.done)
  {
    break;
  }

  console.log(
    '\t',
    subword.value,
    wordDetector.hash(subword.value)
    //position(hash(subword.value), 32)
  );
}*/


//fs.writeFileSync(, wordDetector.buf);

/*const gzip = zlib.createGZIP();

var wstream = fs.createWriteStream('./buf.' + substrLength + '.data');
wstream.write(wordDetector.buf);
wstream.end();*/

/*for(let i = 0; i < (wordDetector.buf.length * 8); ++i)
{
  console.log(i, wordDetector.getBit(i));
}*/
var N2 = 0;
function testWord(wordIn, debug)
{
  var word = wordIn.toString('utf-8').toUpperCase();

  var r = wordDetector4.testWord(word);

  /*if(r && !wordDetector3.testWord(word))
  {
    N2++;
    r = false;
  }*/

  return r;
  //&& wordDetector3.testWord(word)
  //&& wordDetector4.testWord(word)
  //&& wordDetector3.testWord(word)
  //&& wordDetector2.testWord(word)

  ;
}

console.log('Test')

var errs = {};
var n = 0;

var mn = 100;
var mx = 0;

for(let i = 0; i < 10000; ++i)
{
  var res = request('GET', 'https://hola.org/challenges/word_classifier/testcase');

  if(res.statusCode === 200)
  {
    fs.writeFileSync('./data/' + (new Date()).valueOf() + '-' + i, res.getBody().toString());

    var test = JSON.parse(res.getBody().toString());

    let n_err = 0.;
    let n_all = 0.;

    for(var word in test)
    {
      ++n;
      ++n_all;

      let t = testWord(word);

      //console.log(word, t, test[word]);

      if(t !== test[word])
      {
        ++n_err;
        if(!(word in errs))
        {
          errs[word] = 0;
        }
        errs[word] = errs[word] + 1;
      }
    }

    let per = (n_all - n_err) / n_all * 100;

    console.log('test', i, n_err, per, mn, mx);
    if(per < mn)
    {
      mn = per;
    }

    if(per > mx)
    {
      mx = per;
    }
  }
  else
  {
    console.log('Error request ' + res.statusCode);
  }
}

console.log('\n\n\n\n\n' + JSON.stringify(errs, null, 1));
console.log(n, Object.keys(errs).length, (n - Object.keys(errs).length) / n * 100, mn, mx);

fs.writeFileSync('./' + (new Date()).valuef() + '.err.json', JSON.stringify(errs, null, 1));

/*
var errs = [];
errs.push('BULBOCOCKEY')


for(let i = 0; i < errs.length; ++i)
{
  console.log('\n\n\n\n',
  errs[i].toUpperCase(),
testWord(errs[i].toUpperCase(), true));
}*/

function testCompress(buf, buf1, name)
{
  var gzipOptions = {
    level: zlib.Z_BEST_COMPRESSION,
    strategy: zlib.Z_RLE,

    windowBits: 15,
    memLevel: 9

  };

  var tmp = Buffer.concat([(new Buffer(4)), buf, buf1]);
  tmp.writeInt32LE(buf.length, 0);

  var rb = zlib.gzipSync(tmp, gzipOptions);
  console.log(name, rb.length / 1024, 65535 - rb.length, buf.length, buf1.length);

  fs.writeFileSync("data.gz", rb);

  let data = zlib.gunzipSync(fs.readFileSync('data.gz'));

  var l=data.readInt32LE(0);var buf11=data.slice(4,l+4);var buf12=data.slice(4+l);
  console.log(buf.equals(buf11))
  console.log(buf1.equals(buf12))

}

/*function testCompress1(buf, name)
{
  var gzipOptions = {
    level: zlib.Z_BEST_COMPRESSION,
    strategy: zlib.Z_RLE,

    windowBits: 15,
    memLevel: 9

  };

var rb = zlib.gzipSync(buf, gzipOptions);
  console.log(name, rb.length / 1024, 65535 - rb.length);

}*/


//testCompress(wordDetector6.buf, wordDetector6.buf1, 6)
//testCompress(wordDetector5.buf, wordDetector5.buf1, 5)
//testCompress1(wordDetector5.buf,51)
testCompress(wordDetector4.buf, wordDetector4.buf1, 4)
//testCompress1(wordDetector4.buf,41)
//testCompress(wordDetector3.buf, wordDetector3.buf1, 3)
//testCompress1(wordDetector3.buf,31)
//testCompress(wordDetector2.buf, wordDetector2.buf1, 2)

//testCompress1(Buffer.concat([wordDetector4.buf, wordDetector4.buf1,wordDetector3.buf, wordDetector3.buf1]), 'r')

/*console.log('N1', N1);
console.log('N2', N2);*/
console.log('End')
