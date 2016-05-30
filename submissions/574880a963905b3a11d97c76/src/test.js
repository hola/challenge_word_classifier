var auto = 0; // 1-automatic search best parameters, 0=manual mode
var mode = 0; // 0-testing full version & make base, 1-testing min version, 2-test pack version 
var nom = 1;

if(mode) auto=0;
var mod = require(mode==2 ? './solution' : './ver'+(mode==1?'_min':''));
var zlib = require('zlib');
var fs = require('fs');

var bad = fs.readFileSync('bad_word_'+nom+'.txt', 'utf8').split('\n');
var badl = bad.length;

var I = fs.readFileSync('ok_word_'+nom+'.txt', 'utf8').split('\n');

var Il = I.length;

var REZE="", REZI="", SIZE=100000, IND=0, ERR = 0;
var suf = 4, kol = 5, en = 5, zah = 0, hash = 445, hw = 10; // parameters for manual mode

if(!auto){ 
  t({suf:suf, kol:kol, en:en, zah:zah, hash:hash, hw:hw}); 
} else {
  //for(i=0; i<rasp.length; i++)       // parameters for search mode
  //for(en=5; en<10; en++)         // parameters for search mode
  //for(zah=0; zah<2; zah++)      // parameters for search mode
  //for(kol=3; kol<6; kol++)      // parameters for search mode
  for(hw=5; hw<11; hw++)       // parameters for search mode
  for(hash=5000; hash<20000000; hash*=1.1)  // parameters for search mode
    //t({suf:suf, kol:kol, en:en, zah:zah, hash:hash, hw:hw, rasp:rasp[i]});
    if(t({suf:suf, kol:kol, en:en, zah:zah, hash:Math.floor(hash), hw:hw})) break;
}
if(auto){
  console.log('ok');
  console.log(REZE);
  console.log(REZI);
}

function t(par){
  if(!mode) mod.gen('words_.txt', par); // make gz
//return;
  var size = fs.statSync('data.gz').size;
  //console.log(size); return;
  if(!auto) mod.init(zlib.gunzipSync(fs.readFileSync('data.gz')),par);

  var err = 0, errok = 0;
  var E = [];
  for(var i=0; i<badl; i++){ if(mod.test(bad[i],0)) { err++; E.push(bad[i]); } }
  if(!auto) for(var i=0; i<Il; i++){ if(!mod.test(I[i],1)) { errok++; console.log('ok error',I[i]); return; } }

  var errP = 100-100*(err+errok)/((badl+Il));
  var ind = Math.round(10000000*errP/size);
  var rez = `I=${ind} %=${errP.toFixed(5)} S=${size} par=${JSON.stringify(par)}`;
  console.log(rez+'>>>'+REZE+'>>>'+REZI);
  
  //if(!auto || (size+1000<65536 && errP<ERR)){
  if(!auto || (size+1200<65536 && (ind>IND || errP>ERR) )){
    if(errP>ERR){
      ERR = errP;
      REZE = rez;
    }
    if(ind>IND){
      IND = ind;
      REZI = rez;
    }
    if(auto)console.log('+');
  }

  if(!auto){ 
    fs.writeFileSync('bad_rasp.txt', E.join('\n'));
  } else {
    if(size+600>65536){
      return true;  
    }
  }
} 
