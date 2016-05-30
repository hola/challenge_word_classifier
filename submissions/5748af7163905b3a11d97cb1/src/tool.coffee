tool =
  percent: (part, total) ->
    +((part/total)*100).toFixed 2

  setterAndGetter: (obj) ->
    get: (propName, getterFunction) ->
      Object.defineProperty obj,
        propName,
        get: getterFunction
        configurable: true
        enumerable: true
    set: (propName, setterFunction) ->
      Object.defineProperty obj,
        propName,
        set: setterFunction
        configurable: true
        enumerable: true


module.exports = tool