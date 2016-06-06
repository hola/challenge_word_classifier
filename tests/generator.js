// LICENSE_CODE ZON
'use strict'; /*jslint node:true*/
const random_js = require('random-js');
const _ = require('underscore');
const CHARS = 28, TC_SIZE = 100, MAX_DEPTH = 8;

module.exports = {
    init,
    generate,
    sequence,
    TC_SIZE,
    MAX_DEPTH,
};

let models, dictionary;

function c2i(c)
{
    if (!c)
        return 0;
    if (c=="'")
        return 27;
    return c.charCodeAt(0)-96;
}

function i2c(i)
{
    if (!i)
        return '';
    if (i==27)
        return "'";
    return String.fromCharCode(i+96);
}

class MarkovModel {
    constructor(order, prev){
        this.order = order;
        this.data = new Map();
        this.prev = prev;
    }
    learn(word){
        for (let i = 0; i<=word.length; i++)
        {
            let state = word.slice(Math.max(i-this.order, 0), i);
            let item = this.data.get(state);
            if (!item)
            {
                item = new Uint32Array(CHARS+1);
                this.data.set(state, item);
            }
            item[0]++;
            item[c2i(word[i])+1]++;
        }
    }
    produce(random, prefix){
        let item = this.data.get(prefix.slice(-this.order));
        if (!item)
            return this.prev(prefix);
        let n = random.integer(0, item[0]-1);
        for (let i = 1; i<=CHARS; i++)
        {
            n -= item[i];
            if (n<0)
                return i2c(i-1);
        }
    }
    generate(random){
        let res = '';
        while (true)
        {
            let c = this.produce(random, res);
            if (!c)
                return res;
            res += c;
        }
    }
}

class LengthModel {
    learn(){}
    produce(random, prefix){ return i2c(random.integer(0, CHARS-1)); }
    generate(random){
        let res = '', limit = random.integer(10, 30);
        for (let i = 0; i<limit; i++)
        {
            let c = this.produce(random, res);
            if (!c && res)
                return res;
            res += c;
        }
        return res;
    }
}

function init(words){
    models = [new LengthModel()];
    for (let i = 1; i<=MAX_DEPTH; i++)
        models.push(new MarkovModel(i, models[i-1]));
    dictionary = words.map(w=>w.toLowerCase()).sort();
    for (let word of dictionary)
    {
        for (let model of models)
            model.learn(word);
    }
}

function generate(seed)
{
    let random = new random_js(random_js.engines.mt19937().seed(seed));
    let res = {};
    for (let i = 0; i<TC_SIZE; i++)
    {
        let word, real = random.bool(), model;
        if (real)
            word = random.pick(dictionary);
        else
        {
            do {
                model = random.integer(0, models.length-1);
                word = models[model].generate(random);
            } while (_.indexOf(dictionary, word, true)>=0);
        }
        if (word in res)
            i--;
        else
            res[word] = {real, model};
    }
    return res;
}

function*sequence(seed_text)
{
    let arr = [];
    for (let i = 0; i<seed_text.length; i++)
        arr.push(seed_text.charCodeAt(i));
    let random = new random_js(random_js.engines.mt19937().seedWithArray(arr));
    while (true)
        yield random.integer(0, 0x7fffffff);
}
