//STRIP
let {affixes} = require('./affixes');
let Trie = require('./trie');
//SEND

let find=(w,a=[])=>{
    let v=trie.get(w)
    if(v&&a.every(af=>v.indexOf(af)!=-1))return true
    let result=false
    affixes.forEach((af,i)=>{
        af.forEach(v=>{
            v=v.split('|')
            let is=v[2][0]=='^',r=new RegExp(v[2]+(is?'':'$')),n

            if(is){
                if(!w.startsWith(v[1]))return
                n=v[0]+w.substr(v[1].length)
            }else{
                if(!w.endsWith(v[1]))return
                n=w.substr(0,w.length-v[1].length)+v[0]
            }
            if(r.test(n))result=result||find(n,[i,...a])
        })
    })
    return result
};

//STRIP
module.exports=find;
//SEND
