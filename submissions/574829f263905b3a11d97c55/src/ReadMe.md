# pj stands to short from of my name Pritam Jana (pj.js)
  A node.JS application for Hola! JS Challenge Spring 2016, that can answer whether a given word is English.
  This program in a single file and the size of pj.js 5 kiB and also not require any JS modules.

### Usage
attached the pj.js into your project
```````````javascript
var pj=require('./pj')

 pj.init(function(resultCallback){
     if(resultCallback.status!=100){
         console.log(resultCallback.message)
     }else{
        // write your code in here by using this method, you can also write this method outside of init callback
         pj.test("word",function(resultCallback){
             console.log(resultCallback)
         })
     }
 })
```````````
add this code into main JS file

### pj.js Methods
##### pj.init(function(resultCallback)
 init method used for **initialize** the program until initialize is completed you can't search word, when it will be
 initializing it given a response of percentage at console.
 `resultCallback` is called with an error and result. returns an instance of initialize which can be treated like a promise.
##### pj.test("word",function(resultCallback)
 test method used for **search** the word **after 100% initialize the program**. In this method one string type
 parameter passes `"word"`.
 `resultCallback` is called with an error and result. returns an instance of initialize which can be treated like a promise.
 It's take a word an return `true` if it classifies the `word` (string) as English, otherwise false. The function can
 be called repeatedly with different words.
### response status and message
status with an error - **101** or result - **100**
message with an error or result according response
````
{
	status: 101,
	message: 'Parameter missing !'
}
````
### license
**pj.js**
Pritam Jana
pjana.676@gmail.com