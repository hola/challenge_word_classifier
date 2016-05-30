// compress the code to save space...
// parsing word string to feature vector
function parse_inputs(lower_str,word_len){
    var features = [],consonant_vowel_cnt = [0,0]
    var single_vowel_map = ["a","e","i","o","u"];
    var single_vowel_cnt = [0,0,0,0,0];
    var double_vowel_map = ["aa","ae","ai","ao","au","ea","ee","ei","eo","eu","ia","ie","ii","io","iu","oa","oe","oi","oo","ou","ua","ue","ui","uo","uu"];
    var double_vowel_cnt = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
    var gram_2_terms = ["ar","er","or","th","ed","gy","fy","ce","cy","ey","ly","te","ty","ry","cr","gr","sp","un","sh","gh","pl","ph","'s","al","ic","an","ab","ac","ad","bi","co","de","di","di","du","em","en","in","ep","eu","ex","il","in","ig","im","in","ir","my","ob","op","od","op","re","se","sy","un","zo"];
    var gram_3_terms = ["dri","bra","par","car","ble","ple","que","ast","men","jur","jus","qui","vis","ist","ies","phy","tis","cul","tic","ium","gam","gon","ade","age","ant","ard","ary","ate","dom","dox","eer","ent","ern","ese","ess","est","ful","ial","ian","ile","ily","ine","ing","ion","ish","ism","ity","ive","ize","let","oid","oma","ory","ous","ure","abs","act","aer","agr","alg","ami","ana","ann","apo","aqu","art","aud","avi","bar","bin","bio","col","com","con","dec","dem","dis","dia","don","duc","duo","dur","dyn","dys","ego","enn","epi","equ","erg","fac","fer","fid","for","fug","fus","gen","geo","ger","gon","gyn","hem","hex","hyp","iso","jud","lab","lex","lip","ite","loc","log","luc","lud","lus","lun","mal","man","mar","max","mid","min","mis","mit","mob","mon","mot","mov","mut","myo","nat","nav","neg","neo","nom","non","not","nov","oct","ocu","opt","ops","opt","out","oxi","pan","ped","pel","per","pod","pon","pop","pos","pre","pro","pul","put","pyr","ram","reg","rid","rrh","rub","san","sci","sed","sid","sex","sol","sol","son","sta","sub","sum","sym","syn","syl","sys","tax","tel","ten","tin","ter","the","the","tox","tri","uni","urb","vac","ven","ver","vid","vic","vis","viv","vit","voc","vol","vor","xen","xer","xyl","zoo","zyg"];
    var gram_4_terms = ["tive","ture","teen","logu","quit","sens","sent","able","ance","crat","cule","emia","ence","ency","etic","ette","hood","ible","ious","itis","less","like","ling","ment","ness","onym","opia","opsy","osis","pnea","ship","sion","some","tion","tude","ular","uous","ward","ware","wise","gamy","tome","tomy","ical","acro","aero","agri","agro","algo","ambi","amio","andr","anim","ante","anth","anti","apho","aqua","arch","arch","audi","auto","avia","baro","bell","bene","burs","calc","cand","capt","cept","carn","cata","caut","cede","ceed","cess","cent","cert","cide","cise","clam","clar","clud","clus","cogn","corp","cosm","cred","cruc","curr","curs","cycl","deca","deka","deci","demo","demi","dent","dont","derm","dict","duct","dyna","endo","enni","anni","equi","ergo","esth","fact","flor","fore","form","frag","geno","gene","giga","gram","gran","grat","gyno","gyne","grad","hect","heli","hemi","hemo","hema","hepa","hept","hexa","homo","hydr","hygr","hypo","iatr","icon","idio","imag","ject","kilo","kine","lact","leuk","leuc","lipo","lite","lith","logo","loqu","locu","luna","luni","magn","male","mani","manu","mand","mari","matr","medi","mega","mers","meso","meta","metr","migr","mini","miso","miss","mono","mort","narr","necr","neur","noun","nunc","octa","octo","odor","omni","over","pale","para","para","patr","path","pedi","pede","pent","pept","peps","peri","phag","phil","phon","phot","phys","phyt","plas","plod","plos","pode","poli","poly","port","post","prot","pugn","pung","purg","pyro","quad","quin","rami","rhin","rhod","rupt","scop","sect","sess","self","semi","sept","serv","somn","soph","spec","spic","spir","tact","tang","taxo","tele","telo","temp","tent","trit","term","terr","theo","tort","vent","veri","verb","vers","vert","vice","vivi","voci","voli","volu","vour","xeno","xero","xeri","zygo"];
    var gram_5_terms = ["amphi","ambul","andro","antho","arbor","archi","archa","archi","arthr","astro","aster","audio","belli","bibli","blast","ceive","cardi","carni","caust","celer","centi","centr","chrom","chron","chrys","claim","cline","cogni","corpo","cosmo","cumul","dendr","derma","diplo","domin","donat","dynam","ethno","extra","extro","flect","flora","fleur","fract","funct","gastr","graph","gress","grade","gradi","hecto","hecat","helic","helio","hepta","herbi","histo","homeo","hydro","hygro","hyper","iatro","icono","infra","inter","intra","intro","junct","juven","kinet","lacto","later","leuko","leuco","liber","lingu","litho","lumin","macro","magna","magni","mania","mater","matri","melan","memor","merge","meter","metry","micro","milli","morph","multi","necro","nephr","neuro","nomin","numer","ortho","osteo","paleo","pater","patri","penta","phage","philo","phono","phone","phony","photo","phyll","phyto","phyte","plast","plasm","plaud","plaus","pneum","proto","pseud","psych","pugna","quadr","quart","quint","radic","radix","radio","retro","rhino","rhodo","rrhea","rrhag","scend","scler","scope","scopy","scrib","septi","somni","spect","stell","super","terra","terri","tetra","therm","tract","trans","ultra","vince","xanth","cracy","arian","arium","ation","ative","acity","algia","cycle","esque","iasis","ology","pathy","phile","gonic","loger","otomy","sophy","scrip"];
    var gram_6_terms = ["annenn","arthro","biblio","blasto","cardio","centro","centri","cephal","cerebr","chromo","chrono","chryso","circum","circle","contra","cranio","crypto","dendro","dendri","gastro","graphy","helico","hetero","melano","memori","morpho","nephro","oxioxy","phyllo","pneumo","pseudo","psycho","quadri","rrhoea","sclero","script","sphere","struct","techno","tempor","thermo","aholic","ectomy","iatric","phobia","plegia","plegic","trophy","logist","ostomy","scribe","sophic"];
    var gram_k_terms = ["anthrop","cephalo","cerebro","contrao","counter","genesis","kinemat","termina","escence","ization","anthropo","esthaesth"];
    var multi_grams         = [gram_k_terms,gram_6_terms,gram_5_terms,gram_4_terms,gram_3_terms,gram_2_terms];
    var multi_grams_weights = [6,5,4,3,2,1];
    var xaye = 0,aaa = 0,xx = 0;
    var word_is_vowel = [];
    features.push(word_len);                                // 1
    for(var i = 0; i < word_len; i++){
        var is_vowel = false;
        for(var j = 0 ; j < single_vowel_map.length; j++)
            if(lower_str[i].search(single_vowel_map[j]) == 0) is_vowel = true,single_vowel_cnt[j] += 1;
        if(is_vowel) word_is_vowel.push(1),consonant_vowel_cnt[0] += 1;
        else word_is_vowel.push(0),consonant_vowel_cnt[1] += 1;
    }for(var i = 0; i < word_len; i++){
        if(i+3 < word_len && lower_str[i+3] == "e" && word_is_vowel[i] == 0 && word_is_vowel[i+1] == 1 && word_is_vowel[i+2] == 0) xaye += 1;
        if(i+2 < word_len && word_is_vowel[i] == 1 && word_is_vowel[i+1] == 1 && word_is_vowel[i+2] == 1) aaa += 1;
        if(i+1 < word_len && lower_str[i] == lower_str[i+1] && word_is_vowel[i] == 0 && word_is_vowel[i+1] == 0) xx += 1;
    }features.push.apply(features,[xaye,aaa,xx])             // 1+1+1
    var end_is_vowel = 0;
    if(word_is_vowel[word_len-1] == 1) end_is_vowel = 1;
    features.push(end_is_vowel)                             // 1
    for(var i = 0; i < double_vowel_map.length; i++){
        var cur_re = new RegExp(double_vowel_map[i],"g");
        double_vowel_cnt[i] = (lower_str.match(cur_re) || []).length;
    }features.push.apply(features,single_vowel_cnt)         // 5
    features.push.apply(features,double_vowel_cnt)         // 25
    sum_of_double_vowel_cnt = 0;
    for(var i = 0; i < double_vowel_cnt.length; i++) sum_of_double_vowel_cnt += double_vowel_cnt[i];
    features.push(sum_of_double_vowel_cnt)                 // 1
    features.push.apply(features,consonant_vowel_cnt)      // 2
    var each_gram_sum = [];
    for(var i = 0; i < multi_grams.length; i++){
        var cur_gram_ret = [0.0,0.0,0.0,0.0]
        for(var j = 0; j < multi_grams[i].length; j++){
            first_pos = lower_str.indexOf(multi_grams[i][j]);
            last_pos = lower_str.lastIndexOf(multi_grams[i][j]);
            var cur_ret = [0.0,0.0,0.0,0.0]
            if(first_pos >= 0 && last_pos >= 0){
                if(first_pos == 0) cur_ret[0] += multi_grams_weights[i];
                if(first_pos != 0 && last_pos != word_len - multi_grams[i][j].length) cur_ret[1] += multi_grams_weights[i];
                if(last_pos == word_len - multi_grams[i][j].length) cur_ret[2] += multi_grams_weights[i];
                cur_ret[3] += (first_pos + last_pos) * 1.0 / word_len
            }for(var k = 0; k < cur_gram_ret.length; k++) cur_gram_ret[k] += cur_ret[k];
        }features.push.apply(features,cur_gram_ret);        // 6 * 4
        each_gram_sum.push(cur_gram_ret[0] + cur_gram_ret[1] + cur_gram_ret[2] + cur_gram_ret[3]);
    }features.push.apply(features,each_gram_sum);           // 6
    var char_ratio = [];
    var str_front_end = [];
    for(var i = 0; i < 27; i++) char_ratio.push(0.0),str_front_end.push(0);
    for(var i = 0; i < word_len; i++) char_ratio[getCid(lower_str.charCodeAt(i))] += 1;
    str_front_end[getCid(lower_str.charCodeAt(0))] += 1;
    str_front_end[getCid(lower_str.charCodeAt(word_len - 1))] += 1;
    for(var i = 0; i < 27; i++){
        char_ratio[i] = char_ratio[i] * 1.0 / word_len;
        str_front_end[i] = str_front_end[i] * 1.0 / word_len;
    }features.push.apply(features,char_ratio);              // 27
    features.push.apply(features,str_front_end);           // 27
    return features;
}function getCid(cur_idx){
    if(cur_idx - 'a'.charCodeAt(0) == -58) return 26;
    return cur_idx - 'a'.charCodeAt(0);
}function SpecailHahsMux(hash_val,str_len){
    var bit_id = hash_val % (max_hash_limit * off_set_base)
    return [parseInt(bit_id / off_set_base),bit_id % off_set_base];
}function BKDRHash(word,str_len){ // ok
    var int_seed = 131313; // 31 131 1313 13131 131313 etc..
    var int_hash = 0;
    var safe_hash = parseInt(Number.MAX_SAFE_INTEGER / int_seed);
    for(var idx = 0; idx < str_len; idx++){
        if(int_hash > safe_hash) int_hash %= safe_hash;
        int_hash = int_hash * int_seed + getCid(word.charCodeAt(idx));
        int_hash = (int_hash & 0xffffffff) >>> 0;
    }return SpecailHahsMux(((int_hash & 0x7FFFFFFF) >>> 0),str_len);
}function APHash(word,str_len){ // ok
    var int_hash = 0;
    for(var idx = 0; idx < str_len; idx++ ){
        if((idx & 1) == 0) int_hash ^= (((int_hash << 7) >>> 0)^ getCid(word.charCodeAt(idx)) ^ (int_hash >>> 3));
        else int_hash ^= (~(((int_hash << 11) >>> 0) ^ getCid(word.charCodeAt(idx)) ^ (int_hash >>> 5)));
        int_hash = int_hash >>> 0;
    }return SpecailHahsMux(((int_hash & 0x7FFFFFFF) >>> 0),str_len);
}function DJBHash(word,str_len){ // ok
    var int_hash  = 5381;
    for(var idx = 0; idx < str_len; idx++){
        int_hash += ((int_hash << 5) >>> 0) + getCid(word.charCodeAt(idx));
        int_hash = int_hash >>> 0;
    }return SpecailHahsMux(((int_hash & 0x7FFFFFFF) >>> 0),str_len);
}function JSHash(word,str_len){ // ok
    var int_hash = 1315423911;
    for(var idx = 0; idx < str_len; idx++){
        int_hash ^= (((int_hash << 5) >>> 0) + getCid(word.charCodeAt(idx)) + (int_hash >>> 2));
        int_hash = int_hash >>> 0;
    }return SpecailHahsMux(((int_hash & 0x7FFFFFFF) >>> 0),str_len);
}function RSHash(word,str_len){ // ok
    var b = 378551,a = 63689,int_hash = 0,safe_hash_b = parseInt(Number.MAX_SAFE_INTEGER / b);
    for(var idx = 0; idx < str_len; idx++ ){
        if(int_hash * a > Number.MAX_SAFE_INTEGER) int_hash %= parseInt(Number.MAX_SAFE_INTEGER / a)
        int_hash = int_hash * a + getCid(word.charCodeAt(idx));
        int_hash = (int_hash & 0xffffffff) >>> 0;
        if(a > safe_hash_b) a %= safe_hash_b
        a *= b;
        a = (a & 0xffffffff) >>> 0;
    }return SpecailHahsMux(((int_hash & 0x7FFFFFFF) >>> 0),str_len);
}function SDBMHash(word,str_len){ // ok
    var int_hash = 0;
    for(var idx = 0; idx < str_len; idx++ )
        int_hash = getCid(word.charCodeAt(idx)) + ((int_hash << 6) >>> 0) + ((int_hash << 16) >>> 0) - int_hash;
    return SpecailHahsMux(((int_hash & 0x7FFFFFFF) >>> 0),str_len);
}function parseBits(hash_val){
    var dicimal_bits = [],groups = parseInt(hashf_cnt / hashf_group)
    if(groups == 1) dicimal_bits=[hash_val];
    else dicimal_bits=[hash_val % 10,parseInt(hash_val / 10)];
    return dicimal_bits;
}
myBloomFilter = function(word,word_len){
    var hashv = new Array(hashf_cnt),ofset = new Array(hashf_cnt);
    if(hashf_cnt-1 >= 0){
        [hashv[0],ofset[0]] = BKDRHash(word,word_len);
        hashv[0] = parseBits(hash_str.charCodeAt(hashv[0]) - index_int);
    }if(hashf_cnt-1 >= 1){
        [hashv[1],ofset[1]] = JSHash(word,word_len);
        hashv[1] = parseBits(hash_str.charCodeAt(hashv[1]) - index_int);
    }if(hashf_cnt-1 >= 2){
        [hashv[2],ofset[2]] = DJBHash(word,word_len);
        hashv[2] = parseBits(hash_str.charCodeAt(hashv[2]) - index_int);
    }if(hashf_cnt-1 >= 3){
        [hashv[3],ofset[3]] = RSHash(word,word_len);
        hashv[3] = parseBits(hash_str.charCodeAt(hashv[3]) - index_int);
    }if(hashf_cnt-1 >= 4){
        [hashv[4],ofset[4]] = APHash(word,word_len);
        hashv[4] = parseBits(hash_str.charCodeAt(hashv[4]) - index_int);
    }if(hashf_cnt-1 >= 5){
        [hashv[5],ofset[5]] = SDBMHash(word,word_len);
        hashv[5] = parseBits(hash_str.charCodeAt(hashv[5]) - index_int);
    }for(var idx = 0; idx < hashf_cnt; idx++){
        var group_ofset = idx % hashf_group,shift_step = group_ofset + ofset[idx],shifts = 1;
        for(var idy = 0; idy < shift_step; idy++) shifts *= 2;
        if((hashv[idx][parseInt(idx / hashf_group)] & shifts) >>> 0 == 0) return false;
    }return true;
} // BF and ML models
var models = [],index_char = "(",index_int = index_char.charCodeAt(0);
var hash_str = "",max_hash_limit = 2000000;
var off_set_base = 1,hashf_cnt = 6,hashf_group = 6,ignore_UPPER_ratio = 1.0;
var start_als_cond = ["s","c","p","a","m","b","t","d","r","u","h","e"];
var length_cond    = [9,8,10,7,11,6,12,13,5,14,15,4];
// initialize all models
exports.init = function(data){
    var j_models = JSON.parse(data);
    hash_str       = j_models["BF_hs"];      // hash string
    max_hash_limit = j_models["BF_mhl"];     // int = hash_str.length
    off_set_base = j_models["BF_osb"];       // int
    hashf_cnt    = j_models["BF_hc"];        // int
    hashf_group  = j_models["BF_hg"];        // int
    ignore_UPPER_ratio = j_models["BF_iur"]; // float
    start_als_cond     = j_models["BF_sac"]; // list
    length_cond        = j_models["BF_lc"];  // list
    var score_sum = 0.0;
    for(let name_key in j_models["models"]) score_sum += j_models[j_models["models"][name_key] + "_score"];
    for(let name_key in j_models["models"]){
        model_name = j_models["models"][name_key];
        var weights = [];
        weights.push(model_name);                                       // 0
        weights.push(j_models[model_name + "_score"] / score_sum);      // 1
        if(model_name == "DT"){
            eval(j_models[model_name + "_weights"]);
            weights.push(j_models[model_name + "_min_max_prob"])        // 2
        }else{
            for(let weight_key in j_models[model_name + "_weights"])    // 2 ~ 1+F
                weights.push(j_models[model_name + "_weights"][weight_key]);
            weights.push(j_models[model_name + "_coef"]);               // 2+F
        } models.push(weights);
    }
};// calculate scores for each model
exports.test = function(word) {
    var upper_ch_ratio = 0.0,prdict = true;
    for(var i = 0; i < word.length; i++) if(word[i] >= 'A' && word[i] <= 'Z') upper_ch_ratio += 1.0;
    upper_ch_ratio = upper_ch_ratio * 1.0 / word.length;
    var is_start_ok = start_als_cond.indexOf(word.toLowerCase()[0]) >= 0;
    var is_lengh_ok = length_cond.indexOf(word.length) >= 0;
    if(upper_ch_ratio <= ignore_UPPER_ratio && (is_start_ok && is_lengh_ok)){
        prdict = myBloomFilter(word.toLowerCase(),word.length);
    }else if(models.length > 0){
        features = parse_inputs(word.toLowerCase(),word.length);
        var weight_score = 0.0,each_score = [];
        for(var i = 0; i < models.length; i++){
            var cur_score = [1,0.0];
            if(models[i][0] != "DT"){
                for(var j = 0; j < features.length; j++) cur_score[1] += features[j] * models[i][2 + j];
                cur_score[1] += models[i][2 + features.length];
                if(cur_score[1] < 0.0) cur_score[0] = -1.0;
                weight_score += cur_score[1] * models[i][1];
            }else{
                cur_score = DTPredict(features);
            } each_score.push(cur_score);
        } // average voting...
        var vote_score = 0.0;
        for(var i = 0; i < each_score.length; i++) vote_score = each_score[i][0] * models[i][1];
        if(vote_score >= 0.0) prdict = true;
        else prdict = false;
        // non-tree-model weighted score...
        if(weight_score >= 0.0) prdict = true;
        else prdict = false;
    }else{
        if(Math.random() >= 0.5) prdict = false;
    }
    return prdict;
};
