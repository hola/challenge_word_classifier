'use strict';
//typedef struct stOperations
//{
//	unsigned char size;
//	unsigned char sizeWordLen;
//	unsigned char vSymbolsN[AlgParam_Symbols_GetForOpsMax];
//	unsigned char vMasks[AlgParam_Symbols_GetForOpsMax];
//	unsigned char vShifts[AlgParam_Symbols_GetForOpsMax];
//	unsigned char vAccumOpses[AlgParam_Symbols_GetForOpsMax];
//	unsigned char vSymbOpses[AlgParam_Symbols_GetForOpsMax];
//	unsigned char vSymbConst[AlgParam_Symbols_GetForOpsMax];
//	unsigned char vSymbConstOpses[AlgParam_Symbols_GetForOpsMax];
//} Operations; 

var ops;
var ops_size;
var ops_sizeWordLen;
var vSymbolsN=[];
var vMasks=[];
var vShifts=[];
var vAccumOpses=[];
var vSymbOpses=[];
var vSymbConst=[];
var vSymbConstOpses=[];

exports.init=function(data)
{
//	debugger;
//	console.log(`init log`);
//	console.log(data);

	ops=data;
	ops_size=data[0];
	ops_sizeWordLen=data[1];
//	console.log(ops_size);
//	console.log(ops_sizeWordLen);
	
	var first=2;
	var i;
	for(i=0;i<ops_size;i++)
	{
		vSymbolsN[i]=data[i+first];
		vMasks[i]=data[i+ops_size+first];
		vShifts[i]=data[i+ops_size*2+first];
		vAccumOpses[i]=data[i+ops_size*3+first];
		vSymbOpses[i]=data[i+ops_size*4+first];
		vSymbConst[i]=data[i+ops_size*5+first];
		vSymbConstOpses[i]=data[i+ops_size*6+first];
	}
}

exports.test=function(word)
{
//	debugger;
//	console.log(`test log`);
//	console.log(word);
	
//	console.log(ops_size);
//	console.log(ops_sizeWordLen);

	var word_conv=[];
    var j;
	for (j=0;j<word.length;j++)
	{
		var symbol=word[j];
		var code_out;
		if(symbol>='a' && symbol<='z')
		{
			//symbol=symbol-'a';
			code_out=symbol.charCodeAt(0)-'a'.charCodeAt(0);
		}
		else if (symbol=='\'')
		{
			//symbol='z'-'a'+1; // для \' код 'z'+1
			code_out='z'.charCodeAt(0)-'a'.charCodeAt(0)+1;
		}
		else
		{
			console.log("Err1");
		}
		word_conv[j]=code_out;
	}             

//	console.log(word_conv);
	
	var PLUS=0;
	var MINUS=1;
	var AND=2;
	var OR=3;
	var XOR=4;
	var MUL=5;
	var DIV=6;
	var IDIV=7; 		

	var RAW=0;
	var INVERT=1;

	//long 
	var accum_true=0,accum_false=0;
	var middle=ops_size>>1;
	var wordSize=word_conv.length;
	var i;
	//long 
	var symbol;
	var symbol_const;
    
	if(wordSize>58) return false;
	
	for(i=0;i<middle;i++ )
	{       
		if(vSymbolsN[i]<wordSize)
			symbol=word_conv[vSymbolsN[i]];
		else
			symbol=0;
		
		if(i>=middle-ops_sizeWordLen) symbol=wordSize;
		
		symbol_const=vSymbConst[i];
		switch(vSymbConstOpses[i])
		{
			case PLUS: symbol+=symbol_const;
				break;
			case MINUS: symbol-=symbol_const;
				break;
			case AND: symbol&=symbol_const;
				break;
			case OR: symbol|=symbol_const;
				break;
			case XOR: symbol^=symbol_const;
				break;
			case MUL: symbol*=symbol_const;
				break;
			case DIV: if(symbol_const) symbol/=symbol_const;
				break;
			case IDIV: if(symbol_const) symbol%=symbol_const;
				break;
			default:
				console.log("Err2");
				break;
		}
		
		if (vSymbOpses[i]==INVERT)
			symbol=~symbol;
		symbol &= vMasks[i];
		
		var shift=vShifts[i]-128;
		if(shift>0)
			symbol>>=shift;
		else if(shift<0)
			symbol<<=-shift;
		
		switch(vAccumOpses[i])
		{
			case PLUS: accum_true+=symbol;
				break;
			case MINUS: accum_true-=symbol;
				break;
			case AND: accum_true&=symbol;
				break;
			case OR: accum_true|=symbol;
				break;
			case XOR: accum_true^=symbol;
				break;
			case MUL: accum_true*=symbol;
				break;
			case DIV: if(symbol) accum_true/=symbol;
				break;
			case IDIV: if(symbol) accum_true%=symbol;
				break;
			default:
				console.log("Err3");
				break;

		}
	}
	
	for(i=middle;i<ops_size;i++ )
	{                                    
		if(vSymbolsN[i]<wordSize)
			symbol=word_conv[vSymbolsN[i]];
		else
			symbol=0;
		
		if(i>=ops_size-ops_sizeWordLen) symbol=wordSize;
		
		symbol_const=vSymbConst[i];
		switch(vSymbConstOpses[i])
		{
			case PLUS: symbol+=symbol_const;
				break;
			case MINUS: symbol-=symbol_const;
				break;
			case AND: symbol&=symbol_const;
				break;
			case OR: symbol|=symbol_const;
				break;
			case XOR: symbol^=symbol_const;
				break;
			case MUL: symbol*=symbol_const;
				break;
			case DIV: if(symbol_const) symbol/=symbol_const;
				break;
			case IDIV: if(symbol_const) symbol%=symbol_const;
				break;
			default:
				console.log("Err4");
				break;

		}
		
		if (vSymbOpses[i]==INVERT)
			symbol=~symbol;
		symbol &= vMasks[i];

		var shift=vShifts[i]-128;
		if(shift>0)
			symbol>>=shift;
		else if(shift<0)
			symbol<<=-shift;
		
		switch(vAccumOpses[i])
		{
			case PLUS: accum_false+=symbol;
				break;
			case MINUS: accum_false-=symbol;
				break;
			case AND: accum_false&=symbol;
				break;
			case OR: accum_false|=symbol;
				break;
			case XOR: accum_false^=symbol;
				break;
			case MUL: accum_false*=symbol;
				break;
			case DIV: if(symbol) accum_false/=symbol;
				break;
			case IDIV: if(symbol) accum_false%=symbol;
				break;
			default:
				console.log("Err5");
				break;

		}
	}
	
//	console.log("accum_true==%d accum_false==%d",accum_true,accum_false);
  
	var ret=accum_true>accum_false;
  
//	console.log(ret);
	return ret;
}