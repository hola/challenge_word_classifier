(function () {
    "use strict";

    module.exports = async;

    var GeneratorSample = (function*() {
        yield undefined;
    })().constructor;

    /**
     * If parameter "gen" is a generator, returns a "Promise" that will resolve (or reject) when generator finishes execution.
     * If parameter "gen" is a "Promise", returns passed promise.
     * Otherwise returns a "Promise" that is resolved with value of parameter "gen".
     *
     * If generator function yields a "Promise", yield operator will return (or throw) when a "Promise" will resolve (or reject).
     * If generator function yields a generator, yield operator will return (or throw) when generator will finish execution (or throw error).
     * If generator function yields other value, yield operator will return it immediately.
     * @param gen Generator or simple value
     * @returns Promise
     */
    function async(gen) {
        if (gen && gen.constructor == GeneratorSample) {
            return new Promise(function (resolve, reject) {
                nextStep(null);
                function nextStep(res, doThrow) {
                    var state;
                    try {
                        if (doThrow) {
                            state = gen.throw(res);
                        } else {
                            state = gen.next(res);
                        }
                    } catch (e) {
                        reject(e);
                        return;
                    }
                    if (!state.done) {
                        if (state.value instanceof Promise) {
                            state.value
                                .then(function (res) {
                                    nextStep(res);
                                })
                                .catch(function (err) {
                                    nextStep(err, true);
                                });
                        } else if (state.value && state.value.constructor == GeneratorSample) {
                            async(state.value)
                                .then(function (res) {
                                    nextStep(res);
                                })
                                .catch(function (err) {
                                    nextStep(err, true);
                                });
                        } else {
                            nextStep(state.value);
                        }
                    } else {
                        resolve(state.value);
                    }
                }
            });
        } else if (gen instanceof Promise) {
            return gen;
        } else {
            return Promise.resolve(gen);
        }
    }

})();