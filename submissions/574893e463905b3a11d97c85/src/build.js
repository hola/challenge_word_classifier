var _ = require('lodash'),
    fs = require('fs');
var bloom = require('./bloom');

var doCompile = process.argv[2]=='compile';

var toTrim = ['\'s','ness','ly','s','al','ing','ed','ion','e'];

//we don't add to filter words covered by heuristics to reduce collisions
function shouldAddToFilter(word){
  if(word[0] == '\''){
     return false;
  }
  var aposCount = word.split("'").length-1;
  if(aposCount>1){
    return false;
  }
  if(aposCount && word.slice(-2)!='\'s'){
    return false;
  }

  if((word.match(/[bcdfghjklmnpqrstvwxz]+/g)||[]).map(x =>
    x
    .replace(/([cs]k)|([cgst]+h)|([cg]r)|([gt]s)|st/g,1)
  ).find(x=>x.length>3)){
    return false;
  }
  if(word.length>18){
    return false;
  }
  toTrim.forEach(x=>word.slice(-x.length)==x && word.length>3?word=word.slice(0,-x.length):'');
  if(word.replace(/bility|ation|cism|cial|ism|ality|ist|ativ|ship|ness|ment|aphy|acea|ular|phic|logy|tomy|ceou|ogic|nary|stic|tric|izat/g,'').length>13){//ation
    return false;
  }
  return true;
}
function createDataFile(){
  var words = fs.readFileSync('words.txt').toString().split(/\n/g).map(x => x.trim().toLowerCase());
  for(var i=0;i<words.length;i++){
    var word = words[i];
    if(shouldAddToFilter(word)){
      toTrim.forEach(x=>word.slice(-x.length)==x && word.length>3?word=word.slice(0,-x.length):'');
      if(word.length>3){
        bloom.add(word);
      }
    }
  }
  fs.writeFileSync('../dist/data', new Buffer(bloom.data));
}
function testMinified(){
  var cc = require('closure-compiler');
  var options =
  {
    language_in: 'ECMASCRIPT6',
    compilation_level: 'ADVANCED_OPTIMIZATIONS'
  };
  cc.compile(fs.readFileSync('./impl.js'), options, (err, code)=>{
  console.log(err);
  code = code
  //strip variables declarations
  .replace(/^[^;]+;/,'')
  //replace () for arrow functions
  .replace(/\((\w)\)=>/g,'$1=>')
  //strip return in init function
  .replace(/init\((\w)\){return /,'init($1){')
  ;
  fs.writeFileSync('../dist/solution.js', code);
   require('./tester')('../dist/solution');
  })
}

createDataFile();
if(doCompile){
  testMinified();
}else{
  require('./tester')('./impl.js');
}
