var tokens;
var test = function(word) 
{
 var len = 0;
 word = word.toLowerCase();
 len = word.length;
 if (len <=2 ||len >=25 ) 
 {
  len = tokens.words[word];
  return len !== undefined;
 }
 var token;
 var mask;
 for(var i = 0 ;i<len-2;i++) 
 {
  token = word.slice(i,i+2);
  var len2 = tokens.tokens[token];
  console.log('len is '+len2+';');
  if (len2!==undefined) 
  {
   
   mask = parseInt(len2 , 10).toString(2).split("").reverse();
   console.log('mask is '+mask+'');
   if (mask[i]!= '1') return false;
   if (mask[len+24] != '1') return false;
  }
  else 
  {
   return false;
  }
 }
 return true;
}
var init = function(buffer) {
 tokens = JSON.parse(buffer);
 }
module.exports.test = test;
module.exports.init = init;