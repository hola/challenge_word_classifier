var t=["zv","zc","zx","zj","zg","zf","zd","zp","zr","zq","yj","yy","yq","xn","xv","xx","xz","xk","xj","xg","xd","xr","xq","wx","wz","wj","wq","vm","vb","vc","vx","vz","vk","vj","vh","vg","vf","vd","vp","vt","vw","vq","tx","tq","sx","rx","qm","qn","qb","qv","qc","qx","qz","ql","qk","qj","qh","qg","qf","qd","qs","qp","qo","qy","qt","qr","qe","qw","qq","pv","px","pz","pj","pq","hx","hj","hq","mx","mj","mq","lx","lq","kx","kz","kq","jm","jn","jb","jv","jc","jx","jz","jl","jk","jj","jg","jf","jd","js","jp","jy","jt","jr","jw","jq","gv","gx","gz","gj","gq","fv","fx","fz","fk","fj","fq","dx","dq","cv","cx","cj","cw","bx","bz","bq"]
var gl ='euioay'
var words,words2;
module.exports.init=function(data){
  var tmp=data.toString().toLowerCase().trim().split('~\n')
  words=tmp[0].split('\n')
  words2=tmp[1].split('\n')
};
module.exports.test=function(tex){
  var text=tex;
  var n=false;
  var i;
  var h=0;
  for(i=0;i<words.length;i++){
    if(words[i]==text.slice(-3) ) h++
  }
  if(h){
    h=0
	 for(i=0;i<words2.length;i++){
      if(words2[i]==text.slice(0,3) ) h++
    }
    if(h){
    n=true
    h=0;
    if(text.length>13||text.length<3){
      n=false;

    }else{
      for(i=0;i<t.length;i++){
        if (text.search(t[i]) != -1) {n=false;}
      };
    };
    if(n){
      i=text.search("'");
      if(i!=-1){
        i=text.split("'");
        console.log(i.length)
        if(i.length!=2){
          n=false;
        }else{
          text=i[0];
        };
      };
      for(i=0;i<text.length;i++){
        if(gl.search(text[i])==-1){
          if(h>=4){
            n=false;
          }else{
            if(h>=0) h++;
            else h=1;
          };
        }else{
          if(h<=-3){
            n=false;
          }else{
            if(h<=0) h-=1;
            else h=-1;
          };
        };
      };
    }
  }
    console.log(n)
    return n;
  }

};
