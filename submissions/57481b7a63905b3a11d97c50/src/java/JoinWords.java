import java.io.BufferedReader;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.util.Collection;
import java.util.TreeSet;

public class JoinWords {
	
	
	public static <T> void  saveToFile(Collection<T> c, String fn) throws IOException {
		FileWriter fw=new FileWriter("C:/Users/zeev/Hola/" + fn);
		for (T t:c) {
			fw.write(t.toString()+'\n');
		}
		fw.flush();
		fw.close();
	}
	
	public static TreeSet<String> loadSet(String fn) throws IOException {
		return loadSet(fn,12,0);
	}
	
	public static TreeSet<String> loadSet(String fn, int maxsz, int mask) throws IOException {
		TreeSet<String> res=new TreeSet<String>();
		FileReader fr = new FileReader("C:/Users/zeev/Hola/" + fn);
		BufferedReader br = new BufferedReader(fr);
		while (br.ready()) {
			String s = br.readLine();
			if (s == null)
				break;
			s = s.trim().toLowerCase();
			if (s.length() == 0||s.charAt(0)=='#'||s.length()>maxsz)
				continue;
			String is=Packer.improve(s);
			if (is.length()<=maxsz) res.add(s);
		}
		return res;
	}

	public static void main(String[] args) throws IOException {
		TreeSet<String> 
		       s1=loadSet("wiki-100k.txt"),
		        s11=loadSet("20k.txt",14,0),
		// s1=loadSet("20k.txt"),
				s2=loadSet("words.txt"); //11
		s1.addAll(s11);
        s1.retainAll(s2);
    
        ///////////////////
        int i=0;
        for (String s:s2) {
        	/*
			 s=s.trim();
			 if (s.length()==0) continue;
			 */
			 String is=Packer.improve(s);
	  	     if (is.length()<=9) s1.add(s);
	  	     else
	  	     if (is.length()==10&&(i++&0x2)!=0) s1.add(s);
           
        }
        ///////////////////
        saveToFile(s1, "joint.txt");
	}

}
