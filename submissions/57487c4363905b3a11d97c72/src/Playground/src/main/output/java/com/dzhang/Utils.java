package com.dzhang;

import com.dzhang.filter.BloomFilter;

import java.io.*;
import java.util.*;
import java.util.zip.Deflater;
import java.util.zip.GZIPOutputStream;

/**
 * Created by dzhang on 5/17/2016.
 */
public class Utils {

    static List<String> loadDictionary() throws IOException {
        List<String> words = new ArrayList<>(640_000);
//        Scanner scanner = new Scanner(new File("src/main/resources/words.txt"));
        Scanner scanner = new Scanner(new File("src/main/resources/words_copy.txt"));
        while (scanner.hasNextLine()) {
            words.add(scanner.nextLine());
        }
        scanner.close();
        return words;
    }

    static List<Map<String, Boolean>> loadTestData() throws IOException {
        List<Map<String, Boolean>> testData = new ArrayList<>();
//        for (File file : new File("src/main/resources/testcase/").listFiles()) {
        for (File file : new File("src/main/resources/testcase_min/").listFiles()) {
            BufferedReader br = new BufferedReader(new FileReader(file));
            String line = br.readLine();
            while (line != null) {
                Map<String, Boolean> map = new HashMap<>();
                String[] tokens = line.split("\\|");
                for (int i = 0; i < tokens.length; i += 2) {
                    map.put(tokens[i], Boolean.valueOf(tokens[i + 1]));
                }
                testData.add(map);
                line = br.readLine();
            }
            br.close();
        }
        return testData;
    }

    public static long export(String suffix, BloomFilter[] list) throws IOException {
        File file = new File("src/main/output/export" + suffix + ".gz");
        if (file.exists()) {
            file.delete();
        }
        file.createNewFile();
        GZIPOutputStream zip =  new GZIPOutputStream(new FileOutputStream(file)){{def.setLevel(Deflater.BEST_COMPRESSION);}};

        int coun = 0;
        for (BloomFilter filter : list) {
            for (byte b : filter.export()) {
                zip.write((char) b);
                coun ++;
            }
        }
        zip.close();
        long length = file.length();
        file.delete();
        return length;
    }
}
