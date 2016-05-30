/**
 * Created by pritam on 5/22/16.
 */
var pj=require('./pj')

pj.init(function(resultCallback){
    if(resultCallback.status!=100){
        console.log(resultCallback.message)
    }else{
        pj.test("sonicative",function(resultCallback){
            console.log(resultCallback)
        })
    }
})

