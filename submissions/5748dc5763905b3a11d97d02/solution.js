let dataPos;
module.exports.init=function(data){
dataPos=data.indexOf('ET');
eval(data.toString('utf8',0,dataPos));
}