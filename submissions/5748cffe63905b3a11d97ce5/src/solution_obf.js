"use strict";
function checkBit(bu2, bit) 
{
  let byte_num = Math.floor(bit/8);
  let bit_num = bit - byte_num*8;
  
  let flag = Math.pow(2, bit_num); 
  let number = bu2.readUInt32LE(byte_num);
  return (number & flag) === flag;
};



  var bap;
  var bas;
  var bad;
  var bpo;
  var bst;
  var bsz = new Array;

  var bkp;
  var bks;
  var bkpo;
  var bkst;

  var cpb = 0;


    var wfm = {};
    var fsm = {}; // <size, count>
    var mps = 0;
    var wfm_size = 0;


var init = function (bu1) 
{
  bap = rba(bu1);
  bas = rba(bu1);
  bad = rba(bu1);
  bpo = rba(bu1);
  bst = rba(bu1);  

  bkp = bu1.readUInt8(cpb);
  bks = bu1.readUInt8(cpb+1);
  bkpo = bu1.readUInt8(cpb+2);
  bkst = bu1.readUInt8(cpb+3);
};
exports.init = init;


function rba(bu2) 
{
   let bf_size = bu2.readUInt32BE(cpb);
   bsz.push(bf_size);
   cpb+=4;
   var bf = Buffer.allocUnsafe(bf_size);
   bu2.copy(bf, 0, cpb, cpb + bf_size/8);
   cpb+=bf_size/8;
   return bf;
};



///////////////////////////////////////////////
function hash(word, seed) 
{
    if (seed != 0) {
        let seedhash = 1073676287;
        seed = (102834247 - seed) % 6328548;
        if (seed == 0) seed = 102834247;

        let sh = seed.toString() + "hola" + (seed*seed).toString() + "hola" + (seedhash % seed).toString(); 
        for(let i = 0; i < sh.length; ++i)
        {
            seedhash ^= ((seedhash << 5) + sh.charCodeAt(i) + (seedhash >> 2));
        }

        word = seedhash.toString() + word + seedhash.toString();
    }

    let hash_ = 1315423911;
    for(let i = 0; i < word.length; i++)
    {
        hash_ ^= ((hash_ << 5) + word.charCodeAt(i) + (hash_ >> 2));
    }

//console.log(word + " : " + seed.toString() + " : " + (hash_ & 0x7FFFFFFF).toString());
     return (hash_ & 0x7FFFFFFF);
};





//////////////////////////////////////////////
function bckf(word, bloom_array, array_size, bloom_count) 
{
    for (let i = 0; i < bloom_count; ++i) {
        let index = hash(word, i) % array_size;

//console.log(index);
        if (!checkBit(bloom_array, index)) return false;
    }
    return true;
};


var test = function (word_) 
{
 var wp = word_.toUpperCase();

//console.log("Preproc: ");
        //// Preprocess
        if (wp.indexOf("\'") > -1) {
            /// decline by conditions
            let z0 = (wp.split("\'").length != 2);
            let z1 = (wp.split("\'")[1].length >= wp.split("\'")[0].length);
            let z2 = (wp.split("\'")[0].length < 3);
            let z3 = (wp.split("\'")[1] != 'S');

            if (z0 || z1 || z2 || z3) {
                return false;
            }
            wp = wp.split("\'")[0];
        }

	//// Suffixes
        let bSuffix;
        for (let i = wp.length; i > 1; i--) {
            if (wp.length > 16) continue;
            let pz = wp.substr(i - 2);
            if (bckf(pz, bas, bsz[1], bks)) {
                wp = wp.substr(0,i-1);
                bSuffix = pz;
                break;
            }
        }

	//// Prefixes
        let bPrefix;
        for (let i = 1; i < wp.length + 1; i++) {
            if (wp.length > 16) continue;
            let px = wp.substr(0, i);
            if (bckf(px,bap, bsz[0], bkp)) {
                wp = wp.substr(i - 1);
                bPrefix = px;
                break;
            }
        }

        let containsStop = bckf(wp,bst, bsz[4], bkst);
        if (containsStop) return false;

        //// Check word in dict
        let contains = bckf(wp, bad, bsz[2], 1);


        //// Check in pos map
	let ge = "AEIOUY";
        let s = "";
        for (let i=0; i< wp.length; i++) {
            s = s+ (ge.indexOf(wp.charAt(i)) > -1 ? "G" : "S");
        }

        let c2 = bckf(s, bpo, bsz[3], bkpo);

/////////////////////////////////////////////////////////////////////

        //// Stat module

        let c3 = true;
        if (contains && c2) {
            let wps = (wfm[wp] == undefined ? 0 : wfm[wp]);
            
            if (wfm_size > 224000) {

                let wbe = 0;
                for (let i = mps = 1; i > wps; i--) {
                    let fp = (fsm[i] == undefined ? 0 : fsm[i]);
                    wbe += fp;
                }

                let pp = 224000 / wbe ;
                if (pp < 1) {
                    pp = pp*pp*pp;
                    let rnd = Math.random();
                    if (rnd > pp) c3 = false;

                    if (Math.random() > pp) c3 = false;
                }

            }

            wfm[wp] = wps + 1;
            wfm_size += 1;
	    let f = (fsm[wps+1] == undefined ? 0 : fsm[wps+1]);

            fsm[wps+1] = f + 1;
            mps = Math.max(mps, wps+1);

        }



return (contains && c2 && c3);
};
exports.test = test;












