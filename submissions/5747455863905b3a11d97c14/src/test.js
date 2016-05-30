'use strict';
//function load1() {
//    //var xhr = new XMLHttpRequest();
//    //alert("withCredentials" in xhr);


//    //alert(typeof XDomainRequest);

//    //var invocation = new XDomainRequest(); // new XMLHttpRequest();
//    //var url = 'https://hola.org/challenges/word_classifier/testcase/1234';

//    ////function callOtherDomain() {
//    //  //  if (invocation) {
//    //        invocation.open('GET', url, false);
//    //        //invocation.onreadystatechange = handler;
//    //        invocation.send();
//    //        alert(invocation.responseText);
//    //    //}
//    ////}


//    var ws = new skunk.webService("service1");
//    var r = ws.call("loadTestFile", { xx2: 22 });
//    alert(r);
//    var sr = r;
//    r = JSON.parse(r);
//    var nr = 0;
//    var nr15false=0;
//    var nr15true = 0;
//    var nrcons4ok = 0
//    var nrcons4ko = 0
//    var nrcons5ok = 0
//    var nrcons5ko = 0

//    var nrapok = 0
//    var nrapko = 0

    
//    for (var v in r) {
//        if (!r.hasOwnProperty(v)) continue;
//        nr++;
//        if (v.length > 15 && r[v]) nr15true++;
//        if (v.length > 15 && !r[v]) nr15false++;

//        var vp = v;
//        if (vp.substring( vp.length - 2) == "'s") vp = vp.substring(0, vp.length - 2);
//        if (vp.indexOf("'") >= 0 && r[v]) nrapok++;
//        if (vp.indexOf("'") >= 0 && !r[v]) nrapko++;

//    //    v="cavalry's"
//        for (var i = 0; i < v.length - 4+1; i++) {
//            var cuVocala = false;
//            for (var k = 0; k < 4; k++) {
//                var l = v.substr(i + k, 1);
//                if (l == 'a' || l == 'e' || l == 'i' || l == 'o' || l == 'u' || l == 'y' || l == "'")
//                    cuVocala = true;
//            }
//            if (!cuVocala) {
//                if(r[v]) alert(v+"    "+r[v]);
//                if (r[v])
//                    nrcons4ok++;
//                else
//                    nrcons4ko++;
//                break;
//            }
//        }

//        for (var i = 0; i < v.length - 5 + 1; i++) {
//            var cuVocala = false;
//            for (var k = 0; k < 5; k++) {
//                var l = v.substr(i + k, 1);
//                if (l == 'a' || l == 'e' || l == 'i' || l == 'o' || l == 'u' || l == 'y' || l == "'")
//                    cuVocala = true;
//            }
//            if (!cuVocala) {
//                if (r[v]) alert(v + "    " + r[v]);
//                if (r[v])
//                    nrcons5ok++;
//                else
//                    nrcons5ko++;
//                break;
//            }
//        }

//    }
//    alert("total="+nr+"  lg>14 corecte="+nr15true+"  lg>14 gresite="+nr15false+
//           "    cons4OK=" + nrcons4ok + "    cons4KO=" + nrcons4ko + "    cons5OK=" + nrcons5ok + "    cons5KO=" + nrcons5ko + "   apok=" + nrapok + "   apko=" + nrapko + "    \n" + sr);
//}


//function load1000() {

//    if(!confirm("Singur load in DB 1000 de apeluri?")) return;
//    for (var nn = 35; nn <= 1000; nn++) {
//        var ws = new skunk.webService("service1");
//        var r = ws.call("loadTestFile", { xx2: 22 });     
//        var sr = r;
//        r = JSON.parse(r);
//        var nr = 0;
//        var vect=[]
//        for (var v in r) {
//            if (!r.hasOwnProperty(v)) continue;
//            vect[nr] = { w: v, b: r[v] };
//            nr++;
//        }
//        var r=ws.call("saveTestFile", { n: nn, wl: vect })
//        if (r != "ok") {
//            alert(r);
//            return;
//        }
//    }
//}

var exports = {}
var htC = null;
function testalg() {

    //alert(crc32(document.getElementById("valtest").value).toString(16))

    if (!htC) {
        htC = buildHashTable();
        init(htC);

        //alert("LG init=" + buildHashTableVInit.length + "   fin=" + v.length)
        //for (i = 0; i < buildHashTableVInit.length; i++)
        //    if (buildHashTableVInit[i] != v[i]) alert("Diferite pe poz:" + i + "   v1=" + buildHashTableVInit[i] + "   v2=" + v[i])
    }
   
     //alert(test(document.getElementById("valtest").value))
   // var s = alert(document.getElementById("textareatest").value)
    var ll = document.getElementById("textareatest").value.split('\n');

    var ok = 0;
    /*
  SELECT   --*,
wt+','+cast(tip as varchar(1))+','+cast(n as varchar(10))
  FROM [w].[dbo].[wt]
 where n<=100 and tip in (0,1)
 
    */
    var tn = [];
    
    var cuvNr = 0, cuvGasite = 0;
    var nonCuv=0,nonCuvGas=0
    var sfalse = "";
    for (var i = 0; i < ll.length; i++) {
        var vc=ll[i].split(',');
        if (test(vc[0]) && vc[1] == "1" || !test(vc[0]) && vc[1] == "0") {
            ok++;
            if (!tn[vc[2]]) tn[vc[2]] = 0;
            tn[vc[2]]++;
        }   
        if (vc[1] == "1") cuvNr++;
        if (vc[1] == "1" && test(vc[0])) cuvGasite++;
        if (vc[1] == "0") nonCuv++;
        if (vc[1] == "0" && !test(vc[0])) nonCuvGas++;
        if (vc[1] == "0" && test(vc[0])) sfalse+=vc[0]+"\n"
    }

    var s = ""

    s += "Cuvinte gasite=" + cuvGasite + "   din=" + cuvNr + "   %=" + cuvGasite / cuvNr + "\n"
    s += "NON Cuv gasite=" + nonCuvGas + "   din=" + nonCuv + "   %=" + nonCuvGas / nonCuv + "\n"

    for (var i = 0; i < tn.length; i++)
        if (tn[i]) s += "test " + i + "  =  " + tn[i] + "\n"
    s+=sfalse
    document.getElementById("textareatest").value=s

    //var ss = "qwertyuiopasdfghjklzxcvbnm"
    //var sr=""
    //for (var i = 0; i < 26; i++)
    //    for (var j = 0; j < 26; j++)
    //        sr+= "insert into w2 values('"+ ss.substr(i,1)+ss.substr(j,1)+"');\n"
    //document.getElementById("textareatest").value = sr

    var mem=0
    for (var i = 0; i < v.length; i++)
        if (v[i] == 1) mem++;
    alert("nrok=" + ok + " din  " + ll.length + "  prc=" + ok / ll.length + "   prc ko=" + (  ll.length -ok) / ll.length + "\n\n mem=" + mem + " prc=" + mem / v.length);

   
}