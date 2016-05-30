var iseng = require('../index.js');
var fakeData = " 100 101 ";
var fakeBuffer = {
  toString: function() { return fakeData; }
};

describe("Iseng", function() {
  describe("init", function() {
    it("reads buffer into patterns", function() {
      spyOn(fakeBuffer, "toString").and.callThrough();
      iseng.init(fakeBuffer);

      expect(fakeBuffer.toString).toHaveBeenCalled();
      expect(iseng.patterns).toEqual(fakeData)
    });
  });

  describe("test", function() {
    beforeEach(function() {
      iseng.init(fakeBuffer);
    });

    describe("when given non-matching word pattern", function() {
      it("returns false", function() {
        expect(iseng.test("xyz")).toBeFalsy();
        expect(iseng.test("ot")).toBeFalsy();
        expect(iseng.test("oi")).toBeFalsy();
      });
    });

    describe("when given matching word pattern", function() {
      it("returns true", function() {
        expect(iseng.test("bar")).toBeTruthy();
      });
    });

    it("calls toPattern function", function() {
      spyOn(iseng, "toPattern");
      var testWord = "foo";
      iseng.test(testWord);

      expect(iseng.toPattern).toHaveBeenCalledWith(testWord);
    });
  });

  describe("toPattern", function() {
    it("translates vowels and consonants to 0 and 1 respectively", function() {
      expect(iseng.toPattern("Foo")).toEqual("100");
      expect(iseng.toPattern("bar")).toEqual("101");
      expect(iseng.toPattern("ICU")).toEqual("010");
    });

    it("cleans up whitespaces", function() {
      expect(iseng.toPattern(" word ")).toEqual("1011");
    });

    it("leaves 'y' char untranslated", function() {
      expect(iseng.toPattern("cry")).toEqual("11y");
    });

    it("leaves possesive suffix untranslated", function() {
      expect(iseng.toPattern("dog's")).toEqual("101's");
      expect(iseng.toPattern("ra'salghul")).toEqual("10'1011101");
    })
  });
});

