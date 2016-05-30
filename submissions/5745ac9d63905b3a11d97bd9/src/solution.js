var size_dict = [];
var size_avg = [];

function parse(data) {
    var result = [],
      length = data.length / 2;
    for (var i = 0; i < length; i++) {
        result[i] = data.substr(i * 2, 2);
    }
    return result;
}

function parseAvg(data) {
    var result = [],
      length = data.length / 2;
    for (var i = 0; i < length; i++) {
        result[i] = data.substr(i * 2, 2);
    }
    return result;
}

function getParts(word) {
    var result = [],
      length = word.length,
      size = 2;

    for (var i = 0; i < length + 1 - size; i++) {
        result[i] = word.substring(i, i + size).toLowerCase();
    }
    return result;
}
function getNumber(word) {
    var result = 0;
    if ("a" == word) {
        result = 1;
    } else if ("b" == word) {
        result = 2;
    } else if ("c" == word) {
        result = 3;
    } else if ("d" == word) {
        result = 4;
    } else if ("e" == word) {
        result = 5;
    } else if ("f" == word) {
        result = 6;
    } else if ("g" == word) {
        result = 7;
    } else if ("h" == word) {
        result = 8;
    } else if ("i" == word) {
        result = 9;
    } else if ("j" == word) {
        result = 10;
    } else if ("k" == word) {
        result = 11;
    } else if ("l" == word) {
        result = 12;
    } else if ("m" == word) {
        result = 13;
    } else if ("n" == word) {
        result = 14;
    } else if ("o" == word) {
        result = 15;
    } else if ("p" == word) {
        result = 16;
    } else if ("q" == word) {
        result = 17;
    } else if ("r" == word) {
        result = 18;
    } else if ("s" == word) {
        result = 19;
    } else if ("t" == word) {
        result = 20;
    } else if ("u" == word) {
        result = 21;
    } else if ("v" == word) {
        result = 22;
    } else if ("w" == word) {
        result = 23;
    } else if ("x" == word) {
        result = 24;
    } else if ("y" == word) {
        result = 25;
    } else if ("z" == word) {
        result = 26;
    } else if ("'" == word) {
        result = 27;
    } else {
        result = getNumber(word.toLowerCase());
    }
    return result;
}

function calcAvg(word) {
    var hash = 0.0;

    word = word.toLowerCase();
    var len = 0;
    var length = word.length;
    for (var i = 0; i < length - 2; i++) {
        len = getNumber(word.substring(i, i + 1)) - getNumber(word.substring(i + 1, i + 2));
        hash += Math.abs(len);
    }
    hash = hash / length;
    return hash;
}

module.exports = {
    data : "",
    init: function(buffer) {
        size_dict[3] = parse("b'aaabacadaec'afagahaiajakalamanaoapaqarasatauavawaxayazbabbbcbdbed'bfbgbhbibjbkblbmbnbobpbqbrbsbtbubvbwbxbybzcacbcccdcee'cfcgchcicjckclcmcncocpcrcsctcucvcwcxcydadbdcdddef'dfdgdhdidjdkdldmdndodpdqdrdsdtdudvdwdxdydzeaebecedeeg'efegeheiekelemeneoepeqereseteuevewexeyezfafbfcfdfeh'fffgfhfifjfkflfmfnfofpfqfrfsftfufvfwfxfyfzgagbgcgdgei'gfggghgigjgkglgmgngogpgrgsgtgugvgwgxgygzhahbhchdhej'hfhghhhihjhkhlhmhnhohphqhrhshthuhvhwhxhyhziaibicidiek'if'digihiiijikiliminio'mipiqirisit'siuiv'tiwixiyizjajbjcjdjel'jfjgjhjijljmjnjojpjrjsjtjujwkakbkckdkem'kfkgkhkikjkkklkmknkokpkqkrksktkukvkwkylalblcldlen'lflglhlilklllmlnlolplrlsltlulvlwlxlymambmcmdmeo'mfmgmhmimjmkmlmmmnmompmrmsmtmumvmwmxmymznanbncndnep'nfngnhninknlnmnnnonpnqnrnsntnunvnwnxnyoaobocodoeq'ofogohoiojokolomonooopoqorosotouovowoxoyozpapbpcpdper'pfpgphpipjpkplpmpnpopppqprpsptpupvpwpxpyqaqbqcqdqes'qiqkqlqmqnqoqqqrqsqtquqvqwrarbrcrdret'rfrgrhrirjrkrlrmrnrorprqrrrsrtrurvrwrxryrzsasbscsdseu'sfsgshsisjskslsmsnsospsqsrssstsusvswsxsysztatbtctdtev'tftgthtitjtktltmtntotptqtrtstttutvtwtxtytzuaubucuduew'ufuguhuiujukulumunuoupuqurusutuuuvuwuxuyuzvavbvcvdvex'vfvgvhvivlvmvnvovpvrvsvtvuvwvxvywawbwcwdwey'wfwgwhwiwjwkwlwmwnwowpwrwswtwuwvwwwxwyxaxbxcxdxez'xfxixlxmxnxoxpxrxsxtxuxvxxxyyaybycydyeygyhyiylymynyoypyrysytyuyxyzzazbzezgzhzizozpzrzsztzuzyzza'");
        size_dict[4] = parse("b'aaabacadaec'afagahaiajakalamanaoapaqarasatauavawaxayazbabbbcbdbed'bfbgbhbibjbkblbmbnbobpbrbsbtbubvbwbxbybzcacbcccdcee'cfcgchcickclcmcncocpcqcrcsctcucvcwcxcyczdadbdcdddef'dfdgdhdidjdkdldmdndodpdqdrdsdtdudvdwdydzeaebecedeeg'efegeheiejekelemeneoepeqereseteuevewexeyezfafbfcfdfeh'fffgfhfiflfmfnfofpfqfrfsftfufvfwfxfygagbgcgdgei'gfggghgigjgkglgmgngogpgrgsgtgugwgyhahbhchdhej'hfhghhhihlhmhnhohphqhrhshthuhvhwhyhziaibic'aid'biek'if'dig'eihiiijikilimin'lioipiqirisit'r'siuiv'tiwix'viyizjajbjcjdl'jejfjgjhjijjjljmjnjojpjrjsjtjujvjykakbkckdm'kekfkgkhkikkklkmknkokpkrksktkukvkwkylalblcldn'lelflglhliljlklllmlnlolplqlrlsltlulvlwlxlylzmambmcmdmeo'mfmgmhmimkmlmmmnmompmrmsmtmumvmwmxmymznanbncndp'nenfngnhninjnknlnmnnnonpnrnsntnunvnwnxnynzoaobocodq'oeofogohoiojokolomonooopoqorosotouovowoxoyozpapbpcpdr'pepfpgphpipjpkplpmpnpopppqprpsptpupvpwpyqaqds'qeqfqhqkqlqnqoqpqqqrqsqtquqyrarbrcrdret'rfrgrhrirjrkrlrmrnrorprqrrrsrtrurvrwrxryrzsasbscsdseu'sfsgshsiskslsmsnsospsqsrssstsusvswsxsysztatbtctdtev'tftgthtitjtktltmtntotptrtstttutvtwtxtytzuaubucuduew'ufuguhuiujukulumunuoupuqurusutuuuvuwuxuyuzvavcvdvex'vfvgvhvivlvmvnvovpvrvsvtvuvvvywawbwcwdwey'wfwhwiwkwlwmwnwowpwrwswtwuwwwyxaxcxdz'xexfxixlxmxnxoxpxrxsxtxuxvxxxyyaybycydyeyfygyhyiykylymynyoypyrysytyuyvywyxyyyzzazbzdzezhzizlzmznzozrzuzwzyzza'");
        size_dict[5] = parse("b'aaabacadc'aeafagahaiajakalamanaoapaqarasatauavawaxayazbabbbcbdd'bebfbhbibjbkblbmbnbobpbrbsbtbubvbwbxbybzcacbcccdcee'cfcgchcicjckclcmcncocpcqcrcsctcucvcwcyczdadbdcdddef'dfdgdhdidjdkdldmdndodpdqdrdsdtdudvdwdxdydzeaebecedeeg'efegeheiejekelemeneoepeqereseteuevewexeyezfafbfcfdfeh'fffgfhfifjfkflfmfnfofpfrfsftfufvfwfygagbgcgdgei'gfggghgigjgkglgmgngogpgrgsgtgugwgygzhahbhchdhej'hfhghhhihkhlhmhnhohphqhrhshthuhvhwhyiaibic'aidiek'if'dig'eihiiij'hik'iilimin'lioip'niqirisit'r'siuiv'tiwix'viyiz'yjajbjdl'jejfjhjijjjkjljmjnjojrjsjtjujwjykakbkdm'kekfkgkhkikjkkklkmknkokpkrksktkukvkwkylalblcldlen'lflglhliljlklllmlnlolplqlrlsltlulvlwlxlylzmambmcmdmeo'mfmgmhmimjmkmlmmmnmompmrmsmtmumvmwmymznanbncndp'nenfngnhninjnknlnmnnnonpnqnrnsntnunvnwnxnynzoaobocodoeq'ofogohoiojokolomonooopoqorosotouovowoxoyozpapbpcpdr'pepfpgphpipjpkplpmpnpoppprpsptpupvpwpypzqaqbs'qeqfqgqiqkqlqnqoqrquqwrarbrcrdret'rfrgrhrirjrkrlrmrnrorprqrrrsrtrurvrwrxryrzsasbscsdseu'sfsgshsiskslsmsnsospsqsrssstsusvswsxsysztatbtctdv'tetftgthtitktltmtntotptqtrtstttutvtwtxtytzuaubucuduew'ufuguhuiujukulumunuoupuqurusutuuuvuwuxuyuzvavcvdvex'vfvgvhvivlvmvnvovpvrvsvtvuvvvwvywawbwcwdy'wewfwgwhwiwkwlwmwnwowpwrwswtwuwvwwwywzxaxbxcxdz'xexfxhxixlxmxoxpxrxsxtxuxvxwxxxyyaybycydyeyfygyiykylymynyoypyqyrysytyuyvywyxyyyzzazbzczdzezhzizkzlzmznzozpzrzsztzuzwzyzza'");
        size_dict[6] = parse("b'aaabacadaec'afagahaiajakalamanaoapaqarasatauavawaxayazbabbbcbdbed'bfbgbhbibjbkblbmbnbobpbqbrbsbtbubvbwbybzcacbcccde'cecfcgchcicjckclcmcncocpcqcrcsctcucwcyczdadbdcdddef'dfdgdhdidjdkdldmdndodpdrdsdtdudvdwdydzeaebecedeeg'efegeheiejekelemeneoepeqereseteuevewexeyezfafbfcfdh'fefffgfhfifjfkflfmfnfofpfrfsftfufwfxfygagbgcgdi'gegfggghgigjgkglgmgngogpgrgsgtgugvgwgygzhahbhchdhej'hfhghhhihjhkhlhmhnhohphrhshthuhvhwhyhziaib'aicid'biek'if'dig'eihii'gij'hik'iilimin'lio'mip'niq'oirisit'r'siuiv'tiwix'viyizjajcjdl'jejfjgjhjijjjkjljmjnjojpjrjsjujwjykakbkckdm'kekfkgkhkikjkkklkmknkokpkrksktkukvkwkxkylalblcldlen'lflglhliljlklllmlnlolplqlrlsltlulvlwlxlylzmambmcmdmeo'mfmgmhmimjmkmlmmmnmompmqmrmsmtmumvmwmymznanbncndp'nenfngnhninjnknlnmnnnonpnqnrnsntnunvnwnxnynzoaobocodoeq'ofogohoiojokolomonooopoqorosotouovowoxoyozpapbpcpdr'pepfpgphpipjpkplpmpnpopppqprpsptpupwpyqas'qeqiqlqoqqqrqsquqwrarbrcrdret'rfrgrhrirjrkrlrmrnrorprqrrrsrtrurvrwrxryrzsasbscsdu'sesfsgshsisjskslsmsnsospsqsrssstsusvswsysztatbtctdtev'tftgthtitjtktltmtntotptrtstttutvtwtytzuaubucuduew'ufuguhuiujukulumunuoupuqurusutuuuvuwuxuyuzvavcvdx'vevgvhvivkvlvmvnvovrvsvtvuvvvyvzwawbwcwdy'wewfwgwhwiwkwlwmwnwowpwrwswtwuwwwywzxaxbxcxdz'xexfxgxhxixlxmxnxoxpxrxsxtxuxvxwxxxyyaybycydyeyfygyhyiyjykylymynyoypyqyrysytyuyvywyxyyyzzazbzczdzezfzgzhzizjzkzlzmznzozpzrzsztzuzwzyzza'");
        size_dict[7] = parse("b'aaabacadaec'afagahaiajakalamanaoapaqarasatauavawaxayazbabbbcbdd'bebfbgbhbibjbkblbmbnbobpbrbsbtbubvbwbybzcacbcccde'cecfcgchcickclcmcncocpcqcrcsctcucvcwcyczdadbdcdddef'dfdgdhdidjdkdldmdndodpdrdsdtdudvdwdydzeaebecedeeg'efegeheiejekelemeneoepeqereseteuevewexeyezfafbfcfdh'fefffgfhfifjfkflfmfnfofpfrfsftfufwfyfzgagbgcgdi'gegfggghgigjgkglgmgngogpgrgsgtgugvgwgygzhahbhchdhej'hfhghhhihjhkhlhmhnhohphqhrhshthuhvhwhyhziaibic'aid'bk'ie'cif'dig'eih'fii'gijik'iilim'kin'lio'mip'niq'oirisit'r'siuiv'tiw'uix'viyizjajbjcjdl'jejhjijjjkjljnjojpjrjsjtjujvjwjykakbkckdm'kekfkgkhkikjkkklkmknkokpkrksktkukvkwkxkykzlalblcldn'lelflglhliljlklllmlnlolplqlrlsltlulvlwlxlylzmambmcmdo'memfmgmhmimjmkmlmmmnmompmqmrmsmtmumvmwmymznanbncndnep'nfngnhninjnknlnmnnnonpnqnrnsntnunvnwnxnynzoaobocodoeq'ofogohoiojokolomonooopoqorosotouovowoxoyozpapbpcpdper'pfpgphpipjpkplpmpnpoppprpsptpupvpwpypzqaqbs'qeqfqiqoqqqrqsquqwrarbrcrdt'rerfrgrhrirjrkrlrmrnrorprqrrrsrtrurvrwrxryrzsasbscsdseu'sfsgshsisjskslsmsnsospsqsrssstsusvswsysztatbtctdtev'tftgthtitjtktltmtntotptqtrtstttutvtwtytzuaubucudw'ueufuguhuiujukulumunuoupuqurusutuuuvuwuxuyuzvavcvdvex'vgvhvivkvlvnvovrvsvtvuvvvwvyvzwawbwcwdy'wewfwgwhwiwjwkwlwmwnwowpwqwrwswtwuwvwwwywzxaxbxcxdz'xexfxgxhxixlxmxnxoxpxqxrxsxtxuxwxxxyxzyaybycydyeyfygyhyiyjykylymynyoypyqyrysytyuyvywyxyyyzzazbzczdzezgzhzizjzkzlzmznzozpzqzrzsztzuzvzwzyzza'");
        size_dict[8] = parse("b'aaabacadaec'afagahaiajakalamanaoapaqarasatauavawaxayazbabbbcbdbed'bfbgbhbibjbkblbmbnbobpbqbrbsbtbubvbwbybzcacbcccde'cecfcgchcickclcmcncocpcqcrcsctcucwcxcyczdadbdcdddef'dfdgdhdidjdkdldmdndodpdqdrdsdtdudvdwdydzeaebecedg'eeefegeheiejekelemeneoepeqereseteuevewexeyezfafbfcfdh'fefffgfhfifjfkflfmfnfofpfrfsftfufwfyfzgagbgcgdi'gegfggghgigjgkglgmgngogpgrgsgtgugvgwgygzhahbhchdhej'hfhghhhihjhkhlhmhnhohphqhrhshthuhvhwhyhziaibic'aidiek''cif'dig'eih'fiiij'hik'iilim'kin'lio'mip'niq'oir'pisit'r'siuiv'tiw'uix'viy'wizjajbjcjdl'jejfjgjhjijjjkjljmjnjojpjrjsjtjujwjykakbkckdkem'kfkgkhkikjkkklkmknkokpkrksktkukvkwkxkykzlalblcldn'lelflglhliljlklllmlnlolplqlrlsltlulvlwlxlylzmambmcmdmeo'mfmgmhmimjmkmlmmmnmompmqmrmsmtmumvmwmymznanbncndnep'nfngnhninjnknlnmnnnonpnqnrnsntnunvnwnxnynzoaobocodq'oeofogohoiojokolomonooopoqorosotouovowoxoyozpapbpcpdr'pepfpgphpipjpkplpmpnpopppqprpsptpupvpwpypzqas'qiqoqqqsquqwrarbrcrdt'rerfrgrhrirjrkrlrmrnrorprqrrrsrtrurvrwrxryrzsasbscsdseu'sfsgshsisjskslsmsnsospsqsrssstsusvswsysztatbtctdtev'tftgthtitjtktltmtntotptqtrtstttutvtwtytzuaubucuduew'ufuguhuiujukulumunuoupuqurusutuuuvuwuxuyuzvavcvdvex'vgvhvivkvlvmvnvovpvrvsvtvuvvvyvzwawbwcwdy'wewfwgwhwiwjwkwlwmwnwowpwqwrwswtwuwvwwwywzxaxbxcxdz'xexfxgxhxixlxmxnxoxpxrxsxtxuxvxwxyyaybycydyeyfygyhyiyjykylymynyoypyqyrysytyuyvywyxyyyzzazbzczdzezfzgzhzizjzkzlzmznzozpzqzrzsztzuzvzwzyzza'");
        size_dict[9] = parse("b'aaabacadaec'afagahaiajakalamanaoapaqarasatauavawaxayazbabbbcbdd'bebfbgbhbibjbkblbmbnbobpbqbrbsbtbubvbwbybzcacbcccde'cecfcgchcickclcmcncocpcqcrcsctcucvcwcyczdadbdcdddef'dfdgdhdidjdkdldmdndodpdqdrdsdtdudvdwdydzeaebecedg'eeefegeheiejekelemeneoepeqereseteuevewexeyezfafbfcfdh'fefffgfhfifjfkflfmfnfofpfrfsftfufwfyfzgagbgcgdi'gegfggghgigjgkglgmgngogpgqgrgsgtgugvgwgygzhahbhchdhej'hfhghhhihjhkhlhmhnhohphqhrhshthuhvhwhyhziaibic'aid'biek''cif'dig'eih'fii'gij'hik'iilim'kin'lio'mip'niq'oir'pisit'siuiv'tiw'uix'viyizjajcjdl'jejijjjkjnjojpjrjsjtjujvjwjykakbkckdm'kekfkgkhkikjkkklkmknkokpkqkrksktkukvkwkykzlalblcldn'lelflglhliljlklllmlnlolplqlrlsltlulvlwlylzmambmcmdmeo'mfmgmhmimjmkmlmmmnmompmqmrmsmtmumvmwmymznanbncndnep'nfngnhninjnknlnmnnnonpnqnrnsntnunvnwnxnynzoaobocodoeq'ofogohoiojokolomonooopoqorosotouovowoxoyozpapbpcpdper'pfpgphpipjpkplpmpnpoppprpsptpupvpwpypzqaqbs'qiqqqrqurarbrcrdret'rfrgrhrirjrkrlrmrnrorprqrrrsrtrurvrwrxryrzsasbscsdu'sesfsgshsisjskslsmsnsospsqsrssstsusvswsysztatbtctdtev'tftgthtitjtktltmtntotptqtrtstttutvtwtytzuaubucuduew'ufuguhuiujukulumunuoupuqurusutuuuvuwuxuyuzvavcvdvex'vgvhvivkvlvmvnvovpvrvsvtvuvvvyvzwawbwcwdy'wewfwgwhwiwjwkwlwmwnwowpwrwswtwuwvwwwywzxaxbxcxdz'xexfxgxhxixkxlxmxnxoxpxqxrxsxtxuxvxwxyxzyaybycydyeyfygyhyiyjykylymynyoypyqyrysytyuyvywyxyyyzzazbzczdzezfzgzhzizkzlzmznzozpzqzrzsztzuzvzwzyzza'");
        size_dict[10] = parse("b'aaabacadaec'afagahaiajakalamanaoapaqarasatauavawaxayazbabbbcbdd'bebfbgbhbibjbkblbmbnbobpbqbrbsbtbubvbwbybzcacbcccde'cecfcgchcickclcmcncocpcqcrcsctcucwcyczdadbdcdddef'dfdgdhdidjdkdldmdndodpdqdrdsdtdudvdwdydzeaebecedeeg'efegeheiejekelemeneoepeqereseteuevewexeyezfafbfcfdh'fefffgfhfifjfkflfmfnfofpfqfrfsftfufwfyfzgagbgcgdi'gegfggghgigjgkglgmgngogpgqgrgsgtgugvgwgygzhahbhchdhehfhghhhihjhkhlhmhnhohphqhrhshthuhvhwhyhziaibic'aidiek''cif'dig'eih'fiiij'hikilim'kin'lio'mipiq'oir'pisit'r'siuiviw'uixiy'wiz'yjajcjdl'jejhjijkjljmjnjojpjrjsjujykakbkckdkem'kfkgkhkikjkkklkmknkokpkqkrksktkukvkwkykzlalblcldn'lelflglhliljlklllmlnlolplqlrlsltlulvlwlxlylzmambmcmdo'memfmgmhmimjmkmlmmmnmompmrmsmtmumvmwmymznanbncndnep'nfngnhninjnknlnmnnnonpnqnrnsntnunvnwnxnynzoaobocodoeofogohoiojokolomonooopoqorosotouovowoxoyozpapbpcpdr'pepfpgphpipjpkplpmpnpoppprpsptpupvpwpypzqas'qiqoqtqurarbrcrdt'rerfrgrhrirjrkrlrmrnrorprqrrrsrtrurvrwrxryrzsasbscsdseu'sfsgshsisjskslsmsnsospsqsrssstsusvswsysztatbtctdtev'tftgthtitjtktltmtntotptqtrtstttutvtwtytzuaubucuduew'ufuguhuiujukulumunuoupuqurusutuuuvuwuxuyuzvavcvdvex'vgvivkvlvmvnvovpvrvsvtvuvvvywawbwcwdy'wewfwgwhwiwjwkwlwmwnwowpwrwswtwuwvwwwywzxaxbxcxdz'xexfxgxhxixkxlxmxnxoxpxqxrxsxtxuxvxwxyxzyaybycydyeyfygyhyiyjykylymynyoypyqyrysytyuyvywyxyyyzzazbzczdzezfzgzhzizkzlzmznzozpzqzrzsztzuzvzwzyzza'");
        size_dict[11] = parse("b'aaabacadc'aeafagahaiajakalamanaoapaqarasatauavawaxayazbabbbcbdbed'bfbgbhbibjbkblbmbnbobpbqbrbsbtbubvbwbybzcacbcccde'cecfcgchcickclcmcncocpcqcrcsctcucvcwcyczdadbdcdddef'dfdgdhdidjdkdldmdndodpdqdrdsdtdudvdwdydzeaebecedeeg'efegeheiejekelemeneoepeqereseteuevewexeyezfafbfcfdh'fefffgfhfifjfkflfmfnfofpfrfsftfufvfwfygagbgcgdi'gegfggghgigjgkglgmgngogpgqgrgsgtgugvgwgygzhahbhchdhej'hfhghhhihjhkhlhmhnhohphqhrhshthuhvhwhyhziaibic'aidiek''cif'dig'eihiiij'hik'iilimin'lioipiq'oir'pisit'siuiviwixiyizjal'jejijjjkjnjojpjrjsjujvjykakbkckdkem'kfkgkhkikjkkklkmknkokpkqkrksktkukvkwkylalblcldlen'lflglhliljlklllmlnlolplqlrlsltlulvlwlxlylzmambmcmdmeo'mfmgmhmimjmkmlmmmnmompmqmrmsmtmumvmwmynanbncndnep'nfngnhninjnknlnmnnnonpnqnrnsntnunvnwnxnynzoaobocodoeofogohoiojokolomonooopoqorosotouovowoxoyozpapbpcpdr'pepfpgphpipjpkplpmpnpoppprpsptpupvpwpyqas'qgqiqurarbrcrdret'rfrgrhrirjrkrlrmrnrorprqrrrsrtrurvrwrxryrzsasbscsdseu'sfsgshsisjskslsmsnsospsqsrssstsusvswsysztatbtctdtev'tftgthtitjtktltmtntotptqtrtstttutvtwtxtytzuaubucuduew'ufuguhuiujukulumunuoupuqurusutuuuvuwuxuyuzvavcvex'vgvhvivkvlvnvovpvrvsvtvuvyvzwawbwcwdy'wewfwgwhwiwjwkwlwmwnwowpwrwswtwuwvwwwyxaxbxcxdz'xexfxgxhxixkxlxmxnxoxpxqxsxtxuxvxwxyyaybycydyeyfygyhyiyjykylymynyoypyqyrysytyuyvywyxyzzazbzczdzezfzgzhzizkzlzmznzozpzqzrzsztzuzvzwzyzza'");
        size_dict[12] = parse("b'aaabacadaec'afagahaiajakalamanaoapaqarasatauavawaxayazbabbbcbdbed'bfbgbhbibjbkblbmbnbobpbqbrbsbtbubvbwbybzcacbcccdcee'cfcgchcickclcmcncocpcqcrcsctcucwcyczdadbdcdddef'dfdgdhdidjdkdldmdndodpdqdrdsdtdudvdwdydzeaebecedg'eeefegeheiejekelemeneoepeqereseteuevewexeyezfafbfcfdh'fefffgfhfifkflfmfnfofqfrfsftfufvfygagbgcgdgei'gfggghgigjgkglgmgngogpgrgsgtgugvgwgygzhahbhchdhehfhghhhihjhkhlhmhnhohphqhrhshthuhvhwhyhziaibicidiek'if'digihiiijik'iiliminioipiqirisit'siuiv'uiwixiyizjajbjdl'jejijkjnjojrjsjukakbkckdm'kekfkgkhkikjkkklkmknkokpkqkrksktkukvkwkylalblcldlen'lflglhliljlklllmlnlolplqlrlsltlulvlwlxlylzmambmcmdmeo'mfmgmhmimjmkmlmmmnmompmqmrmsmtmumvmwmynanbncndnep'nfngnhninjnknlnmnnnonpnqnrnsntnunvnwnxnynzoaobocodoeq'ofogohoiojokolomonooopoqorosotouovowoxoyozpapbpcpdr'pepfpgphpipkplpmpnpoppprpsptpupvpwpys'qurarbrcrdret'rfrgrhrirjrkrlrmrnrorprqrrrsrtrurvrwrxryrzsasbscsdseu'sfsgshsisjskslsmsnsospsqsrssstsusvswsysztatbtctdtev'tftgthtitjtktltmtntotptqtrtstttutvtwtytzuaubucuduew'ufuguhuiujukulumunuoupuqurusutuuuvuwuxuyuzvavex'vgvivkvlvovrvsvtvuvywawbwcwdy'wewfwgwhwiwjwkwlwmwnwowpwrwswtwuwvwwwywzxaxbxcxdxez'xfxgxhxixkxlxmxnxoxpxsxtxuxvxyyaybycydyeyfygyhyiyjykylymynyoypyqyrysytyuyvywyxyzzazbzczdzezfzgzhzizkzlzmznzozpzrzsztzuzvzwzyzza'");
        size_dict[13] = parse("b'aaabacadaec'afagahaiajakalamanaoapaqarasatauavawaxayazbabbbcbdbed'bfbgbhbibjblbmbnbobpbqbrbsbtbubvbwbybzcacbcccde'cecfcgchcickclcmcncocpcqcrcsctcucvcyczdadbdcdddef'dfdgdhdidjdkdldmdndodpdqdrdsdtdudvdwdydzeaebecedeeg'efegeheiejekelemeneoepeqereseteuevewexeyezfafbfch'fefffgfhfifjfkflfmfnfofrfsftfufvfygagbgcgdi'gegfggghgigjgkglgmgngogpgrgsgtgugvgwgygzhahbhchdhej'hfhghhhihkhlhmhnhohphqhrhshthuhvhwhyiaibicidiek''cifigihiiijik'iiliminioipiq'oir'pisit'siuiviwixiyizjal'jejijkjnjojukakbkckdm'kekfkgkhkikjkkklkmknkokpkqkrksktkukvkwkylalblcldn'lelflglhlilklllmlnlolplqlrlsltlulvlwlylzmambmcmdmeo'mfmgmhmimjmlmmmnmompmrmsmtmumvmwmynanbncndnep'nfngnhninjnknlnmnnnonpnqnrnsntnunvnwnxnynzoaobocodoeofogohoiojokolomonooopoqorosotouovowoxoyozpapbpdr'pepfpgphpipkplpmpnpoppprpsptpupvpwpys'qurarbrcrdret'rfrgrhrirjrkrlrmrnrorprqrrrsrtrurvrwryrzsasbscsdseu'sfsgshsisjskslsmsnsospsqsrssstsusvswsysztatbtctdtev'tftgthtitjtktltmtntotptrtstttutvtwtytzuaubucuduew'ufuguhuiukulumunuoupuqurusutuuuvuwuxuyuzvavex'vivlvovrvsvtvuvvvywawbwcwdy'wewfwgwhwiwjwkwlwmwnwowpwrwswtwuwvwwwyxaxbxcxdz'xexfxgxhxixlxnxoxpxqxsxtxuxyyaybycydyeyfygyhyiyjykylymynyoypyrysytyuyvywyxyzzazbzczdzezhzizkzlzmzozpzsztzuzvzwzyzza'");
        size_dict[14] = parse("b'aaabacadaec'afagahaiajakalamanaoapaqarasatauavawaxayazbabbbcbdbed'bfbgbhbibjblbmbnbobpbrbsbtbubvbycacccdcee'cgchcickclcmcncocqcrcsctcucyczdadbdcdddef'dfdgdhdidjdkdldmdndodpdqdrdsdtdudvdwdydzeaebecedeeg'efegeheiejekelemeneoepeqereseteuevewexeyezfafbfeh'fffhfiflfnfofpfrfsftfufygagbgcgdgei'gfggghgigjgkglgmgngogpgrgsgtgugvgwgyhahbhchdhehfhghhhihkhlhmhnhohphqhrhshthuhvhwhyhziaibicidiek'ifigihiiijikiliminioipiqirisit'siuiviwixiyizjal'jejijojukakbkckdm'kekfkgkhkikjklkmknkokrksktkukvkwkylalblcldn'lelflglhlilklllmlnlolplqlrlsltlulvlwlxlylzmambmcmdmeo'mfmgmhmimkmlmmmnmompmrmsmtmumvmwmymznanbncndnep'nfngnhninjnknlnmnnnonpnqnrnsntnunvnwnxnynzoaobocodoeofogohoiojokolomonooopoqorosotouovowoxoyozpapbpcpdper'pfpgphpipkplpmpnpoppprpsptpupwpys'qurarbrcrdt'rerfrgrhrirjrkrlrmrnrorprqrrrsrtrurvrwryrzsasbscsdsesfsgshsisjskslsmsnsospsqsrssstsusvswsysztatbtctdtetftgthtitjtktltmtntotptrtstttutvtwtytzuaubucuduew'ufuguhuiujukulumunuoupuqurusutuuuvuwuxuzvax'vevgvivovrvsvuvvvywawbwcwdy'wewfwgwhwiwkwlwmwnwowpwrwswtwuwyxaxbxcxdxexfxhxixlxnxoxpxqxsxtxuxvxyyaybycydyeyfygyhyiyjylymynyoypyqyrysytyuyvywyxyzzazbzczdzezhzizkzlznzozsztzuzwzyzza'");
        size_dict[15] = parse("aaabacadaec'afagahaiajakalamanaoapaqarasatauavawaxayazbabbbcbdbed'bfbgbhbibjblbmbnbobpbqbrbsbtbubvbycacbcccde'cecgchcickclcncocqcrcsctcucvcyczdadbdcdddedfdgdhdidjdkdldmdndodpdqdrdsdtdudvdwdydzeaebecedeeg'efegeheiejekelemeneoepeqereseteuevewexeyezfafch'fefffhfiflfnfofpfrfsftfufygagcgdgei'ggghgiglgmgngogpgrgsgtgugyhahbhchdhehfhghhhihkhlhmhnhohphqhrhshthuhvhwhyiaibic'aidk'ie'cifigihiiijikiliminioipiqirisit'siuiviwixiyizjal'jejojukakbkem'kfkgkhkikjkkklkmknkokpkrksktkvkwkylalblcldn'lelflglhlilklllmlnlolplqlrlsltlulvlwlxlylzmambmcmdmeo'mfmgmhmimjmlmmmnmompmrmsmtmumvmwmynanbncndnep'nfngnhninjnknlnmnnnonpnqnrnsntnunvnwnxnynzoaobocodoeofogohoiojokolomonooopoqorosotouovowoxoyozpapbpdr'pepfpgphpipkplpmpnpoppprpsptpupys'qurarbrcrdret'rfrgrhrirjrkrlrmrnrorprqrrrsrtrurvrwryrzsasbscsdseu'sfsgshsisjskslsmsnsospsqsrssstsusvswsytatbtctdtetftgthtitjtltmtntotptrtstttutvtwtytzuaubucuduew'ufuguhuiukulumunuoupuqurusutuuuvuwuxuyuzvavcx'vevivovrvsvuvvvywawbwcwdwey'wfwhwiwlwnwowpwrwswtwuwwxaxbxcxdz'xexhxixoxpxqxsxtxuxyyaybycydyeyfygyhyiykylymynyoypyrysytyuyvywyxyzzazczdzezizlzozsztzuzyzza'");
        size_dict[16] = parse("aaabacadaec'afagahaiajakalamanaoapaqarasatauavawaxayazbabbbcbdd'bebfbgbhbibjblbmbnbobpbrbsbtbubvbycacccdcee'cgchcickclcncocpcqcrcsctcucyczdadbdcdddedfdgdhdidjdldmdndodpdrdsdtdudvdwdydzeaebecedg'eeefegeheiejekelemeneoepeqereseteuevewexeyezfafeh'fffiflfnfofpfrfsftfufwfygagbgcgdi'gegfggghgiglgmgngogrgsgtgugwgyhahbhchdhehfhghhhihkhlhmhnhohphqhrhshthuhwhyhziaibic'aidiek'ifigihiiikiliminioipiqirisit'siuivixiyizjal'jejojukakbm'kekfkhkiklkmknkokrksktkukvkwkylalblcldn'lelflglhlilklllmlnlolplrlsltlulvlxlymambmcmdmeo'mfmgmhmimlmmmnmompmrmsmtmumvmynanbncndnep'nfngnhninjnknlnmnnnonpnqnrnsntnunvnwnxnynzoaobocodoeofogohoiojokolomonooopoqorosotouovowoxoyozpapbper'pfpgphpipkplpmpnpoppprpsptpupys'qurarbrcrdret'rfrgrhrirjrkrlrmrnrorprqrrrsrtrurvrwryrzsasbscsdseu'sfsgshsisjskslsmsnsospsqsrssstsusvswsytatctdtev'tftgthtitjtltmtntotptrtstttutvtwtytzuaubucudueufuguhuiukulumunuoupuqurusutuuuvuxuyuzvavcx'vevivovsvuvywawdy'wewfwhwiwlwnwowrwswuxaxbxcxexhxixoxpxqxsxtxuxyyaybycydyeyfygyhyiylymynyoypyrysytyuyvywyxyzzazbzdzezhzizlzozsztzuzyzza'");
        size_dict[17] = parse("aaabacadaec'afagahaiajakalamanaoapaqarasatauavawaxayazbabbbcbdbed'bgbhbibjblbmbnbobpbrbsbtbubvbycacccdcee'chcickclcncocpcqcrcsctcucyczdadbdcdddedfdgdhdidjdldmdndodpdrdsdtdudvdwdyeaebecedg'eeefegeheiejekelemeneoepeqereseteuevewexeyezfafcfeh'fffhfiflfofrftfugai'geggghgiglgmgngogrgsgtgugyhahbhchehfhghihlhmhnhohqhrhshthuhwhyhziaibicidieifigihiiikiliminioipiqirisit'siuivixizjal'jejojukam'kekfkhkiklknkokrkskwkylalblcldlen'lflglhlilklllmlnlolplrlsltlulvlymambmcmdmemfmhmimlmmmnmompmsmtmumvmynanbncndnep'nfngnhninjnknlnmnnnonpnqnrnsntnunvnwnynzoaobocodoeofogohoiojokolomonooopoqorosotouovowoxoyozpaper'phpiplpmpnpoppprpsptpupys'qurarbrcrdret'rfrgrhrirjrkrlrmrnrorprqrrrsrtrurvrwryrzsasbscsdsesfsgshsiskslsmsnsospsqsrssstsusvswsytatbtctdtetftgthtitjtltmtntotptrtstttutwtytzuaubucudueufuguiukulumunuoupurusutuvuxuzvavevivovrvsvuvywawdy'wewfwhwiwlwnwowrwswtwuxaxcz'xexhxixoxpxtxuxyyaybycydyeygyhyiylymynyoypyrysytyuyvywyxyzzazezizmzozyzza'");
        size_dict[18] = parse("aaabacadaec'afagahaiakalamanapaqarasatauavaxayazbabbbcbdbed'bhbibjblbmbobrbsbtbubycacccee'chcickclcncocqcrcsctcucydadbdcdddedfdgdidldmdndodrdsdtdudvdyeaebecedg'eeefegeheiejekelemeneoepeqereseteuevewexezfah'fefffiflfnfofrftfufygagei'ggghgiglgmgngogrgsgugyhahchehihlhmhnhohrhshthuhyhziaibicidieifigihiiikiliminioipiqirisit'siuivixizjel'jukakcm'kekgkiklkmknkoksktkylalcldlen'lflglhlilklllmlnlolplsltlulvlymambmemfmimlmmmnmompmsmumvmynanbncndnep'nfngnhninjnknlnmnnnonpnqnrnsntnunvnynzoaobocodoeofogohoiojokolomonooopoqorosotouovowoxoyozpaper'phpiplpmpnpoppprpsptpupys'qurarbrcrdret'rfrgrhrirjrkrlrmrnrorprqrrrsrtrurvrwryrzsasbscsdsesfsgshsiskslsmsnsospsqsrssstsusvswsytatctetftgthtitltmtntotptrtstttutvtwtytzuaubucudueufuguiulumunuoupurusutuvuxuzvavcx'vevivovuvyway'wewhwiwlwoxaxcxexhxixoxpxqxtxuxyyaybycydyeygyhyiylymynyoypyrysytywyxzazbzezizlzozyzza'");
        size_dict[19] = parse("aaabacadaec'afagahaiakalamanaoaparasatauavaxazbabcbdd'bebibjblbmbnbobrbsbubvbwbycacce'cechcickclcocpcqcrcsctcucydadcdddedgdidldmdndodrdudvdyeaebecedg'eeefegeheiejekelemeneoepeqereseteuevewexfafcfeh'fffiflfofrftfugagdgeggghgiglgmgngogrgsgugyhahbhchehghihlhmhnhohphrhshthuhwhyiaibicidieifigihiiikiliminioipiqirisit'siuivizl'jejojukam'kekhkiknkolalblcldlen'lflglhlilllmlnlolplrlsltlulvlymambmemfmhmimmmnmompmsmumynanbncndnep'nfngnhninjnknlnmnnnonpnqnrnsntnunvnynzoaobocodoeofogohoiojokolomonoooporosotouovowoxoypaper'phpiplpnpoppprpsptpupys'qurarbrcrdret'rfrgrhrirjrkrlrmrnrorprrrsrtrurvrwrysasbscsdsesfsgshsiskslsmsnsospsqsrssstsuswsytatetftgthtitltmtntotrtstttutwtyuaubucudueuguiulumunuoupurusutuvvavevivowawey'wiwlwowuxaxcxexhxixpxtxyyaybycydyeygyhylymynyoypyrysytzazezizozya'");
        size_dict[20] = parse("ppprpsptpupwpys'abacadaequafagahaiakalamanraaprbaqarrcasrdt'reataurfrgavrhriayrkazrlrmrnrorpbarrrsbdrtrubervrybibjblbmbosascbrbssdsebusfshsibyslsmsnsospcasrccssstcee'suchsycickclcncotacrcstectcutftgthticytltmtntodadbtrtsddttdetudgditydmdndouaubdrucudueduugdvuidyukulumunuoupeaurebusecutedg'efuvegeheiejelemeneoepvaeqeresetveeuevexviezvofafeh'fffiflfofrfty'fuwlgagei'ggghgiwyglgmgngoxagrgsxegugwxigyxoxphaxthehixyhlhmhnhoyaybychrydhshtyehuygyhhyylymynyoypiaibyricysidytieifyvigihiiiliminioipzaiqirisitze'siuivziizzojejukcm'kekgkikmknkoktlalcldn'lelflglilllmlnlolplqlsltlulvlymambmemimmmompmsmumynancndnenfngnhninjnknlnmnnnonpnqnrnsntnunvnynzoaobocodoeofogohoiojokolomonooopoqorosotoua'ovowoxpaper'phpiplpnpo");
        size_dict[21] = parse("ppprpsptpupys'aaabacadaequc'afagahaialamanraaprbarrcasrdatret'aurfrgrhrirkazrmrnrorpbarrrsrtberud'rvrwrybiblbosasbbrscbssebusfshbwsislsmsnsospcassccste'cesuchsycickclcotacrcscttecutftgthticytmtntodatrtstttudeditydmdndouaubdrucuddsuedudvuguhuidyukulumunuoupeaurebusecutedg'uvegeheiejelemeneovaepeqeresetveeuevexvivofafcfeh'fffiflfowafry'wefugageggghgiglgmgngoxagrxcxegugyxphaxthehixyhlhmhoyahrycydhtyehuyghyylymynyoypiaibyricysidytieifigihiiiliminioipzairisitze'sivziizzol'jezyjukam'kikmkokukylalblcldlen'lflhlilklllmlnlolplsltlulymambmemimmmnmompmsmumynancndnengninmnnnonpnrnsntnunvnynzoaobocodoeofogohoiojokolomonoporosota'ouovoxpaper'phpiplpo");
        size_dict[22] = parse("prpsptpwpys'abacadaequahaialamanraapaqrbarrcasrdatret'aurfrhriazrmrnrorpbarrbbrtbed'rybiblbosascbssebushsismsnsospcassccstcee'suchsycickclcotacrtectcuthticytmtodatrtsdetuditydoubdrucudduuidyukulumunuoeaurecuseduteheielemeneoeperesetveeuevviexvofafiflfoy'wefuwlgagegiwyglgoxagrxcgugwgyhaxthehixyhlhmhoychrydhshtyehuyghyylymynyoypiaibyricysidieifiliminioipzairisitze'siuivziizzol'jum'kekmkokylalblcldn'lelflglhlilklllmlolplsltlulymamemimmmnmompmsmumynancndnenfngnhninjnnnonpnrnsntnunynzoaobocodoeogohoiolomonoooporosota'ouovowoxpapephpipnpo");
        size_dict[23] = parse("prpss'abacafagalamanraaprbarrcasrdatret'rhrirmrorprrrsrtbebiryblbosabrscbssebushsismsospcassstsue'cechcisyclcotacrtectthtitotrtudeditydouadpubucdrudduuidyulunuoeaurecutedefeheielemeneoeperesetveeuexvifeh'fiflfoy'gagegiglgmgngoxagrgugyhahdhehixyhlhmhohrycydhthyylymynypiaibyricysidytieifihiliminiozaipiszeit'sivizm'kylalblcldn'lelflilklllolplslulymamemimmmomsmumynancndnenfngninonrnsntnunynzoaobocodoeofogohoiolomonoporosota'ouovoxpapephpipo");
        size_dict[24] = parse("hixyprpshlhmhoycydhthyylymiaibyricidytieifabacilimaeinafioagipzaaiisalitze'samanraaprbarizrcrdatrezorhriazrml'rnrorprsrubiryblbosascbssebtshsismm'sospcassccstcee'suchcisycotacrcttethtilalcldn'letolitrtslldetulolpdityludoualyubdrudmadyulmeunuomieaurecusutmmmoehmpeielmueneoepmyeresetveeunaexncnengninofinrnsntflfonyy'obocodoeofogoiolomonopgiorosglota'gnovoxxagpgrpaper'phpihahepo");
        size_dict[25] = parse("hiprpshlhmhoychyylypiaibyricidytieifabaciliminafioipzaisalam'sanraaparizatret'rirortberyblbrseshsismsospcassste'cesuchsyclcotacrtectthlaticylclen'tolitrlldetulodiludoualyuddymeunuoupmiurecmmegmpeheimselemmueneperesetveeuncneninonsntflobodoeogoiolomgeonopgiorosota'ovgrr'pephhahepo");
        size_dict[26] = parse("dihmhoyldyiameibidiemiabinmsipenisal'samanesetaratrinenirnronontblboscshsmspolonopste'orosa'cotathtilaldphhaleli");
        size_dict[27] = parse("llhituxydelodihoycydlydrudhyyliameibicmiifecusedaaabacilinelenepalitameresraapetatncnerinironortfibibuoeogsospcaomonstopceorosotoxgrcotacrcttethtipephlehatolitr");
        size_dict[28] = parse("xydedihmyddrhyylmeiaicidmiedaaabacehinenisamaneresetraaratrinenirortntblseocshsmonstceorosoxcotatethtilelitr");
        size_dict[29] = parse("hixylmlnlodihmycuchyylymmeiaicidmiifedihaaabacilmpiminmsioipenisitam'sanesetraaratnaaurinenirofintflblnyseocshsmcaonccstopcee'otcicloxtatethticyphlepihalihetr");
        size_dict[30] = parse("pphilofinsflucseocuiiaicifcaomsqihonedccopstmoilosquinotciioipalanesnaatautipepinitolirodatrpo");
        size_dict[31] = parse("xylohldiltnyhyylymodoemeicmiede'ormpchinioipenoxam'santaetthrinephhalerohetr");
        size_dict[32] = parse("loorhldichipltennyanesetylthodoerinephhaicrohetr");
        size_dict[33] = parse("lohldiltnyylodoeice'orchipen'sanetthrinephharohetr");
        size_dict[34] = parse("prdiltpydohyyliameicupidmiifusedilinagioenisalameretrarcexneronofroccaopstsugicecioutethpetixplepilitr");
        size_dict[45] = parse("noltscseocsiulumicmiolcaonopmoilosouioovisamcoanesracreucsnelcpivonirolipntr");
        size_dict[58] = parse("lltyntpwryycdrhwylobocwlynbwsiogyrysgewyilchioaigoiranergwgylandnfngfalgrnrolirp");
        size_dict[60] = parse("lltyntpwryycdrhwylobocwlynbwsiogyrysgewyilchioaigoir'sanergwgylandnfngfalgrnrolirph'");

        size_avg[3] = [{'a' : 0, 'f' : 0.189380530973451},{'a' : 1, 'f' : 0.203097345132743},{'a' : 2, 'f' : 0.162610619469026},{'a' : 3, 'f' : 0.146238938053097},{'a' : 4, 'f' : 0.11858407079646},{'a' : 5, 'f' : 0.0898230088495575},{'a' : 6, 'f' : 0.0579646017699115},{'a' : 7, 'f' : 0.0238938053097345},{'a' : 8, 'f' : 0.00840707964601769}];
        size_avg[4] = [{'a' : 0, 'f' : 0.0300087489063867},{'a' : 1, 'f' : 0.102449693788276},{'a' : 2, 'f' : 0.141119860017497},{'a' : 3, 'f' : 0.18503937007874},{'a' : 4, 'f' : 0.182239720034995},{'a' : 5, 'f' : 0.124846894138232},{'a' : 6, 'f' : 0.0936132983377077},{'a' : 7, 'f' : 0.0609798775153105},{'a' : 8, 'f' : 0.0398075240594925},{'a' : 9, 'f' : 0.0232720909886264},{'a' : 10, 'f' : 0.0117235345581802},{'a' : 11, 'f' : 0.00393700787401574},{'a' : 12, 'f' : 0.000962379702537182}];
        size_avg[5] = [{'a' : 0, 'f' : 0.00718035824583076},{'a' : 1, 'f' : 0.0449351451513279},{'a' : 2, 'f' : 0.0983631871525633},{'a' : 3, 'f' : 0.162175725756639},{'a' : 4, 'f' : 0.176266213712168},{'a' : 5, 'f' : 0.156230697961704},{'a' : 6, 'f' : 0.131292464484249},{'a' : 7, 'f' : 0.100872452130945},{'a' : 8, 'f' : 0.0581377393452748},{'a' : 9, 'f' : 0.0328906732550957},{'a' : 10, 'f' : 0.0171016059295861},{'a' : 11, 'f' : 0.00941939468807906},{'a' : 12, 'f' : 0.00374459542927733},{'a' : 13, 'f' : 0.00108091414453366},{'a' : 14, 'f' : 0.000308832612723903}];
        size_avg[6] = [{'a' : 0, 'f' : 0.0010316297687086},{'a' : 1, 'f' : 0.0165060762993376},{'a' : 2, 'f' : 0.0650133080240163},{'a' : 3, 'f' : 0.128953721088575},{'a' : 4, 'f' : 0.173148740380052},{'a' : 5, 'f' : 0.181381145934347},{'a' : 6, 'f' : 0.160294633461943},{'a' : 7, 'f' : 0.11675985722244},{'a' : 8, 'f' : 0.0742979759423937},{'a' : 9, 'f' : 0.043163389522768},{'a' : 10, 'f' : 0.0241195039924072},{'a' : 11, 'f' : 0.00934656570449997},{'a' : 12, 'f' : 0.00394082571646687},{'a' : 13, 'f' : 0.00156807724843708},{'a' : 14, 'f' : 0.000309488930612581},{'a' : 15, 'f' : 0.000123795572245032},{'a' : 16, 'f' : 0.000004126519074834}];
        size_avg[17] = [{'a' : 3, 'f' : 0.00218023255813953},{'a' : 4, 'f' : 0.0376090116279069},{'a' : 5, 'f' : 0.142623546511627},{'a' : 6, 'f' : 0.262899709302325},{'a' : 7, 'f' : 0.280886627906976},{'a' : 8, 'f' : 0.184047965116279},{'a' : 9, 'f' : 0.0657703488372093},{'a' : 10, 'f' : 0.0192587209302325},{'a' : 11, 'f' : 0.00417877906976744},{'a' : 12, 'f' : 0.000363372093023255},{'a' : 13, 'f' : 0.000181686046511627}];
        size_avg[18] = [{'a' : 3, 'f' : 0.00236966824644549},{'a' : 4, 'f' : 0.0297901150981719},{'a' : 5, 'f' : 0.131008801624915},{'a' : 6, 'f' : 0.273865944482058},{'a' : 7, 'f' : 0.279282329045362},{'a' : 8, 'f' : 0.18855788761002},{'a' : 9, 'f' : 0.0710900473933649},{'a' : 10, 'f' : 0.0213270142180094},{'a' : 11, 'f' : 0.00236966824644549},{'a' : 12, 'f' : 0.000338524035206499}];
        size_avg[19] = [{'a' : 3, 'f' : 0.00064143681847338},{'a' : 4, 'f' : 0.0243745991019884},{'a' : 5, 'f' : 0.121231558691468},{'a' : 6, 'f' : 0.258499037844772},{'a' : 7, 'f' : 0.295060936497754},{'a' : 8, 'f' : 0.196279666452854},{'a' : 9, 'f' : 0.0795381654906991},{'a' : 10, 'f' : 0.0211674150096215},{'a' : 11, 'f' : 0.00256574727389352},{'a' : 12, 'f' : 0.00064143681847338}];
        size_avg[20] = [{'a' : 3, 'f' : 0.00141043723554301},{'a' : 4, 'f' : 0.0112834978843441},{'a' : 5, 'f' : 0.115655853314527},{'a' : 6, 'f' : 0.270803949224259},{'a' : 7, 'f' : 0.303244005641748},{'a' : 8, 'f' : 0.203102961918194},{'a' : 9, 'f' : 0.0691114245416079},{'a' : 10, 'f' : 0.0253878702397743}];
        size_avg[21] = [{'a' : 4, 'f' : 0.0172413793103448},{'a' : 5, 'f' : 0.0862068965517241},{'a' : 6, 'f' : 0.278735632183908},{'a' : 7, 'f' : 0.316091954022988},{'a' : 8, 'f' : 0.209770114942528},{'a' : 9, 'f' : 0.0689655172413793},{'a' : 10, 'f' : 0.0201149425287356},{'a' : 11, 'f' : 0.0028735632183908}];
        size_avg[22] = [{'a' : 4, 'f' : 0.0596026490066225},{'a' : 5, 'f' : 0.086092715231788},{'a' : 6, 'f' : 0.264900662251655},{'a' : 7, 'f' : 0.245033112582781},{'a' : 8, 'f' : 0.23841059602649},{'a' : 9, 'f' : 0.0794701986754966},{'a' : 10, 'f' : 0.0132450331125827},{'a' : 11, 'f' : 0.0132450331125827}];
        size_avg[23] = [{'a' : 4, 'f' : 0.0298507462686567},{'a' : 5, 'f' : 0.164179104477611},{'a' : 6, 'f' : 0.164179104477611},{'a' : 7, 'f' : 0.26865671641791},{'a' : 8, 'f' : 0.223880597014925},{'a' : 9, 'f' : 0.134328358208955},{'a' : 10, 'f' : 0.0149253731343283}];
        size_avg[24] = [{'a' : 4, 'f' : 0.0526315789473684},{'a' : 5, 'f' : 0.157894736842105},{'a' : 6, 'f' : 0.184210526315789},{'a' : 7, 'f' : 0.31578947368421},{'a' : 8, 'f' : 0.210526315789473},{'a' : 9, 'f' : 0.0263157894736842},{'a' : 10, 'f' : 0.0263157894736842},{'a' : 11, 'f' : 0.0263157894736842}];
        size_avg[25] = [{'a' : 4, 'f' : 0.0555555555555555},{'a' : 5, 'f' : 0.166666666666666},{'a' : 6, 'f' : 0.111111111111111},{'a' : 7, 'f' : 0.166666666666666},{'a' : 8, 'f' : 0.388888888888888},{'a' : 9, 'f' : 0.111111111111111}];
        size_avg[26] = [{'a' : 7, 'f' : 0.333333333333333},{'a' : 8, 'f' : 0.666666666666666}];
        size_avg[27] = [{'a' : 5, 'f' : 0.2},{'a' : 6, 'f' : 0.2},{'a' : 7, 'f' : 0.2},{'a' : 8, 'f' : 0.2},{'a' : 9, 'f' : 0.2}];
        size_avg[28] = [{'a' : 8, 'f' : 0.666666666666666},{'a' : 9, 'f' : 0.333333333333333}];
        size_avg[29] = [{'a' : 6, 'f' : 0.166666666666666},{'a' : 7, 'f' : 0.166666666666666},{'a' : 8, 'f' : 0.5},{'a' : 9, 'f' : 0.166666666666666}];
        size_avg[30] = [{'a' : 4, 'f' : 0.5},{'a' : 5, 'f' : 0.5}];
        size_avg[31] = [{'a' : 6, 'f' : 0.5},{'a' : 8, 'f' : 0.5}];
        size_avg[32] = [{'a' : 6, 'f' : 1}];
        size_avg[33] = [{'a' : 6, 'f' : 1}];
        size_avg[34] = [{'a' : 7, 'f' : 1}];
        size_avg[45] = [{'a' : 6, 'f' : 1}];
        size_avg[58] = [{'a' : 7, 'f' : 1}];
        size_avg[60] = [{'a' : 7, 'f' : 1}];
    },
    testDict: function(word) {
        var length = word.length;
        var dict = size_dict[length];
        if (dict === undefined) {
            return true;
        }
        if (length < 3) {
            return true;
        }

        var parts = getParts(word);
        length = parts.length;

        var found = true;
        for (var i = 0; found && i < length; i++) {
            found = false;
            for (var j = 0; j < dict.length; j++) {
                if (parts[i] == dict[j]) {
                    found = true;
                }
            }
        }
        return found;
    },
    testAvg: function(word) {
        var result = true,
          length = word.length,
          avg = size_avg[length];
        if (avg === undefined) {
            return true;
        }
        var avgTmp = calcAvg(word)

        for (var i = 0; i < avg.size; i++) {
            if (avg[i].a != avgTmp) {
                continue;
            }
            return Math.random() < avg[i].f;
        }
        return result;
    },
    test: function(word) {
        var length = word.length;

        if (length > 3 && length < 9) {
            return this.testAvg(word);
        } else {
            return this.testDict(word);
        }
    }
};