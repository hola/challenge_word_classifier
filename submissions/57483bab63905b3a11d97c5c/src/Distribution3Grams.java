

import java.io.*;
import java.util.HashSet;
import java.util.Set;

public class Distribution3Grams {
	
	public static int [] distribution (String filename, int max_len) throws Exception {
		int [] distribution = new int [26*26*26];
		try(BufferedReader reader = new BufferedReader(new InputStreamReader(new FileInputStream(filename)))) {
			Set<Integer> word_ngrams = new HashSet<> ();
			while (true) {
				String line = reader.readLine();
				if (line == null) {
					break;
				}
				String [] ps = line.split(" ");
				int weight = Integer.valueOf(ps[0]);
				String word = ps[1];
				if (word.length() > max_len) {
					continue;
				}
				for (int i = 0; i < word.length() - 2; i++) {
					String sub = word.substring(i, i + 3);
					if (sub.indexOf('\'') >= 0) {
						continue;
					}
					int code = ((sub.charAt(0) - 'a')*26 + (sub.charAt(1) - 'a'))*26 + (sub.charAt(2) - 'a');
					word_ngrams.add(code);
				}
				for (int code : word_ngrams) {
					distribution[code] += weight;
				}
				word_ngrams.clear();
			}
		}
		return distribution;
	}
	
	public static void main(String [] args) throws Exception {
		int max_len = Integer.valueOf(args[0]);
		int [] dat1 = distribution(args[1], max_len);
		int [] dat0 = distribution(args[2], max_len);
		for (int code = 0; code < dat1.length; code++) {
			System.out.println(String.format("%d %d %d", code, dat1[code], dat0[code]));
		}
	}

}
