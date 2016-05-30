package filescan;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;

public class FilescanAppl {

	final static int INT_CAP = 2;
	final static int INT_MAX_VAL = 1;

	public static void main(String[] args) {

		
		long arrCounters;
		HashMap<String, Long> dict = new HashMap<String, Long>();
		ArrayList<String> words = new ArrayList<>();
		HashSet<String> wordsselected = new HashSet<>();

		StringBuilder strkey = new StringBuilder(INT_CAP);
		long counter;
		long availWordLength = 0;
		Path fileNameRead = Paths.get("/home/serg/dwn/words.txt");

		Charset charset = Charset.defaultCharset();
		try (BufferedReader reader = Files.newBufferedReader(fileNameRead, charset)) {
			String line = null;
			while ((line = reader.readLine()) != null) {

				if (line.length() <= 2||line.length() >=25) {
					wordsselected.add(line.trim().toLowerCase());

				} else {
					for (int i = 0; i < line.length() - INT_CAP + 1; i++) {
						strkey.delete(0, INT_CAP);
						strkey.insert(0, line.substring(i, i + INT_CAP).toLowerCase());

						arrCounters = dict.getOrDefault(strkey.toString() , (long) 0);
						counter = pow2(i);
						availWordLength = pow2(line.length()+24); 
						arrCounters = arrCounters|counter;
						arrCounters = arrCounters|availWordLength;
						dict.put(strkey.toString(), arrCounters);
					}
					words.add(line.toLowerCase());	
				}
			}
			
			
		} catch (IOException x) {
			System.err.format("IOException: %s%n", x);
		}
		String sep = System.getProperty("line.separator");
		Path fileName = Paths.get("outbuffer" + INT_CAP + ".json");
		try (BufferedWriter writer = Files.newBufferedWriter(fileName, charset)) {
//			writer.write("Max Length word = " + maxLengthWord + sep);
			writer.write("{ \"tokens\":{");
			for (Map.Entry<String, Long> entry : dict.entrySet()) {

				writer.write("\""+entry.getKey() + "\":\"" + entry.getValue()+ "\"," );
			}
			writer.write("\"@\":\"\"}, \"words\":{");	
			for (String word : wordsselected) {
				writer.write("\""+word + "\":\""+word.length()+"\",");

			}
			writer.write("\"@\":\"\"}}");	

		} catch (IOException x) {
			System.err.format("IOException: %s%n", x);
		}

	}

	private static long pow2( int po) {
		long  result = 1;
		if(po == 0)
			return result;
		if(po<0)
			return 0;
		for (int i = 1; i <= po; i++) {
			
		
			result *=2 ; 
			
		}
		return result;
	
	}

}