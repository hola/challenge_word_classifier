

var test = function(str) {
	//length of a word 
	var n = str.length; 
//-----part 1 clean the obvious non words results

	if (((n<1) || (n>34)) && (n!=45) && (n!=58) && (n!=60))
		return false;

//-----part 2- translate string to number
var convert3=[[49,50,51,52,53,54,55,56,57,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114],
	      [97,115,101,111,105,99,100,116,109,112,114,108,98,110,117,102,103,104,119,118,121,107,120,106,122,113,114]
	] // matrix for convert words with length 3
	var st="";
	for (var i=0; i<=n-1;i++){
		var code=str.charCodeAt(i);
		if ((code<=96) && (code!=39))    // A -> a
			 code +=32;  
		if (n!=3) {
			code = (code==39) ? 114 : (code = (code<106) ? (code -=48) : (code -=9)); // normal convertion
		}
		else {   //for length 3
			for (var j=0; j<=26; j++){
				if (convert3[1][j]==code)
					code=convert3[0][j];
			}
		}
		st+=String.fromCharCode(code);
	}
	var num = parseInt(st,28); //unique number
//------part 3- liner function and matrix-----------------

var s60="Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch's";
var s58="Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch";
var s_45="pneumonoultramicroscopicsilicovolcanoconiosis";
var s1_45="pneumonoultramicroscopicsilicovolcanoconioses";
var s_34="diaminopropyltetramethylenediamine";
var s1_34="supercalifragilisticexpialidocious";
var s_33="dichlorodiphenyltrichloroethane's";
var s_32="dichlorodiphenyltrichloroethanes";
//---------------------
var syl2=[35,42,75,113,114,137,139,140,146,161,165,179,
181,205,215,235,239,241,244,246,247,250,256,
257,259,265,267,270,276,283,285,296,302,328,
337,348,351,361,380,399,415,422,425,426,430,
438,439,441,452,467,493,499,503,510,519,524,
525,529,534,536,544,545,553,556,562,570,571,
581,585,588,595,597,603,604,605,607,608,610,
622,623,626,630,631,633,634,635,640,646,647,
649,652,654,655,657,659,662,665,666,671,672,673,674];
var syl3=[
	[813,821,827,835,841,848,857,862,865,869,874,
879,883,894,897,906, 911,915,922,925,930,935,938,940,
942,946,954,958,964,967,970,981,993,996,998,1000,1004,
1009,1016,1021,1024,1026,1028,1030,1037,1046,1049,1051,
1057,1065,1072,1079,1081,1087,1093,1105,1112,1118,1121,1132,1139,1141,1149],
	[ 3 , 3 , 3 , 0 , 5 , 7 , 3 , 0 , 0 , 2 , 2 , 0 , 1 , 0 , 1 , 3 ,
  0 , 0 , 0 , 1 , 3 , 1 , 0 , 0 , 0 , 1 , 2 , 4 , 1 , 1 , 4 ,10 , 1 , 0 ,
 0 ,  1  ,  0 ,  5 ,  3 ,  1 , 0  ,  0 ,  0 , 0  ,  7 ,  1 ,  0 ,  0 ,  0 ,
 5  ,  5 ,  0 , 1  , 1  , 10 ,  4 ,  3 ,  0 , 9  ,  5 , 0  , 1  , 8 ]
	];
	switch (n) {
		case 1: {
			if ((num>0) && (num<=26))
				return true;	
			break;
		}
		case 2: {
			
			for (i=0; i<=101;i++){
				if (syl2[i]==num)
					return false;	
			}			
				return true;
			break;
		}
		case 3: {
			var bgn=syl3[0][0];
			var inter=syl3[1][0];
			for(j=0;j<=62;j++){
				if ((num<syl3[0][j]) && (num>=bgn) && (num<=bgn+inter)){
					return true;
				}
				bgn=syl3[0][j];
				inter=syl3[0][j];		
			}
			return false;
			
			break;
		}
		case 4: {
			return false; //tmp, in development
			break;
		}
		case 5: {
			return false;//tmp, in development
			break;
		}
		case 6: {
			return false;//tmp, in development
			break;
		}
		case 7: {
			return false;//tmp, in development
			break;
		}
		case 8: {
			return false;//tmp, in development
			break;
		}
		case 9: {
			return false;//tmp, in development
			break;
		}
		case 10: {
			return false;//tmp, in development
			break;
		}
		case 11: {
			return false;//tmp, in development
			break;
		}
		case 12: {
			return false;//tmp, in development
			break;
		}
		case 13: {
			return false;//tmp, in development
			break;
		}
		case 14: {
			return false;//tmp, in development
			break;
		}
		case 15: {
			return false;//tmp, in development
			break;
		}
		case 16: {
			return false;//tmp, in development
			break;
		}
		case 17: {
			return false;//tmp, in development
			break;
		}
		case 18: {
			return false;//tmp, in development
			break;
		}
		case 19: {
			return false;//tmp, in development
			break;
		}
		case 20: {
			return false;//tmp, in development
			break;
		}
		case 21: {
			return false;//tmp, in development
			break;
		}
		case 22: {
			return false;//tmp, in development
			break;
		}
		case 23: {
			return false;//tmp, in development
			break;
		}
		case 24: {
			return false;//tmp, in development
			break;
		}
		case 25: {
			return false;//tmp, in development
			break;
		}
		case 26: {
			return false;//tmp, in development
			break;
		}
		case 27: {
			return false;//tmp, in development
			break;
		}
		case 28: {
			return false;//tmp, in development
			break;
		}
		case 29: {
			return false;//tmp, in development
			break;
		}
		case 30: {
			return false;//tmp, in development
			break;
		}
		case 31: {
			return false;//tmp, in development
			break;
		}
		case 32: {
			if (str==s_32)
				return true;
			break;
		}
		case 33: {
			if (str==s_33)
				return true;
			break;
		}	
		case 34: {
			if ((str==s_34) || (str==s1_34))
				return true;
			break;
		}
		case 45: {
			if ((str==s_45) || (str==s1_45))
				return true;
			break;
		}
		case 58: {
			if (str==s58)
				return true;
			break;
		}
		case 60: {
			if (str==s60)
				return true;
			break;
		}

	}
/*



*/

return false;
}



module.exports.test = test;



