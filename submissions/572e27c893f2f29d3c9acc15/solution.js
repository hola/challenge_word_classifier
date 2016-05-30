var B1;const B2=580000;var B3=8;const B4="abcdefghijklmnopqrstuvwxyz'";var B5;const B6=["'","jq","jx","jz","qj","qx","qz","vq","xj","zx","'j","'q","'x","'z","''"];
exports.init=function(a){B1=a;f3()}
exports.test=function(a){var b=1;if(a.length>=23){return false}B3=2;var c=f2(a);for(var j=0;j<c.length;j++){var d=c[j];if(B6.indexOf(d)>-1){return false}}if(a.length>2){var e=0;while(e+3<=a.length){var f=a.substring(e,3+e);var g=f4(f);g+=B2;e++;if(f1(g)>0){return false}}}B3=8;var h=f2(a);for(var j=0;j<h.length;j++){b=1;var d=h[j];var k=h[j];for(var i=0,len=k.length;i<len;i++){var l=d.charCodeAt(i);b=(((b+l*19)*17)%B2)}if(f1(b)==0){return false}}return true}
f1=function(a){var b=Math.floor(a/8);var c=B1[b];var d=a%8;var e=1<<d;e=c&e;return e}
f2=function(a){if(a.length<=B3){return[a]}var b=[];var c=0;while(c+B3<=a.length){b.push(a.substring(c,B3+c));c++}return b}
f3=function(){B5=[];var a=0;for(var i=0;i<B4.length;i++){for(var j=0;j<B4.length;j++){for(var t=0;t<B4.length;t++){a++;var b=""+B4[i]+B4[j]+B4[t];B5.push([b,a])}}}}
f4=function(a){for(var i=0;i<B5.length;i++){if(B5[i][0]==a){return B5[i][1]}}return 0}