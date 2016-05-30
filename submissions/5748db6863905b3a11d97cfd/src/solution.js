var pos = 0;
var content =[];
var c_pos = [];

var word_cnt = 0;
var mls=[16,14,17,16,15,14,14,16,17,11,11,14,16,17,16,17,11,15,17,16,17,13,12,6,8,10,0];

function code_char(ch1){
  var r = 26;
  switch(ch1){
    case 'a': r--;
    case 'b': r--;
    case 'c': r--;
    case 'd': r--;
    case 'e': r--;
    case 'f': r--;
    case 'g': r--;
    case 'h': r--;
    case 'i': r--;
    case 'j': r--;
    case 'k': r--;
    case 'l': r--;
    case 'm': r--;
    case 'n': r--;
    case 'o': r--;
    case 'p': r--;
    case 'q': r--;
    case 'r': r--;
    case 's': r--;
    case 't': r--;
    case 'u': r--;
    case 'v': r--;
    case 'w': r--;
    case 'x': r--;
    case 'y': r--;
    case 'z': r--;
  }
  return r;
}

function decode_char(n){
var chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','\''];
 if((n>=0)&&(n<27)) return chars[n];
 else return '-';
}

function check_vowel(c){
 return ((c=='a')||(c=='e')||(c=='i')||(c=='o')||(c=='u')||(c=='y'));
}

function del_end(w,n){
 var w2 = '';
 for(var i = 0; i < w.length-n; i += 1){
  w2 = w2+w.charAt(i);
 }
 return w2;
}

function read_node(data, str, deph, pri){
 var mask=0;
 var tmp=0;
 if(pos+4>data.length){
  return 0;
 }
 mask= data[pos++];
 tmp = data[pos++];
 mask|= tmp<<8;
 tmp = data[pos++];
 mask|= tmp<<16;
 tmp = data[pos++];
 mask|= tmp<<24;

 if(mask&(1<<30)){
  content[word_cnt++] = str;
 }

 var b_mask = 1;
 for(var i = 0; i < 26; i += 1){

  if(deph==1){
    c_pos[pri*26+i]=word_cnt;
  }
  if(mask&b_mask){
    if(deph<4){
      read_node(data, str+decode_char(i), deph+1, i);
    }else{
      content[word_cnt++] = str+decode_char(i);
    }
  }
  b_mask<<=1;
 }
 return 1;
}

exports.init = function(data){
 read_node(data, '', 0,0);
 c_pos[26*26]=word_cnt;
 return 1;
}

exports.test = function(w){
 var lw=w.length;
 var w2, w3;
 if(w.length>mls[code_char(w.charAt(0))]) return false;
 if(w.charAt(w.length-1)=='\'') return false;
 if(lw==1) return true;
 if((w.length>2)&&(w.charAt(w.length-1)=='s')&&(w.charAt(w.length-2)=='\'')){
   w=del_end(w,2);
   lw=w.length;
 }
 for(var i = 0; i < lw; i += 1){
   if(w.charAt(i)=='\'') return false;
 }
 if(lw){

 if( (lw>4)&&(lw<7)&&(w.charAt(lw-1)=='s')&&(w.charAt(lw-2)=='e') ){
  if((!check_vowel(w.charAt(lw-3)))&&(check_vowel(w.charAt(lw-4))) ){
   w=del_end(w,1);
   lw-=1;
  }
 }

 if(lw>5){
  w3=w.charAt(0)+w.charAt(1)+w.charAt(2)+w.charAt(3)+w.charAt(4);
 }else{
  w3=w;
 }



  var bch=code_char(w.charAt(0))*26+code_char(w.charAt(1));
  if(bch<26*26){
   for(var i=c_pos[bch];  i<c_pos[bch+1]; i++){
     if(w3==content[i]) return true;
   }
  }
 }
 return false;
}