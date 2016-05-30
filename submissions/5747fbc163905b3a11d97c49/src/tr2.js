var fs= require('fs');
var words=JSON.parse(fs.readFileSync( 'wordst88.txt' ).toString())
var wordst=fs.readFileSync( 'ee.txt' ).toString().toLowerCase().trim().split('\n')
var n=false
var l=""
var nl=[]
for(var i=0;i<wordst.length;i++){
  for(var l=0;l<words.length;l++){
    if(wordst[i]==words[l]){
      n=true
      console.log(wordst[i])
      l=wordst[i]
    }
  }
  if(n){
    nl.push(l)
    n=false
  }
}
fs.writeFileSync("wordst2222.txt",'["'+nl.join('","')+'"]')
