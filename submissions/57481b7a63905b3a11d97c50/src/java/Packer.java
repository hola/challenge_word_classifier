import java.util.ArrayList;
import java.util.List;

public class Packer {
   static String 
      _0[]={"'s","ed", "ing", "tion", "ll"}, //  [ly]
      _1[]={"ll","ch", "ea", "ph", "th"}
   ;
 
    
   public static String improve(String s) {
	 return improve(s, false);
   }
   
   public static String improveShort(String s) {
	 return improve(s, true);
   }
   
   static int crc16(final byte[] buffer) {
	 return crc16(buffer, 0xFFFF);
   }
   
   static int crc16(final byte[] buffer, int crc) {

	    for (int j = 0; j < buffer.length ; j++) {
	        crc = ((crc  >>> 8) | (crc  << 8) )& 0xffff;
	        crc ^= (buffer[j] & 0xff);//byte to int, trunc sign
	        crc ^= ((crc & 0xff) >> 4);
	        crc ^= (crc << 12) & 0xffff;
	        crc ^= ((crc & 0xFF) << 5) & 0xffff;
	    }
	    crc &= 0xffff;
	    return crc;

	}
   
   public static Boolean anyUC(String s) {
	  boolean uc=false;
	  if (s!=null) {
		  for (int i=0;i<s.length();i++) {
		    char c=s.charAt(i);
		    if ((c>='A')&&(c<='Z')) uc=true; else {
			    boolean otherCorrect=((c>='a')&&(c<='z'))||(c=='\'');
			    if (!otherCorrect) {
			    	return null;
			    }
		    }
		  }
		  return uc;
	  }
	  return null;
   } 
    
   public static String improve(String s, boolean fShort) {
	  String ls=s.toLowerCase();
	  
	  int l0=_0.length, l1=_1.length;
	  if (fShort) {  --l0; --l1;  }
	  
	  for (int i=0; i<l0; i++) {
		 String k=_0[i];
		 if (ls.endsWith(k)) {
		   char c=(char)('0'+i);
		   s=s.substring(0,s.length()-k.length())+c;
		   break;
		 } 
	  }
	  
	  for (int i=0; i<l1; i++) {
		 String m=_1[i], n=m.toUpperCase(), r=Character.toString((char) ('5'+i));
		 s=s.replace(m,r).replace(n,r);  
	  }
	  
	  if (s.startsWith("ea")) s='\''+s.substring(2);
	  if (s.endsWith("ly")) s=s.substring(0,s.length()-2)+'\'';
	 
      return s;
   }
   
   public static byte [] c2b(char x[]) {
	  byte res[]=new byte[x.length];
	  for (int i=0; i<x.length; i++) res[i]=(byte)x[i];
	  return res;
   }
   
	static byte [] toBytes(char c) {
		   byte rv[]={0,0};
		   rv[0]|=c&0xff;
		   rv[1]|=(c>>8)&0xff;
		   return rv;
		}
	
	  static char ste(String is, int index) {
		  char sum3= (packIt(is.charAt(index)));
		  sum3|=CRC8.crc8((byte)sum3);
		  return sum3;
	  } 
	  
	
   public static char [] getKeys(String is) {
	  char isl;
	  if (is!=null&&(isl=(char) is.length())>3&&(isl<=Main.MaxWordLenth)) {
		  int islc=isl-3;
		  List<Character> res=new ArrayList<Character>();
		  
		  int nk=0;
		 
		  char o[]=openPack(is); 
		  byte bytes[]=c2b(o);
		 /* 
		  char sum=ste(is,0), sum2=(char)(crc16(bytes)&0x7ff);
	
		  res.add((char)sum2);
		 
		//  res.add((char)((CRC8.crc8(bytes)<<7)|o[isl-1]|(o[isl-2]&3)));
		  res.add((char)((CRC8.crc8(bytes)<<7)|islc));
/*
		  res.add((char)islc);
*/
		  
//		  res.add((char)(crc16(bytes)&0x7fff));
//		  res.add((char)((islc<<10)|crc16(bytes)&0x3ff));
		  a:for (int i=0;i<isl;i++) {
			 char c1=is.charAt(i); 
			 for (int j=i+1; j<isl; j++, nk++) {
				 if (nk>23) break a;
				 char c2=is.charAt(j);
				 int k=(j<isl-1)?j+1:0;
				 
				 char p=packIt(c1,c2,is.charAt(k));
				// if (p==null) return null;
			
				 if (nk==0)
				   res.add(p);
				 else
				   res.add((char)(p&0x3fff));

			 }
		  }
		  
		  char r[]=new char [res.size()];
		  for (int i=0; i<r.length; i++) r[i]=res.get(i);
		  return r;
		  
	  }
	  return null; 
   }
   
   

   
   public static class UnPacked {
	  public String   s="";  
	  public boolean  fUpperCase;
   };
   
   public static UnPacked unpack(char pk, int keyNo) {
	   UnPacked r=new UnPacked();
	   r.fUpperCase=(pk&0x8000)!=0;
	   pk&=0x7fff;
	   for (int i=0; i<3; i++ ) {
		  final char c=(char)(pk&0x1f);
		  if (c<26) r.s=(char)(c+'a')+r.s; else 
		  if (c==26) r.s='\''+r.s; else {
			  if (keyNo==0)
			  switch(c) {
				case 27: r.s="'s"+r.s;   break;
				case 28: r.s="ed"+r.s;   break;
				case 29: r.s="ing+r.s";  break;
				case 30: r.s="tion+r.s"; break;
				case 31: r.s="ly"+r.s;  	  
		      } else
		      switch(c) {
				case 27: r.s="ll"+r.s;   break;
				case 28: r.s="ch"+r.s;   break;
				case 29: r.s="ea"+r.s;   break;
				case 30: r.s="ph"+r.s;   break;
				case 31: r.s="th"+r.s;   			      
		      }
		  }
		  pk>>=5;
	   }
	   return r;
   }
   

   public static UnPacked [] unpack(char keys[]) {
	   if (keys!=null&&keys.length>0) {
		   UnPacked res[]=new UnPacked[keys.length];
		   for (int i=0;i<keys.length;i++) {
			   res[i]=unpack(keys[i],i);
		   }
		   return res;
	   }
	   return null;
   }
   
   public static char [] openPack(String s) {
	  char res[]=new char[s.length()];  
	  for (int i=0; i< s.length(); i++) try {
		res[i]=packIt(s.charAt(i));  
	  } catch (Throwable t) {
		  System.err.println(t);
	  }
	  return res;
   }
   
   public static Character packIt(char c) {
		if (c>='a'&&c<='z')   c-='a'; /*0..25*/ else
		if (c>='A'&&c<='Z') { c-='A'; /*0..25*/ /* res|=0x8000;*/ } else
		switch (c) {
		case '\'': c=26;  break;
		// ch:3
		case '0': /* 's */    c=27; break;
		case '1': /* ed */    c=28;  break;
		case '2': /* ing  */  c=29;  break;
		case '3': /* tion */  c=30;  break;
		case '4': /* ly */    c=31;  break;
		// ch:1,2
		case '5': /* ll */    c=27;  break;
		case '6': /* ch */    c=28;  break;
		case '7': /* ea  */   c=29;  break;
		case '8': /* ph */    c=30;   break;
		case '9': /* th */    c=31;   			
		break;
		default: 
		     return null;
		  
		}
	    return c;	   
   }
   
   public static Character packIt(char c1, char c2) {
	 Character ch1, ch2;
	 if ((ch1=packIt(c1))==null||(ch2=packIt(c2))==null) return null;
	 c1=ch1; c2=ch2;
	 return (char)((c1<<5)|c2); 
   }
   
   public static Character packIt(char c1, char c2, char c3) {
	 Character ch1, ch2, ch3;
	 if ((ch1=packIt(c1))==null||(ch2=packIt(c2))==null||(ch3=packIt(c3))==null) return null;
	 c1=ch1; c2=ch2; c3=ch3;
	 return (char)((c1<<10)|(c2<<5)|c3); 
   }
   
   public static Character packIt(String s) {
		 int el=Math.max(s.length()-3, 0);
		 char res=0, shift=0;
		 for (int i=s.length()-1; i>=el; i--, shift++) {
			char c=s.charAt(i);
            Character ch=packIt(c);
            if (ch==null) return null;
            c=ch;
            int v=c<<(5*shift);
      //      System.out.println(Integer.toBinaryString(v));
			res|=v;
        //    System.out.println("!"+Integer.toBinaryString(res));
		 }
		 return res;
   }
}