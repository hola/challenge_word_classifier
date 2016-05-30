'use strict';
const PORT = process.env.PORT;

const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");
const zlib = require('zlib');

const classifier = require("./word_classifier");



// Read main file.
let filepath = __dirname + '/all_words.txt';
let writeFile = __dirname + '/test.txt';
let statFile =  __dirname + '/stat1.txt';
let hashFile =  __dirname + '/hash.txt';
let initFile = __dirname + '/init.zip';
let resultFile = __dirname + '/resultTest.txt';

let falseFail = __dirname + '/false.txt';

let testStr = 'Bergoniane';

let letterLen = {};

// console.log(md5(testStr));

function readFile() {
	fileAccess(initFile)
    .then(fileReaderBuffer)
    .then(content => {
    
		zlib.unzip(content, (err, buffer) => {
		  if (!err) {
		    classifier.init(buffer);
		  } else {
		    // handle error
		  }
		});
    		
    })
    .catch(error => {
        console.log('ERROR');
        console.log(JSON.stringify(error));
    });
}

function prepare () {
	fileAccess(filepath)
    .then(fileReader)
    .then(content => {
        // console.log(content);
        // Check file/ remove affix.
        let arr = content.split('\n');
        let newStr = '';
        let hashSet = new Set();
        
        for (let i = 0; i < arr.length; i++) {

        	let cleanedWord = arr[i].toLowerCase();
        	
        	// if (letterLen[cleanedWord.slice(0, 1)]) {
	        // 	if (letterLen[cleanedWord.slice(0, 1)] <cleanedWord.length) {
	        // 		letterLen[cleanedWord.slice(0, 1)] = cleanedWord.length;
	        // 	}
        	// } else {
	        // 	letterLen[arr[i].slice(0, 1)] = cleanedWord.length;
        	// }
        	
        	cleanedWord = removeAff(arr[i - 1], cleanedWord, arr[i + 1]);
        	cleanedWord = removeAff(arr[i - 1], cleanedWord, arr[i + 1]);
        	cleanedWord = removeAff(arr[i - 1], cleanedWord, arr[i + 1]);
        	cleanedWord = removeAff(arr[i - 1], cleanedWord, arr[i + 1]);
        	
        	let oldWord = cleanedWord;
        	
			if (cleanedWord.length >= 4) {
				cleanedWord = removeWord(cleanedWord);
			}
			
			if (cleanedWord.length >= 4) {
				cleanedWord = removeWord(cleanedWord);
			}
			
			
			if (cleanedWord.length >= 3) {
				cleanedWord = removeWord2(cleanedWord);
			}
			
			if (cleanedWord.length >= 3) {
				cleanedWord = removeWord2(cleanedWord);
			}
        	
        	if (cleanedWord.length > 0) {
        		if (cleanedWord.length > 4) {
        			cleanedWord = cleanedWord.slice(-4);
        		}
        		
        		hashSet.add(cleanedWord);
        	}
        	
        }
        
        // console.log(letterLen);
        
        hashSet.forEach( str => newStr += str + '\n' ); 
        fileWriter(writeFile, newStr);
        
        // let newSet = new Set();
        // let hashStr = '';
        
        // hashSet.forEach( (word) => {
        // 	let hash = md5(word);
        // 	hash = md5(hash + word);
        // 	newSet.add(hash.slice(0, 5));
        // } );
        
        // newSet.forEach( str => hashStr += str + '\n' );
        
        // fileWriter(hashFile, hashStr);
        
        // Gzip file
        // zlib.params(9);
        zlib.deflate(newStr, (err, buffer) => {
		  if (!err) {
		    fileWriter(initFile, buffer);
		  } else {
		    // handle error
		  }
		});

        
        
        
        // Check word in word.
    //     let statStr = '';
    //     let number = 0;
	   //     hashSet.forEach( (testWord) => {
	   //     	let col = 0;
	        	
	   //     	console.log(number++);
	        	
	   //     	if (testWord.length > 2) {
		  //      	hashSet.forEach( (word) => {
	   //     			if (word.indexOf(testWord) != -1) col++;
	   //     		} );
	   //     	}
	        	
				// if (col > 10) {
				// 	statStr += testWord + ' : ' + col + '\n';
				// }
	        	
	   // 	}); 
	        	
	   // 	fileWriter(statFile, statStr);
    })
    .catch(error => {
        console.log('ERROR');
        console.log(JSON.stringify(error));
    });
}

let testRes = '';
let result = 0;
let count = 0;
let falseWords = '';


function test(count, callback) {
	for (let i = 0; i < count; i++ ) {
		request({
	    url: testUrl,
	    // json: true
		}, function (error, response, body) {
		    if (!error && response.statusCode === 200) {
		        // console.log(body) // Print the json response

		        let test = {};
		        test = JSON.parse(body);
		        // console.log(test);
		        
		        for(var index in test) { 

		        	let testResult = classifier.test(index);
			        if (!test[index] && testResult) {
			        	falseWords += index + '\n';
			        }
		        	count++;
		        	if (testResult == test[index]) result++;
		        	if (!testResult) {
		        		// testRes += index + ' |result: ' + testResult + ' | = ' + test[index] + '\n';
		        		// console.log(index, ' : ', testResult, ' : ', test[index]);
		        	}
				}
		        
		        // fileWriter(falseFail, falseWords);
    			testRes = result + ' from ' + count ;
				console.log(testRes);
		    }
		});

	}
	
	callback();
}
    
    
    // Check words with 2 roots.
	// For in for for test each word in other words and gather statistic in file.


// Get test JSON.
// Get ten or more tests and add all to set.
// Check all and show wrong results.
let request = require("request");

// prepare();

// Read file from gzip.
readFile();



let testUrl = "https://hola.org/challenges/word_classifier/testcase";

test(100, () => {});



// console.log(testResult);



let mimes = {
    '.html': 'text/htmnl',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.gif': 'image/gif',
    '.jpg': 'image/jpg',
    '.png': 'image/png'
}

// Access to file.
function fileAccess(filepath) {
    return new Promise((resolve, reject) => {
        fs.access(filepath, fs.F_OK, error => {
            if (!error) {
                resolve(filepath);
            } else {
                reject(error);
            }
        })
    });
}

// Read file.
function fileReader(filepath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filepath, 'utf8', (error, content) => {
            if (!error) {
                resolve(content);
            } else {
                reject(error);
            }
        })
    }); 
}

// Read file buffer.
function fileReaderBuffer(filepath) {
    return new Promise((resolve, reject) => {
        resolve(fs.readFileSync(filepath));
    }); 
}


// write file.
function fileWriter(filepath, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filepath, data, 'utf8', (error) => {
            if (!error) {
                resolve(console.log('file: ' + filepath + ' was writen'));
            } else {
                reject(error);
            }
        });
    });
}


// Web server realizations.
function webServer(req, res) {
    
    
    let baseURI = url.parse(req.url);
    let filepath = __dirname + '/WebServerBegin' + (baseURI.pathname === '/' ? '/index.htm' : baseURI.pathname);
    
    // mimes['.css'] === 'text/css'
    let contentType = mimes[path.extname(filepath)];
    
    fileAccess(filepath)
        .then(fileReader)
        .then(content => {
            res.writeHead(200, {'Content-type': contentType});
            res.end(content, 'utf-8');
        })
        .catch(error => {
            res.writeHead(404);
            res.end(JSON.stringify(error));
        });
}

// Node servere.
http.createServer(webServer).listen(PORT, () => console.log('Webserver running on port: ', PORT));


// remove affixies.
function removeAff(prevWord, word, nextWord) {
	// 's.
	word = word.replace( /'s$/i, "" );
	
	// Check multiple.
	if (word.slice(-1) == 's') {
		word = word.slice(0, -1);
	}
	
	// -ed/ing/ly/y.
	word = word.replace( /i?es$|ed$|er$|ing$|ibles$|ibly$|l?y$|ib$/i, "" );
	
	// -er -or -ism -ist -ee -ian -age -do -dom -hood -tomy -ion -ation -sion -ssion -ment -ship  -ness -ship -ure -able -ible -al -ant -ent  -ful -ish -ive -less -ous -ies -en -eng -fy
	// remove, but not all... -id -ix -ank -um -im -ic - -in ic az -a o -l -e -k
	// remove all words affixies.
	// -cat -cation -est -ite  -lateral -lecithal -borg -iar -ise  -ize -ised(past) -cit -trope -trop -loma -phobia -io -phor -meter -ini -form -ative -ator -ibilit -abilit -ate -ory 
	// -ambul- -ically -gen- -chemi- -tail -skin -tween - -maid -man -aceae -anal- -wood -lock -like -lost- -time -wake -walk -out -mong- -weed -sold -sorb -sperm -sporid -bacter -cyt- 
	// -ence -some- -bour(n/g) -chance -channel -chant- -charm- -charnel -nock -method- -sen- -genous -phone -polis -polit(h) -pollution -pool -cell- -dyne -land -potence- -pound -hend 
	// -hend- -byt- -saur- -mesis -mest- -coma- -stan -sation  -ame -ome  -bind -bid -cit- -cim- -ect- -emma- -people -person -graph -phil(l) -mot- -ak- -ress -tess -lose -solv -course 
	// -wear- -wise -bird -book -mark -music -ants -back -fish -proof -be(u)rg -merge - -ology -sack -scotch -thumb- -hole- -sville -digit- -nophil(l)- -worth(i) -flam    
	// -mut- -pro- -net- -axe -ori -om- -act- -din- -rus  
	word = word.replace( /pollution$|lateral$|lecithal$|potence$|convert$|channel$|charnel$|nophill?$|[cs]ation$|ibilit$|phobia$|[ai]bilit$|ically$|sporid$|bacter$|method$|genous$|polith?$|people$|person$|ation$|ssion$|course$|scotch$|sville$|worthi?$|trope$|meter$|ative$|ambul$|chemi$|tween$|aceae$|sperm$|bour[n/g]$|chance$|chant$|charm$|phone$|polis$|pound$|mesis$|graph$|phill?$|music$|proof$|tend$|plan$|beu?rg$|merge$|ology$|thumb$|digit$|sion$|ment$|[ln]ess$|post$|ship$|[ai]ble$|ibly$|ists$|hood$|tomy$|borg$|ised$|trop$|loma$|phor$|form$|ator$|tail$|skin$|maid$|anal$|wood$|lock$|like$|lost$|time$|wake$|walk$|mong$|weed$|sold$|sorb$|ence$|some$|nock$|pool$|cell$|dyne$|land$|hend$|saur$|mest$|coma$|stan$|bind$|emma$|[rt]ess$|lose$|solv$|wear$|wise$|bird$|book$|mark$|ants$|back$|fish$|sack$|hole$|flam$|ie[rs]$|is[mt]$|ian$|age$|dom$|ion$|ure$|[ae]nt$|ful$|ish$|ive$|ous$|eng$|ank$|c[ai]t$|e[cs]t$|i[stz]e$|iar$|mat$|ini$|ate$|ory$|gen$|man$|out$|[bc]yt$|[ao]me$|bid$|cim$|mot$|mut$|pro$|net$|axe$|ori$|act$|din$|rus$|io$|ak$|om$do$|ee$|en$|fy$|i[dmx]$|um$|i[cn]$|al$|az$|or$|a$|o$|l$|e$|k$|s$/i, "" );
	
	
	// preaffix.
	// /^pre|post/i
	word = word.replace( /^anthraco|^anthropo?|^counter|^acantho|^america|^apalach|^apostol|^archaeo|^astylos|^babylon|^bacilla|^apache|^aphoro|^archn[eio]|^actin[io]|^argent|^arnold|^arthro|^atlant|^austro|^bacter|^balkan|^barnes?|^basili|^beaver|^under|^inter|^ultra|^afrio?|^agape|^ahmad|^allen?|^allis|^alban|^alber|^aleks|^amphi|^andro|^angl[io]|^antho|^aporo|^apter|^arch[ei]|^aster|^astr[ao]|^babel|^bactr|^baham|^baker?|^barb[aei]|^barde?|^barn[ae]|^batra|^anti|^over|^post|^past|^aber|^abra|^acro|^ada[ei]|^aegi|^aero|^agae|^agr[io]|^alta?|^alma|^allo|^alb[io]|^alc[aio]|^alex|^amm[aio]|^anch?|^and[io]|^ang[aeilo]|^ann[aei]|^anom|^anth|^aph[aeio]|^apl[ao]|^apol|^aqu[ai]|^ara[blm]|^arch|^arg[ioy]|^arm[aeio]|^arri|^art[aeio]|^adtr|^asty|^ath[ae]|^atr[aeio]|^att[ai]|^auck|^auri|^auto|^avan|^aver|^baal|^baby|^bac[kt]|^bai[ln]|^bakh|^bal[ail]|^ban[ek]|^bar[abdnt]|^bat[eo]|^beau|^beck|^bel[lo]|^bene?|^berg?|^dis|^non|^mis|^pre|^sub|^ab[io]|^abs|^aca|^aca|^act|^ada|^aga|^agg|^agr|^agu|^ahi|^ai[lr]|^ak[ai]|^al[abcedfgio]|^am[abeioy]|^an[acdginot]|^ap[aeilop]|^ar[acegikmot]|^as[iosty]|^at[aer]|^au[dfs]|^av[io]|^ayu?|^az[aeo]|^ba[bdgklnprstuxy]|^bac|^be[cdehlmnor]|^un|^in|^de|^re|^co|^ex|^en|^ae|^ax|^ab|^a/i, "" );
	
	// il -l
	// ir -r
	// im -m/p
	if (word.slice(0, 2) == 'il' && word.slice(2, 1) == 'l') {
		word = word.slice(2);
	}
	
	if (word.slice(0, 2) == 'ir' && word.slice(2, 1) == 'r') {
		word = word.slice(2);
	}
	
	if (word.slice(0, 2) == 'im' && (word.slice(2, 1) == 'm' || word.slice(2, 1) == 'p')) {
		word = word.slice(2);
	}

	return word;
}

function removeWord(word) {
		word = word.replace( /ophthalm|electro|branchi|ogenesi|phthalm|pharyng|pseudo|tionar|thermo|therap|super|sthesi|quadri|psycho|phosph|oplast|omorph|oblast|icular|hetero|haryng|genesi|electr|circum|chondr|cephal|branch|hyper/i, "");
		word = word.replace( /blast|board|brach|carbo|cardi|centr|cepha|chlor|chond|chro[mn]|circu|craft|crypt|cula[rt]|dynam|ectom|elect|ethyl|field|gastr|gloss|gnath|heart|heter|hydro|ialit|idean|illar|iolog|ionar|lectr|light|lymph|m[ai]cro|morph/i, "");
		word = word.replace( /mouth|multi|nalit|nceph|nephr|neuro|ngton|nolog|nucle|ocarp|ocyst|oderm|odont|ogram|olith|olysi|omanc|omani|ometr|opath|ophag|ophob|ophyt|organ|ortho|oscop|ostat|ostom|palae|penta|peric|phil[io]|photo|physi|plasm|plast|pleur|proto|pseud/i, "");
		word = word.replace( /psych|quadr|rachi|radio|ranch|right|rolog|romet|rough|sburg|scler|semi[cp]|smith|ster[eno]|stown|sulph|supra|teroc|tetra|ther[im]|thesi|tolog|tomet|trach|trans|trich|troph|ulari|olog|bili|boa[rt]|bra[cn]|bro[mn]|bur[gn]|bush|cal[ci]|camp|cand|car[bdip]/i, "");
		word = word.replace( /cast|cen[ct]|cep[ht]|cha[lnr]|che[mrt]|chi[lnrt]|chlo|cho[lnpr]|chro|cipi|circ|cket|clas|cler|cra[cnt]|cro[cmps]|ctom|cul[it]|cyan|cycl|cyst|cyto|diac|dont|down|dro[cmnps]|duct|each|east|eath|econ|ectr|eigh|elan|elec|ell[iu]|embr|emon|epat|epit|equi|era[cnt]|ere[bt]/i, "");
		word = word.replace( /erit|ermi|ero[mnpt]|erst|erti|ervi|esqu|esth|est[ir]|ethy|eton|etti|ewar|ferr|fibr|flow|foot|for[demt]|fron|fter|gast|geni|glo[bs]|gnat|goni|gra[mn]|grav|gton|haem|hagi|hair|hali|halm|han[dg]|har[dimt]|hea[drt]|hedr|heli|hem[io]|her[im]|hexa|hili|hipp|hist|hold|holo/i, "");
		word = word.replace( /homo|hond|horn|hosp|hron|hydr|hypo|icar|icon|idan|idi[ot]|ield|ight|ilit|illi|imet|impe|ioph|iosi|ipar|isch|ison|ist[ir]|ita[nr]|itch|iton|iver|ivit|lac[hkt]|lan[cdg]|lari|last|lat[ir]|lean|leni|lep[ht]|lett|leu[cr]|lich|lind|lit[hi]|lla[nrt]|llet|llit|llow|loch|logi|long|loph|losi|loth/i, '' );
		word = word.replace( /lton|lysi|mac[hr]|magn|mali|man[cdint]|mari|mast|mati|medi|mega|meli|men[it]|mer[io]|meso|met[ahr]|micr|mill|mith|mon[iot]|morp|most|moth|mpan|mult|myel|nali|nari|nath|neph|nesi|nett|neur|niac|nit[hir]|noch|noph|nos[it]|nson|ntar|nthu|nton|nucl|ocar|och[ir]|ocon|octo|o[dg]on|oint|ola[rt]/i, '' );
		word = word.replace( /olet|oli[gt]|olli|omet|omni|onat|onch|oneu|onit|ono[cmt]|onti|opat|oper|opod|opsi|ora[cn]|orch|oret|orni|orph|orrh|orth|osau|osit|osom|osph|ost[er]|othe|oto[mnx]|otyp|ouch|ough|ound|out[hs]|pala|pant|par[ait]|path|pect|pen[nt]|per[cdfimpst]|pha[glnr]|phen|phil|pho[bnst]|phra|phy[lst]/i, '' );
		word = word.replace( /pist|pith|pla[cnt]|pneu|po[dl]i|poly|pond|port|posi|pro[cpst]|pseu|pter|pyro|quad|quet|quin|rach|radi|raft|rali|ramm|ran[cdgi]|raph|rast|rati|rbon|rchi|rgan|ric[hu]|rid[gi]|riti|rmat|road|roch|romi|ron[cit]|roo[mt]|roph|ros[ceit]|roth|rou[gn]|rson|rthr|rtic|rton|rush|ryst|ryth|sand/i, '' );
		word = word.replace( /sarc|sbur|sca[lp]|scen|schi|scop|scri|semi|sept|sett|shir|sili|smit|soph|spar|spe[cr]|spi[nr]|sple|spo[nr]|squi|sta[rt]|ste[mnr]|sti[ct]|sto[cmnpw]|str[iou]|sul[fp]|supr|sych|tach|tali|tan[cd]|taph|ta[rs]i|tech|tele|temp|ter[beimnor]|tetr|tha[lnr]|the[crt]|thon|thri|thy[lr]|ticu/i, '' );
		word = word.replace( /ti[lt]i|titu|toch|to[mn]i|toph|tos[it]|town|tra[cdimnpt]|tri[acpt]|tro[cmnt]|tton|ula[rt]|ulph|ulti|uran|uret|urop|usti|vari|ve[nr]t|ward|whit|wind|wor[mt]|yard|yso/i, '' );

	return word;
}


function removeWord2 (word) {
	word = word.replace( /i?ferou|aceou|berri|genou|iousn|lessn|aean|alit|alli|ant[hi]|arch|assi|atou|atur|augh|ber[rt]|caln|cata|ceou|ciou|citi|elet|emat|ench|enci|enou|en[st]i|erou|essn|fero|fuln|geno|here|inat|ingn|inou|irre|ishn|lace|ling|mala|mato|mini|nder|neou|ogen|olou|omyc|orou|ousn|read|ring|riou|rous|siti|squa|stea|tati|tedn|thro|tiou|ulou|ab[iru]|ac[achirtu]|ad[dei]|ae[mt]|aff|ag[eiru]|ai[rt]|aki|al[cdgilmnptuv]|am[beimpu]|an[acdeginou]|ap[hiopstu]|aqu|ar[abcdgimnprtuv]|as[chimstu]|at[hiortu]|au[dgrt]|avi|awn|axi|ba[clnrt]|bbi|be[agnrst]|bi[norst]|bl[aeiou]|bo[dlnortuwx]|br[aeiou]|bu[clnrt]|ca[bcdlmnprstu]|cc[io]|ce[lrst]|ch[aeiortuy]|ci[dlnot]|ck[is]|cl[aeiou]|co[clmnprtu]|cr[aeiou]|ct[iu]|cu[lmnrt]|da[clmnrt]|ddi|de[cmnrs]|di[acfgnoptv]|dle|do[cglmnorsu]|dr[aei]|du[clnr]|dys|ea[bcdfmnrtu]|eb[aoru]|ec[hiotu]|ed[aeginru]|ee[lpt]|eff|eg[agior]|ei[rt]|el[adeilmotu]|em[abeiop]|en[cdeinotuz]|eo[npu]|ep[ahiot]|equ|er[abcdegimnoprstuvw]|es[chiopst]|et[hiortu]|eu[rt]|ev[aei]|ex[it]|fa[cnr]|fer|ffi|fi[clnrs]|fl[aeiou]|fo[lr]|fr[aeiu]|fur|ga[lmnrt]|ge[lnort]|ggi|gi[nt]|gl[aeiou]|gn[io]|go[nortu]|gr[aeio]|gu[ain]|gyn|ha[bcdegilmnprtuw]|he[acdilmnoprs]|hi[cnoprz]|ho[cdlmnprtuw]|hr[aei]|hth|hu[mnr]|hy[mnp]|ia[cdmnrst]|ib[iu]|ic[ehiotu]|id[deiou]|iet|if[fit]|ig[ghinoru]|iki|il[adeilot]|im[abimpu]|in[acdeginostu]|io[cdnptu]|ip[hiop]|iqu|ir[eiortu]|is[aciot]|it[hiortu]|ivi|jac|ka[lnrt]|ke[lnrt]|kin|kle|la[bcdghimnprstuvwy]|le[bcdegimnoprstuvwx]|lgi|li[acdefgmnoptvz]|ll[aeiou]|lmi|lo[bcdgimnoprstuvw]|lp[hi]|lti|lu[cmnrst]|lv[ei]|ly[cnt]|ma[cdgilmnrst]|mb[iru]|me[alnrst]|mi[cdlnrt]|mm[aeiou]|mo[cdlnorstu]|mp[aehilortu]|mu[clnrs]|my[co]|na[bcdgilmnprstu]|nc[hitu]|nd[iru]|ne[abcilmortw]|ng[ehinu]|ni[cfgnotz]|nki|nn[ei]|no[bcdgimnprstuvw]|ns[eit]|nt[ehinr]|nu[rt]|nvi|oa[cnrt]|ob[abi]|oc[acehiortu]|od[deiouy]|oe[cnt]|off|og[egilu]|oi[dt]|ol[deiotuy]|om[abeimopy]|on[cdeginosty]|oo[dmnptu]|op[hioptu]|oqu|or[abcdeghimnorstu]|os[acehipst]|ot[aehiortu]|ou[lnrt]|ov[ai]|own|ox[iy]|pa[cdilnprst]|pe[adlnrt]|ph[aeilory]|pi[ceglnpst]|pl[aeiou]|po[dilmnprtu]|ppi|pr[aeio]|psi|pti|pu[lnrt]|pyr|qu[aei]|ra[bcdghilmnprttuvw]|rbi|rc[hiu]|rdi|re[acgimopstv]|rgi|rh[aioy]|ri[bcdefgmnoptuvz]|rli|rni|ro[bcdefgilmnprstuvw]|rr[ehi]|rs[ehit]|rt[hi]|ru[bcdnst]|rvi|sa[bcdlmnrtu]|sc[ahioru]|se[aclmnprtx]|sh[aeinoru]|si[acdfglmnot]|sk[ei]|sli|smo|sna|so[clmnrtu]|sp[aehior]|squ|ss[inu]|st[aeioru]|su[cnr]|sw[ae]|sy[lmn]|ta[bcdgilmnprstu]|tch|te[adlnprst]|th[eioruy]|ti[cfgmnptv]|tle|to[cilmnoprtu]|tr[aeiou]|tti|tu[bdmnr]|ty[lp]|ua[nrt]|ub[bi]|uc[chi]|ud[di]|uff|ug[gh]|ui[lt]|ul[adilnotu]|um[abimp]|un[cdgint]|uou|upp|ur[abdeginorstu]|us[cehint]|ut[aehiortu]|va[glnrst]|ve[lnrst]|vi[clnrst]|vo[lr]|wa[lnrst]|we[lr]|wh[ei]|wi[nt]|wo[mor]|yan|yc[ho]|ygo|yl[io]|yon|yph|yri|yst|yth|za[nr]|zo[no]/i, '' );
	
	return word;
}


//md5
function md5 ( str ) {
	var RotateLeft = function(lValue, iShiftBits) {
			return (lValue<<iShiftBits) | (lValue>>>(32-iShiftBits));
		};

	var AddUnsigned = function(lX,lY) {
			var lX4,lY4,lX8,lY8,lResult;
			lX8 = (lX & 0x80000000);
			lY8 = (lY & 0x80000000);
			lX4 = (lX & 0x40000000);
			lY4 = (lY & 0x40000000);
			lResult = (lX & 0x3FFFFFFF)+(lY & 0x3FFFFFFF);
			if (lX4 & lY4) {
				return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
			}
			if (lX4 | lY4) {
				if (lResult & 0x40000000) {
					return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
				} else {
					return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
				}
			} else {
				return (lResult ^ lX8 ^ lY8);
			}
		};

	var F = function(x,y,z) { return (x & y) | ((~x) & z); };
	var G = function(x,y,z) { return (x & z) | (y & (~z)); };
	var H = function(x,y,z) { return (x ^ y ^ z); };
	var I = function(x,y,z) { return (y ^ (x | (~z))); };

	var FF = function(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

	var GG = function(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

	var HH = function(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

	var II = function(a,b,c,d,x,s,ac) {
			a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
			return AddUnsigned(RotateLeft(a, s), b);
		};

	var ConvertToWordArray = function(str) {
			var lWordCount;
			var lMessageLength = str.length;
			var lNumberOfWords_temp1=lMessageLength + 8;
			var lNumberOfWords_temp2=(lNumberOfWords_temp1-(lNumberOfWords_temp1 % 64))/64;
			var lNumberOfWords = (lNumberOfWords_temp2+1)*16;
			var lWordArray=Array(lNumberOfWords-1);
			var lBytePosition = 0;
			var lByteCount = 0;
			while ( lByteCount < lMessageLength ) {
				lWordCount = (lByteCount-(lByteCount % 4))/4;
				lBytePosition = (lByteCount % 4)*8;
				lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount)<<lBytePosition));
				lByteCount++;
			}
			lWordCount = (lByteCount-(lByteCount % 4))/4;
			lBytePosition = (lByteCount % 4)*8;
			lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
			lWordArray[lNumberOfWords-2] = lMessageLength<<3;
			lWordArray[lNumberOfWords-1] = lMessageLength>>>29;
			return lWordArray;
		};

	var WordToHex = function(lValue) {
			var WordToHexValue="",WordToHexValue_temp="",lByte,lCount;
			for (lCount = 0;lCount<=3;lCount++) {
				lByte = (lValue>>>(lCount*8)) & 255;
				WordToHexValue_temp = "0" + lByte.toString(16);
				WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length-2,2);
			}
			return WordToHexValue;
		};

	var x=Array();
	var k,AA,BB,CC,DD,a,b,c,d;
	var S11=7, S12=12, S13=17, S14=22;
	var S21=5, S22=9 , S23=14, S24=20;
	var S31=4, S32=11, S33=16, S34=23;
	var S41=6, S42=10, S43=15, S44=21;

// 	str = this.utf8_encode(str);
	x = ConvertToWordArray(str);
	a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

	for (k=0;k<x.length;k+=16) {
		AA=a; BB=b; CC=c; DD=d;
		a=FF(a,b,c,d,x[k+0], S11,0xD76AA478);
		d=FF(d,a,b,c,x[k+1], S12,0xE8C7B756);
		c=FF(c,d,a,b,x[k+2], S13,0x242070DB);
		b=FF(b,c,d,a,x[k+3], S14,0xC1BDCEEE);
		a=FF(a,b,c,d,x[k+4], S11,0xF57C0FAF);
		d=FF(d,a,b,c,x[k+5], S12,0x4787C62A);
		c=FF(c,d,a,b,x[k+6], S13,0xA8304613);
		b=FF(b,c,d,a,x[k+7], S14,0xFD469501);
		a=FF(a,b,c,d,x[k+8], S11,0x698098D8);
		d=FF(d,a,b,c,x[k+9], S12,0x8B44F7AF);
		c=FF(c,d,a,b,x[k+10],S13,0xFFFF5BB1);
		b=FF(b,c,d,a,x[k+11],S14,0x895CD7BE);
		a=FF(a,b,c,d,x[k+12],S11,0x6B901122);
		d=FF(d,a,b,c,x[k+13],S12,0xFD987193);
		c=FF(c,d,a,b,x[k+14],S13,0xA679438E);
		b=FF(b,c,d,a,x[k+15],S14,0x49B40821);
		a=GG(a,b,c,d,x[k+1], S21,0xF61E2562);
		d=GG(d,a,b,c,x[k+6], S22,0xC040B340);
		c=GG(c,d,a,b,x[k+11],S23,0x265E5A51);
		b=GG(b,c,d,a,x[k+0], S24,0xE9B6C7AA);
		a=GG(a,b,c,d,x[k+5], S21,0xD62F105D);
		d=GG(d,a,b,c,x[k+10],S22,0x2441453);
		c=GG(c,d,a,b,x[k+15],S23,0xD8A1E681);
		b=GG(b,c,d,a,x[k+4], S24,0xE7D3FBC8);
		a=GG(a,b,c,d,x[k+9], S21,0x21E1CDE6);
		d=GG(d,a,b,c,x[k+14],S22,0xC33707D6);
		c=GG(c,d,a,b,x[k+3], S23,0xF4D50D87);
		b=GG(b,c,d,a,x[k+8], S24,0x455A14ED);
		a=GG(a,b,c,d,x[k+13],S21,0xA9E3E905);
		d=GG(d,a,b,c,x[k+2], S22,0xFCEFA3F8);
		c=GG(c,d,a,b,x[k+7], S23,0x676F02D9);
		b=GG(b,c,d,a,x[k+12],S24,0x8D2A4C8A);
		a=HH(a,b,c,d,x[k+5], S31,0xFFFA3942);
		d=HH(d,a,b,c,x[k+8], S32,0x8771F681);
		c=HH(c,d,a,b,x[k+11],S33,0x6D9D6122);
		b=HH(b,c,d,a,x[k+14],S34,0xFDE5380C);
		a=HH(a,b,c,d,x[k+1], S31,0xA4BEEA44);
		d=HH(d,a,b,c,x[k+4], S32,0x4BDECFA9);
		c=HH(c,d,a,b,x[k+7], S33,0xF6BB4B60);
		b=HH(b,c,d,a,x[k+10],S34,0xBEBFBC70);
		a=HH(a,b,c,d,x[k+13],S31,0x289B7EC6);
		d=HH(d,a,b,c,x[k+0], S32,0xEAA127FA);
		c=HH(c,d,a,b,x[k+3], S33,0xD4EF3085);
		b=HH(b,c,d,a,x[k+6], S34,0x4881D05);
		a=HH(a,b,c,d,x[k+9], S31,0xD9D4D039);
		d=HH(d,a,b,c,x[k+12],S32,0xE6DB99E5);
		c=HH(c,d,a,b,x[k+15],S33,0x1FA27CF8);
		b=HH(b,c,d,a,x[k+2], S34,0xC4AC5665);
		a=II(a,b,c,d,x[k+0], S41,0xF4292244);
		d=II(d,a,b,c,x[k+7], S42,0x432AFF97);
		c=II(c,d,a,b,x[k+14],S43,0xAB9423A7);
		b=II(b,c,d,a,x[k+5], S44,0xFC93A039);
		a=II(a,b,c,d,x[k+12],S41,0x655B59C3);
		d=II(d,a,b,c,x[k+3], S42,0x8F0CCC92);
		c=II(c,d,a,b,x[k+10],S43,0xFFEFF47D);
		b=II(b,c,d,a,x[k+1], S44,0x85845DD1);
		a=II(a,b,c,d,x[k+8], S41,0x6FA87E4F);
		d=II(d,a,b,c,x[k+15],S42,0xFE2CE6E0);
		c=II(c,d,a,b,x[k+6], S43,0xA3014314);
		b=II(b,c,d,a,x[k+13],S44,0x4E0811A1);
		a=II(a,b,c,d,x[k+4], S41,0xF7537E82);
		d=II(d,a,b,c,x[k+11],S42,0xBD3AF235);
		c=II(c,d,a,b,x[k+2], S43,0x2AD7D2BB);
		b=II(b,c,d,a,x[k+9], S44,0xEB86D391);
		a=AddUnsigned(a,AA);
		b=AddUnsigned(b,BB);
		c=AddUnsigned(c,CC);
		d=AddUnsigned(d,DD);
	}

	var temp = WordToHex(a)+WordToHex(b)+WordToHex(c)+WordToHex(d);

	return temp.toLowerCase();
}
