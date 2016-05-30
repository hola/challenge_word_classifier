'use strict'
var bloom = {
    h0(s){
        var r = 1;
        for (var i = 0; i < s.length; ++i){
            var c = s.charCodeAt(i)-95;
            if (c<0)c=0;
            r = (133*r+c)& 0x00FFFFF;
        }
        return r;
    },
    test(u8,s){
        var bit = this.h0(s) % 0x07FFFF
            return (u8[2197+Math.floor(bit/8)] & (1 << (bit % 8))) != 0;
    }
}

var gw1 = ["a'asia","baha'i","baha'i's","baha'ullah","baha'ullah's","bahc'ae","cap'n","ch'an","ch'in","ch'in's","ch'ing","cha'ah","d'aeth","d'amboise","d'amour","d'andre","d'annunzio","d'arcy","d'arcy's","d'arrest","d'artagnan","d'attoma","d'avenant","d'iberville","d'ignazio","d'inzeo","d'oria","d'urfey","d'arcy","d'ewart","der'a","gi'd","gi'ing","ge'ez","hallowe'en","i'd","i'll","i'm","i've","ko'd","ko'ing","kinko's's","l'allegro","l'amour","l'amour's","l'aquila","l'avare","l'enfant","l'etranger","l'hospital","l'immoraliste","l'oreal","l'oreal's","l'otage","l'ouverture","l'ouverture's","l'vov","landsm'al","levi's's","m'ba","m'taggart","m'sieur","mcdonald's's","mu'min","n'djamena","n'djamena","ne'erday","nuku'alofa","o'boyle","o'brien","o'brien's","o'callaghan","o'callaghan's","o'carroll","o'carroll's","o'casey","o'casey's","o'connell","o'connell's","o'conner","o'conner's","o'connor","o'connor's","o'dell","o'dell's","o'doneven","o'doneven's","o'donnell","o'donnell's","o'donoghue","o'donoghue's","o'donovan","o'donovan's","o'driscoll","o'driscoll's","o'dwyer","o'fallon","o'faolain","o'faolcin","o'fiaich","o'flaherty","o'gowan","o'gowan's","o'grady","o'grady's","o'hara","o'hara's","o'hare","o'higgins","o'higgins's","o'keeffe","o'keeffe's","o'kelley","o'kelly","o'kelly's","o'leary","o'mahony","o'mahony's","o'malley","o'malley's","o'meara","o'meara's","o'neil","o'neil's","o'neill","o'neill's","o'reilly","o'reilly's","o'rourke","o'rourke's","o'shea","o'shee","o'shee's","o'sullivan","o'toole","o'toole's","ok'd","ok'ing","po'd","prud'hon","qur'an","qur'anic","san'a","shari'a","shari'a's","shi'ite","shi'ite's","t'ang","t'ang's","to'd","ta'izz","wendy's's","xi'an","xi'an's","zu'lkadah","a'body","a'thing","ain't","akwa'ala","all'antica","all'italiana","all'ottava","amn't","an'a","an't","anybody'd","ar'n't","aren't","b'hoy","baws'nt","betra'ying","bo's'n","bo's'n's","bo's'ns","bo'sun","bo'sun's","bo'suns","bos'n","bos'n's","bos'ns","br'er","ca'canny","can't","ch'in","could've","couldn't","cowslip'd","d'albert","d'alembert","d'arblay","d'arezzo","d'arezzo's","d'estaing","d'estaing's","d'holbach","d'indy","d'accord","d'art","d'etat","d'oeuvre","daren't","dasn't","dassn't","didn't","doctors'commons","doesn't","dog'sbane","don't","don'ts","e'en","e'er","entr'acte","entr'acte's","entr'actes","fa'ard","fatwa'd","fo'c's'le","fo'c's'le's","fo'c's'les","fo'c'sle","fo'c'sle's","fo'c'sles","freez'd","g'day","guv'nor","guv'nor's","guv'nors","h'm","ha'it","ha'nt","ha'p'orth","ha'p'orth's","ha'p'orths","ha'pennies","ha'penny","ha'penny's","ha'pennyworth","hadn't","hain't","hallowe'en","halo'd","han't","hasn't","haven't","he'd","he'll","her'n","his'n","how'd","how're","howe'er","i'd","i'faith","i'll","i'm","i've","idea'd","in't","isn't","it'd","it'll","j'accuse","j'adoube","j'ouvert","jews'harp","jusqu'auboutisme","jusqu'auboutist","jusqu'auboutiste","k'ri","ko'd","l'addition","l'aquila","l'chaim","l'envoy","l'oeil","l'tre","los'te","ma'am","mayn't","might've","mightn't","mu'adhdhin","must've","mustn't","n'djamena","n'gana","n'importe","n't","nasta'liq","ne'er","needn't","nobody'd","nor'east","nor'easter","nor'west","nor'wester","north'ard","o'clock","o'er","o'ertop","ogee'd","oughtn't","our'n","pa'anga","penn'orth","penn'orth's","penn'orths","po'chaise","pyjama'd","qur'an","rec'd","s'elp","s'help","samh'in","schoolma'am","se'nnight","sec'y","sha'ban","shan't","she'd","she'll","she'ol","shi'ite","should've","shouldn't","silo'd","snipe'sbill","somebody'll","someone'll","sou'easter","sou'west","sou'wester","south'ard","stuns'l","stuns'l's","stuns'ls","t'other","ta'en","tallyho'd","tell'd","that'd","that'll","there'd","there'll","they'd","they'll","they're","they've","this'll","tiara'd","today'll","trans'mute","unidea'd","usedn't","usen't","wasn't","we'd","we'll","we're","we've","weren't","what'd","what'll","what're","what've","whate'er","whatsoe'er","when'd","when'll","when're","whene'er","whensoe'er","where'd","where'er","where'll","where're","where've","wheresoe'er","who'd","who'll","who're","who've","why'd","why'll","why're","win't","wolf'smilk","won't","would've","wouldn't","wrong'un","wrong'un's","wrong'uns","x'ing","y'all","ye'se","you'd","you'll","you're","you've","your'n"];
var bw2char = ["jq","jx","jz","qj","qx","qz","vq","xj","zx"];
var byteBuf;
module.exports = {
    init(buf){
        byteBuf = Buffer.from(buf,'binary');
    },
    test(str){
        str = str.toLowerCase();
        if(this.U(str))return false;
        if(str.indexOf("'") >= 0 ) {
            if (gw1.indexOf(str)>=0) return true;
            if(str.substr(-2) == "'s") str = str.substr(0,str.length-2);
            if(str.indexOf("'") >= 0 )  return false;
        }
        if(str.length<18 && Math.abs(str.length - (str.match(/[euioa']/g) || []).length) < 10 && Y(str)&& bloom.test(byteBuf,str))return true
        return false;
    },
    U(str){
        for (let i in bw2char){
            if(str.indexOf(bw2char[i]) >= 0) return true;
        }
        return false;
    }
}
function W(s){
    return 26*26*(s.charCodeAt(0)-97)+26*(s.charCodeAt(1)-97)+(s.charCodeAt(2)-97);
}
function X(u8,W){
    return u8[Math.floor(W/8)] & (1 << (W % 8));
}
function Y(str){
    for(let i=0; i<str.length-2;i++)
        if(X(byteBuf,W(str.substr(i,3))) == 0)return false;
    return true;
}
