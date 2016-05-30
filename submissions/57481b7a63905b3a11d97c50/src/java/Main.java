import java.util.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.zip.Checksum;

 
public class Main {
	
	
	
     
    static class Attr {
       public int   count=0;
       public int   keyset=0;
       
       public Map<Integer,TreeSet<String>> words=new HashMap<Integer,TreeSet<String>>();
       
       public boolean isUsedAsKey(int keyNo) {
    	 return  (keyset&(1l<<keyNo))!=0;  
       }
       
       public void update(int usedAsKeyNo) {
    	  keyset|=(1<<usedAsKeyNo);
    	  ++count;
       }
   
       
       public String toString() {
    	 return count+" "+Long.toBinaryString(keyset);
       }
    }
    
    static Set<String> shorts=new TreeSet<String>();
    
    public static boolean isGood0(String s) {
    	return Math.random()<=0.5;
    }
    
    static int MaxWordLenth=14; //14
    
    static boolean testKey(char k, int kid) {
 	   Attr a=terms.get(k);
 	   return (a!=null&&a.isUsedAsKey(kid));
    }
   
    public static boolean isGood1(String s) {
      if (s.endsWith("\'")||s.startsWith("\'")) return false;
      String is=Packer.improve(s);
      if (is!=null) {
    	  
    	if (is.length()<=3) 
    		return shorts.contains(is);
    	
    	if (false) {
    	if (is.length()>MaxWordLenth) {
        	double rnd= Math.random();
        	return rnd<0.0005;
        	/*
            switch (is.length()) {
            case 12: return rnd<0.025;
            case 13: return rnd<0.0124;
            case 14: return rnd<0.005;
            case 15: return rnd<0.0025;
            case 16: return rnd<0.00125;
            }
            */
    	}
    	}
    	
        /*if (is.length()<=MaxWordLenth)*/ {
	    	char [] keys=Packer.getKeys(is);
	    	if (keys!=null) {
	     	   Packer.UnPacked ups[]=
	    			   Packer.unpack(keys);
	     	    Attr ats[]=new Attr[ups.length];
	    	    for (int i=0;i<keys.length;i++) {
		    	   char k=keys[i];
		    	   Attr a=terms.get(k);
		    	   ats[i]=a;
		    	   if (a==null||!a.isUsedAsKey(i)) return false;
	    	   }
	    	    /*
	    	   boolean k0=testKey(keys[0],0);
	    	   if (!k0) {
	    		//   if (Math.random()<0.8) 
	    		   return false;
	    	   }*/
	    	   return true;
	    	}
        }
      }
      return false;
    }
    
    static Map<Character,Attr> terms=new TreeMap<Character,Attr>();
    static Set<String> all=new TreeSet<String>();
    static TreeMap<Integer,TreeSet<Character>> bykeys=new TreeMap<Integer,TreeSet<Character>>();
    /*
    static void lookForVoids() {
       char mi=bykeys.firstEntry().getKey();
       char i=0;
       for (char c:bykeys.keySet()) {
    	 if (c!=i+mi) System.out.println((int)c);
    	 i++;  
       }
    }*/

    
    public static TreeMap<String,Boolean> loadTestCase(String ... fns) throws IOException {
    	TreeMap<String,Boolean> res=new TreeMap<String,Boolean>();
    	for (String fn:fns) {
	    	FileReader fr=new FileReader("C:/Users/zeev/Hola/"+fn);
	    	BufferedReader br=new BufferedReader(fr);
	    	while (br.ready()) {
	    		String s=br.readLine();
	    		if (s==null) break;
	    		s=s.replace('{', ' ').replace('\"', ' ').replace('}', ' ').replace(',', ' ').replaceAll("\\s+", "").trim();
	    		if (s.length()==0) continue;
	    		int i=s.indexOf(':');
	    		if (i>0) {
	    		   String a=s.substring(0, i);
	    		   res.put(a, Boolean.parseBoolean(s.substring(i+1)));
	    		}
	    	}
	    	br.close();
    	}
    	return res;
    }
    
    static void runAllTests()  throws IOException {
    	String a[]={
			      "testcase.json",
			      "testcase1.json",
			      "testcase3.json",
			      "testcase4.json",
			      "testcase5.json",     
			      "testcase6.json",  
			      "testcase7.json"    			
    			
    	};
    	for (String s:a) {
           System.out.println(">>>>>>>>>>>>>>>>>> "+s);	
       	   runTest(s);
    	}
    	System.out.println(">>>>>>>>>>>>>>>>>> all tests");
    	runTest(a);
    }
    
    static void runTest(String ...a) throws IOException {
	       int al=0, gd=0, gd0=0, gd1=0, gd11=0, falsePositive=0, falseNegative=0;
		   for (Map.Entry<String, Boolean> en:loadTestCase(a).entrySet()) 
		   {
			   String s=en.getKey();
			   al++;
			   boolean g=isGood1(s), g1=isGood0(s);
			   if (g&&!en.getValue()) falsePositive++;
			   if (!g&&en.getValue()) falseNegative++;
			   if (g==en.getValue()) gd++;
			   if (g1==en.getValue()) gd1++;
			   if (g==all.contains(s)) gd0++;
			   if (g1==all.contains(s)) gd11++; 
			   
		//	   if (g!=en.getValue()) 
		//	      System.out.println(s+" "+g+" "+en.getValue()/*+" "+all.contains(s)+" "+(s.length()>MaxWordLenth)*/);
		       
		   }
		   
		   System.out.println(al+" "+gd+" "+(gd*100./al)+"%"+" "+maxkeys+" "+(gd0*100./al)+"%");
		//   System.out.println(al+" "+gd1+" "+(gd1*100./al)+"%"+" "+maxkeys+" "+(gd11*100./al)+"%");
		   
		   	   
		   System.out.println("====== fp: "+falsePositive+" "+(falsePositive*100./al)+"% fn:"+
				   falseNegative+" "+(falseNegative*100./al+"%")
				   );
    }
    
	 static  int maxl=0, maxkeys=0;

	public static void main(String[] args) throws IOException {
	   try {
		   FileReader fr=new FileReader("C:/Users/zeev/Hola/joint.txt");
		   BufferedReader br=new BufferedReader(fr);
		   while (br.ready()) {
			 String s=br.readLine();
			 if (s==null) break;
			 s=s.trim();
			 if (s.length()==0) continue;
			 all.add(s);
			// String ls=s.toLowerCase();
			 String is=Packer.improve(s);

			 
			 int sl=is.length();
			 if (sl>3&&sl<=MaxWordLenth) {
				char keys [] = Packer.getKeys(is);
				if (keys!=null) {
				  if (keys.length>maxkeys) maxkeys=keys.length;
				  for (int i=0; i<keys.length; i++) {
				   char k=keys[i];
				   Attr a=terms.get(k);
				   if (a==null) terms.put(k, a=new Attr());
				   {TreeSet<String> ws=a.words.get(i);
				   if (ws==null) a.words.put(i, ws=new TreeSet<String>());
				     ws.add(is);
				   }
				   a.update(i);
	  		      }
				}
			 } else 
		     if(sl<=3) {
				shorts.add(is);
			 }
			 if (maxl<sl) {
				 maxl=sl;
				 System.out.println(s);
			 }
	//	     if (s.endsWith("ima")&&s.startsWith("g")||s.endsWith("a")&&s.startsWith("gr")) System.out.println(s);
			// if (check2cons(s)||check2vovels(s)) System.out.println(":"+s);
		   }
	   } catch(IOException t) {
		   System.err.println(t);
	   }
	   

	   
	   System.out.println(terms.size()+" "+maxl);
/*
	   int mmi=0;
	   for (Map.Entry<Character, Attr> x:terms.entrySet()) {
		   Attr v=x.getValue();
		   System.out.println(Integer.toBinaryString(x.getKey())+" "+v.toString()); 
	   }
	   
	   System.out.println(mmi);
	   */
	   /*
   	   for (int i=0; i<_improve.length; ++i) {
   		 System.out.println(_improve[i][0]+" "+improveCnt[i]);
   	   }*/

	   
	   System.out.println("terms count "+terms.size()+" shorts count "+shorts.size());
//	   System.out.println(terms.size()*2+shorts.size()*2+ " "+(terms.size()*2+sl1+(sl2+sl3)*2));
	   System.out.println(terms.size()*2.5);

	   runAllTests();
	

		   // 
  	   for (Map.Entry<Character,Attr> en:terms.entrySet()) {
  		 Attr a=en.getValue();
  		 char k=en.getKey();
  		 
         TreeSet<Character> vals=bykeys.get(a.keyset);
  		 if (vals==null) {
  			vals=new TreeSet<Character>();
  			bykeys.put(a.keyset, vals);
  		 } else {
  			 if (vals.contains(k)) System.err.println("KARAUL "+(int)k);
  		 }
  		 vals.add(k);
  	   }
  	   
  	   System.out.println("============================= "+bykeys.size());
  	   List<Integer> longGroups=new ArrayList<Integer>();
  	   for (Map.Entry<Integer,TreeSet<Character>> en:bykeys.entrySet()) {
  		 int cnt=en.getValue().size();
  		 if (cnt>255) longGroups.add(en.getKey());
  //		 System.out.println((int)en.getKey()+" "+cnt);    
  	   }
  	   System.out.println(longGroups.size()+" long groups");
  	   // write out
       FileOutputStream fos=new FileOutputStream("C:/Users/zeev/Hola/data.bin");
       fos.write(toBytes((char)bykeys.size())); // total number of the groups
       // long groups
       fos.write(longGroups.size());
       for (int gk:longGroups) {
    	  TreeSet<Character> ts=bykeys.get(gk);
    	  if (gk>=Character.MAX_VALUE) System.out.println("BIGG "+Integer.toHexString(gk));
    	  fos.write(to3Bytes(gk)); // group number
    	  if (ts.size()>Character.MAX_VALUE) System.out.println("BIGS "+Integer.toHexString(ts.size()));
    	  fos.write(toBytes((char)ts.size()));
    	   /// write the group content
    	  for (char c:ts) fos.write(toBytes(c));
       }
       // other groups
       int prevKey=0, nUgly=0;
  	   for (Map.Entry<Integer,TreeSet<Character>> en:bykeys.entrySet()) {
 		 
    	 int cnt=en.getValue().size();
    	 if (cnt<=255) {
      		int diff=en.getKey()-prevKey;
      		if (diff>/*Character.MAX_VALUE*/0xffff) { 
      			System.out.print("ugly "+diff);
      			if (diff>0xffffff) System.out.print(" very ugly");
      			System.out.println();
                fos.write(toBytes((char)0));
      			fos.write(to3Bytes(diff));
      			++nUgly;
      		} else
              fos.write(toBytes((char)diff));
    		TreeSet<Character> ts=en.getValue(); 
      	  if (ts.size()>Character.MAX_VALUE) System.out.println("BIGS "+Integer.toHexString(ts.size()));

      	    fos.write(cnt);
      	    for (char c:ts) fos.write(toBytes(c));
      	    prevKey=en.getKey();
    	  }

  	   }
  	   System.out.println("Uglies "+nUgly);
  	   // shorts
	   System.out.println("======================== shorts ==================");
	   int sl1=0, sl2=0, sl3=0;
       for (String so:shorts) {
         switch (so.length()) {
         case 1: sl1++; break;
         case 2: sl2++; break;
         case 3: sl3++;
         }
   // 	 System.out.println(so+" "+Integer.toBinaryString(Packer.packIt(so)));
       }
       
       System.out.println(sl1+" "+sl2+" "+sl3);
  	   fos.write(sl1);
  	   for (String so:shorts) if (so.length()==1) {
  		//   System.out.println(so);
  		   fos.write(so.charAt(0));
  	   }
  	   fos.write(toBytes((char)sl2));
  	   for (String so:shorts) if (so.length()==2) {
  		   fos.write(so.getBytes(StandardCharsets.ISO_8859_1));
  	   }
  	   fos.write(toBytes((char)sl3));	   
  	   for (String so:shorts) if (so.length()==3) {
  		   fos.write(
  				 toBytes(Packer.packIt(so))
  				//so.getBytes(StandardCharsets.ISO_8859_1)
  	       );
  	   }
  	   // shorts 
  	   ///////////////////////////////
       fos.flush();
       fos.close();
       ///////
     //  System.out.println("========================================================");
     //  lookForVoids();
	}

	static byte [] toBytes(char c) {
	   byte rv[]={0,0};
	   rv[0]|=c&0xff;
	   rv[1]|=(c>>8)&0xff;
	   return rv;
	}
	static byte [] to3Bytes(int c) {
	    byte rv[]={0,0,0};
		rv[0]|=c&0xff;
		rv[1]|=(c>>>8)&0xff;
		rv[2]|=(c>>>16)&0xff;
		return rv;
	}
	static byte [] to4Bytes(int c) {
	    byte rv[]={0,0,0,0};
		rv[0]|=c&0xff;
		rv[1]|=(c>>>8)&0xff;
		rv[2]|=(c>>>16)&0xff;
		rv[3]|=(c>>>24)&0xff;
		return rv;
	}

}
