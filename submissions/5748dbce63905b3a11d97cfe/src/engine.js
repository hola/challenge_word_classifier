
/* "b" is the data buffer, set in the bootstrap code */
/* "o" is the data buffer start offset, set in the bootstrap code */

/* global variables are used throughout the code to improve compression */

/* LCG-PRNG-based permutation table "h" filler for Pearson hash */
/* Adds less entropy than static 256-bytes table */
m=256; 
/*c=5; a=3;*/
z=3; h={}; u={};
i=0;for(;i<m;i++){ /* standard compressible loop header */
  z=(3*z+5)%m;
  while(u[z])z=(z+1)%m;
  u[z]=1;
  h[i]=z
}

/* morphologic transformation list "y" */
/* {[a=from,b=exceptions,c=to,d=is_from_start},...] */
/* decoding exceptions list */
/* character range denotes field type */
/* 0-64 - exceptions */
/* 65-128 - from (except for 1st letter) */
/* 129-192 - to */
/* 193-224 - new item start, first letter of from for suffix replacement */
/* 225-255 - new item start, first letter of from for prefix replacement */
y=[];
i=-1;for(;b[o];o++)
  if ( b[o] > 192 )
    /* [ from_start + ] new item + from */
    (y[++i]={b:'',c:'',d:b[o]>224}).a=String.fromCharCode(b[o]-96-y[i].d*32)
  ;else/* */if ( b[o] > 128 )
    /* to */
    y[i].c+=String.fromCharCode(b[o]-64)
  ;else/* */if ( b[o] > 64 )
    /* from */
    y[i].a+=String.fromCharCode(b[o])
  ;else/* */
    /* exceptions */
    y[i].b+=String.fromCharCode(b[o]+64)
  ;
  o++; /* now "o" is a nonpairs table offset in data buffer "b" */
  /*console.log(y);*/
  
/* external bit table check function is less compressible */
/* function f(i,z){  z=z*27*27+(s[i-1]-97)*27+s[i]-97;  return m>1&&b[u+z/8|0]&(1<<(z%8))  }*/

/* statistical decisions */
/* return values: 0-word, 1-nonword, 2-check by bloom */
/* digits instead of booleans provide better compression */
/* "w" is used as a function definition shortcut only */
/* actually this function treated as an inline in the packer */
/*inline skip*/
c=w=>{
  /** console.log( s ); **/
  /** console.log( 1 ); **/
/*inline skip*/

/*inline 1 start*/
  /* double quote is a nonword */
  if (s.search(/\{.*\{/)>-1) return; /* 0 */

  /** console.log( 2 ); **/

  /* check for abequate comma usage (2nd position from the end or 2nd or 3rd from the start) */
  if((j=s.search('{'))>-1&&j!=1&&j!=2&&j!=s.length-2)return; /* 0 */

  /** console.log( 3 ); **/

  /* more than 5 consonants in a row are a nonword (ligatures are not imploded) */
  if (s./*replace(/th|sh|ch|ph|ck|gh|ng|sch|mc|hl|st|dt|cz|ght/g,'w').*/search(/[^aeiouy\{]{5}/)>-1)
    /*{ console.log( s );*/
    return; /* 0 */
  /*}*/


  /*testable a=s; testable*/

  m=s.length;

  /** console.log( 3.5 ); **/

  if(m==0)return; /* 0 */

  /* nonwords check is more compressible when it is done on Buffer */
  s=Buffer(s);

  /** console.log( 4 ); **/

  /* check for total nonpairs */
  /* 97 is 'a' */
  /* z=0 - offset to the total nonpairs */
  /* Intermediate variable "i" is for better compression - starting nonpairs and ending nonpairs code is the same */

  i=1;for(;i<m;i++){ /* standard compressible loop header (except for i=1) */
    z=0;
    /* start of identic compressible fragment */
    z=z*27*27+(s[i-1]-97)*27+s[i]-97;
    /* b[u+z/8|0]&(1<<(z%8)) string is identic to the one used in bloom filter */
    if(m>1&&b[u+z/8|0]&(1<<(z%8)))
      /*{ console.log( ">> " + s.toString() + " <<" );*/
      return /* 0 */
    /*}*/
    /* end of identic compressible fragment */
  }

  /** console.log( 5 ); **/

  /* check for starting nonpairs */
  /* z=1 - offset to the starting nonpairs */
  
  i=1;z=1;
  
  /* start of identic compressible fragment */
  z=z*27*27+(s[i-1]-97)*27+s[i]-97;
  /* b[u+z/8|0]&(1<<(z%8)) string is identic to the one used in bloom filter */
  if(m>1&&b[u+z/8|0]&(1<<(z%8)))
    /*{ console.log( ">> " + s.toString() );*/
    return /* 0 */
  /*}*/
  /* end of identic compressible fragment */
  ;

  /** console.log( 6 ); **/

  /* check for ending nonpairs */
  /* z=2 - offset to the ending nonpairs */

  i=m-1;z=2;

  /* start of identic compressible fragment */
  z=z*27*27+(s[i-1]-97)*27+s[i]-97;
  /* b[u+z/8|0]&(1<<(z%8)) string is identic to the one used in bloom filter */
  if(m>1&&b[u+z/8|0]&(1<<(z%8)))
    /*{    console.log( s.toString() + " <<" );*/
    return /* 0 */
  /*}*/
  /* end of identic compressible fragment */
  ;

  /** console.log( 7 ); **/

  /* more than 15-letter words are condsidered non-words */
  if(m>15)return; /* 0 */

  /** console.log( 8 ); **/

  /* all one-letter words exist except for "'" */
  if(s!='{'&&m==1)return/* */1;

  /** console.log( 9 ); **/

  /* if 2-letter word is passed check for nonpairs then it does exists */
  if(m==2)return/* */1;

/*inline 1 end*/

/*inline skip*/
  return/* */2
};
/*inline skip*/

/* test() function */
/* spec: "Any return value will be converted to Boolean" */
l.test=
/*inline skip*/
l
/*inline skip*/
/*inline add*//*s*//*inline add*/
=>{

  /*inline skip*/
  /* globalize s for c() */
  s=l;
  /*inline skip*/

  /* "u" is used as the generic bit mask table pointer */
  /* "o" is a nonpairs table offset in data buffer "b" */
  u=o;

  /* "'" is replaced to "{" to provide monotonous alphabet */
  s=s.replace(/\'/g,'{');
  
  /* statistical check of raw word */
  /* "s" is converted to buffer in c() */
  /*inline skip*/
  if((w=c())!==2)return/* */w;
  /*inline skip*/
  /*inline 1*/

  /* morphologic transformations is more compressible when it is done on String (e.g. reverse) */
  s=s.toString();

  /* for creation of bloom-dependent word list */
  /*bloom "return (s.replace(/\{/g,'\''));"; bloom*/

  /* alpply morphologic transformations */
  /* uppercase exceptions are positive (inclusions), lowercase exceptions are negative (exclusions) */
  /* the algorthm is optimised by compressed size and threfore quite slow */
  m=y.length;
  i=0;for(;i<m;i++){ /* standard compressible loop header */
    if(y[i].d)s=s.split('').reverse().join(''); /* reverse string before prefix transformation */
    if(y[i].b[0]&&y[i].b[0]<"a"){ /* inclusions by the previous character */
      z=0; /* "from" length */
      /* z=0 by default is a way to skip transformation code below */
      for(g of y[i].b)if(g.toLowerCase()===s[s.length-y[i].a.length-1])z=y[i].a.length /* z=j[i].length enables transformation */
    }else{ /* exclusions by the previous character */
      z=y[i].a.length; /* "from" length */
      for(g of y[i].b)if(g===s[s.length-z-1])z=0 /* z=0 is a way to skip transformation code below */
    }
    if(z&&s.length>z&&s.substr(-z)===y[i].a)
      /** { console.log( s ); **/
      s=s.substr(0,s.length-z)+y[i].c;
      /** console.log( "=" ); **/
      /** console.log( [ j[i], j[i+1], j[i+2], j[i+3] ] ); **/
      /** console.log( s ); } **/
    if(y[i].d)s=s.split('').reverse().join('') /* reverse string back after prefix transformation */
  }

  /* the word is transformed down to be too short - quite probable for test junk and improbable for dictionary word */
  if(s.length<3)return;

  /*testable a=s; testable*/

  /* statistical check of transformed word (trivial words are not included in bloom table) */
  /* "s" is converted to buffer in c() */
  /*inline skip*/
  if((w=c())!==2)return/* */w;
  /*inline skip*/
  /*inline 1*/

  /* for creation of bloom-dependent word list */
  /*bloom return (s.toString().replace(/\{/g,'\'')); bloom*/

  /* 32-bit Pearson hash "z" */
  z=0;
  for(n=0;n<4;n++){
    r=0;
    i=0;for(;i<m;i++){ /* standard compressible loop header */
      r=h[r^s[i]]
    }
    z+=r*(1<<(n<<3));
    s[0]++
  }

  /* "o" is a nonpairs table offset in data buffer "b" */
  /* 274 is nonpairs length */
  u+=274;
  /* now "u" is a bloom table offset */

  /* check hash existance in the bloom table */
  z%=(b.length-u)*8;
  /* b[u+z/8|0]&(1<<(z%8)) string is identic to the one used in nonpairs */
  return (b[u+z/8|0]&(1<<(z%8)))
}