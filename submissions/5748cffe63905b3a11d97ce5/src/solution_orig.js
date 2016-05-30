"use strict";
function checkBit(buffer_, bit) 
{
  let byte_num = Math.floor(bit/8);
  let bit_num = bit - byte_num*8;
  
  let flag = Math.pow(2, bit_num); 
  let number = buffer_.readUInt32LE(byte_num);
  return (number & flag) === flag;
};






  var bloomArrayPref;
  var bloomArraySuff;
  var bloomArrayDict;
  var bloomArrayPos;
  var bloomArrayStop;
  var bloomSizes = new Array;

  var bloomK_P;
  var bloomK_S;
  var bloomK_Pos;
  var bloomK_Stop;

  var currentPosInBuffer = 0;


    var wordFreqMap = {};
    var freqSizesMap = {}; // <size, count>
    var max_povtors = 0;
    var wfm_size = 0;


var init = function (buffer__) 
{
  bloomArrayPref = readBitArray(buffer__);
  bloomArraySuff = readBitArray(buffer__);
  bloomArrayDict = readBitArray(buffer__);
  bloomArrayPos = readBitArray(buffer__);
  bloomArrayStop = readBitArray(buffer__);  

  bloomK_P = buffer__.readUInt8(currentPosInBuffer);
  bloomK_S = buffer__.readUInt8(currentPosInBuffer+1);
  bloomK_Pos = buffer__.readUInt8(currentPosInBuffer+2);
  bloomK_Stop = buffer__.readUInt8(currentPosInBuffer+3);
};
exports.init = init;


function readBitArray(buffer_) 
{
   let bf_size = buffer_.readUInt32BE(currentPosInBuffer);
   bloomSizes.push(bf_size);
   currentPosInBuffer+=4;
   var bf = Buffer.allocUnsafe(bf_size);
   buffer_.copy(bf, 0, currentPosInBuffer, currentPosInBuffer + bf_size/8);
   currentPosInBuffer+=bf_size/8;
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
function bloomCheck(word, bloom_array, array_size, bloom_count) 
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
            let cond_0 = (wp.split("\'").length != 2);
            let cond_1 = (wp.split("\'")[1].length >= wp.split("\'")[0].length);
            let cond_2 = (wp.split("\'")[0].length < 3);
            let cond_3 = (wp.split("\'")[1] != 'S');

//console.log("Preproc: " + cond_0 + " " + cond_1 + " " + cond_2 + " " + cond_3 + " ");

            if (cond_0 || cond_1 || cond_2 || cond_3) {
                return false;
            }
            wp = wp.split("\'")[0];
        }

	//// Suffixes
        let bSuffix;
        for (let i = wp.length; i > 1; i--) {
            if (wp.length > 16) continue;
            let presuffix_suffix = wp.substr(i - 2);
            if (bloomCheck(presuffix_suffix, bloomArraySuff, bloomSizes[1], bloomK_S)) {
                wp = wp.substr(0,i-1);
                bSuffix = presuffix_suffix;
                break;
            }
        }

	//// Prefixes
        let bPrefix;
        for (let i = 1; i < wp.length + 1; i++) {
            if (wp.length > 16) continue;
            let prefix_postprefix = wp.substr(0, i);
            if (bloomCheck(prefix_postprefix,bloomArrayPref, bloomSizes[0], bloomK_P)) {
                wp = wp.substr(i - 1);
                bPrefix = prefix_postprefix;
                break;
            }
        }

        let containsStop = bloomCheck(wp,bloomArrayStop, bloomSizes[4], bloomK_Stop);
        if (containsStop) return false;

        //// Check word in dict
        let contains = bloomCheck(wp, bloomArrayDict, bloomSizes[2], 1);


        //// Check in pos map
	let glasnye = "AEIOUY";
        let s = "";
        for (let i=0; i< wp.length; i++) {
            s = s+ (glasnye.indexOf(wp.charAt(i)) > -1 ? "G" : "S");
        }

        let c2 = bloomCheck(s, bloomArrayPos, bloomSizes[3], bloomK_Pos);

/////////////////////////////////////////////////////////////////////

        //// Stat module

        let c3 = true;
//console.log(wordFreqMap.length);
        if (contains && c2) {
            let word_povtors = (wordFreqMap[wp] == undefined ? 0 : wordFreqMap[wp]);
            
            if (wfm_size > 224000) {

                let words_before = 0;
                for (let i = max_povtors = 1; i > word_povtors; i--) {
                    let fp = (freqSizesMap[i] == undefined ? 0 : freqSizesMap[i]);
                    words_before += fp;
                }
//console.log(words_before);
                let pp = 224000 / words_before ;
                if (pp < 1) {
                    pp = pp*pp*pp;
                    let rnd = Math.random();
                    if (rnd > pp) c3 = false;
//console.log(pp);
                    if (Math.random() > pp) c3 = false;
                }



            }

            wordFreqMap[wp] = word_povtors + 1;
            wfm_size += 1;
	    let f = (freqSizesMap[word_povtors+1] == undefined ? 0 : freqSizesMap[word_povtors+1]);
//console.log(f);
            freqSizesMap[word_povtors+1] = f + 1;
            max_povtors = Math.max(max_povtors, word_povtors+1);
//console.log(Object.keys(wordFreqMap).length);
        }



return (contains && c2 && c3);
};
exports.test = test;









//var fs = require('fs');
//var buffer = fs.readFileSync('/media/sf_SOC2.0/projects/hola/release/data');
//init(buffer);
//console.log(bloomSizes);
//console.log(bloomK_P);
///console.log(bloomK_S);
//console.log(bloomK_Pos);
//console.log(bloomK_Stop);











