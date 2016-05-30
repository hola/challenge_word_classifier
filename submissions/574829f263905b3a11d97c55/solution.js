/**
 * Created by pritam on 5/22/16.
 */




var exec = require('child_process').exec;

var command = 'curl https://raw.githubusercontent.com/hola/challenge_word_classifier/master/words.txt?raw=true'

var englishDictionary=[]
var checkInitializing=false

exports.init=function(callback){
    var totalVolume=6906812
    var chunkSize=0
    child = exec(command,{maxBuffer: totalVolume}, function(error, stdout, stderr){
        if(error !== null){
            callback({status:101,message:error})
        }
    });
    process.stdout.write('Dictionary is initializing please wait .... 0%')
    child.stdout.on('data',
        function(chunk){
            chunkSize+=chunk.length
            try{
                process.stdout.clearLine();
                process.stdout.cursorTo(0);
                process.stdout.write('Dictionary is initializing please wait .... '+parseInt((chunkSize*100)/totalVolume)+'%')
            }catch (e){
                process.stdout.write('Dictionary is initializing please wait .... '+parseInt((chunkSize*100)/totalVolume)+'%\n')
            }

            englishDictionary=englishDictionary.concat(chunk.toLowerCase().split('\n'))
        }
    );
    child.stdout.on('end',
        function(){
            if(englishDictionary.length==0){

            }else{
                console.log('\nInitialize completed !')
                //console.log(englishDictionary.length)
                checkInitializing=true
                callback({status:100,message:'Done'})
            }
        }
    )
}
exports.test=function(word,callback){
    if(!checkInitializing){
        console.log('Have patience while initializing finished!!')
        callback({status:101,message:'Have patience while initializing finished!!'})
    }else{
        if(!word){
            callback({status:101,message:'Parameter missing !'})
        }else{
            if(englishDictionary.indexOf(word.toLowerCase())>-1){
                callback(true)
            }else{
                callback(false)
            }
        }
    }
}



