package com.company;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

public class Main {

    public static int NUM = 4;
    public static int TIC = 16;
    public static String fileIN = "D:\\Projects\\node.js\\words.txt";
    public static String fileOUT = "D:\\Projects\\node.js\\data";

    public static void main(String[] args) {
        String FILE_NAME = fileIN;
        Map<String,Integer> myHashSet = new HashMap<String,Integer>();
        Set<String> result = new HashSet<String>();

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(
                        new FileInputStream(FILE_NAME), StandardCharsets.UTF_8))){
            String line;
            while ((line = reader.readLine()) != null) {
                //System.out.println(line);
                line = line.toLowerCase();
//                line = line.replace("'s","");

                dLine(line.toLowerCase(),NUM, myHashSet);
            }
        } catch (IOException e) {
            // log error
        }


        writeHash(myHashSet, result);
        ReadBufferFile(result);

        checkword("london", result);
            System.out.println(result);
            System.out.println(result.size());
        }
    public static void dLine(String str, int length, Map set){

//        if (str.length() <= length) {
//            str = str + "---------";
//            str = str.substring(0,NUM);
//            Putword(str,set);

//            return;}
//      elif {      System.out.println(str);
        for (int i = 0;i<=(str.length()-length);i++){
            char[] buf = new char[length];
               str.getChars(i, i+length, buf, 0);
                String word = new String(buf);
                Putword(word, set);
            };
            };

    public static void Putword(String word, Map set)
    {
        Integer count = (Integer) set.get(word);
        if (count == null) count =0;
        set.put(word,count+1);
    }

    public static void ReadBufferFile(Set result){
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(
                        new FileInputStream(fileOUT), StandardCharsets.UTF_8))){
            readbuffer(reader.readLine(),result);

        } catch (IOException e) {
        }

    }

    public static void readbuffer(String s, Set result)
    {
        int i = 0;
        while (i < s.length())
        {
            String word = s.substring(i,i+NUM);
            result.add(word);
            i += NUM;
      }

    }

    public static void writeHash(Map set, Set result){

        try {

            File file = new File(fileOUT);

            // if file doesnt exists, then create it
            if (!file.exists()) {
                file.createNewFile();
            }

            FileWriter fw = new FileWriter(file.getAbsoluteFile());
            BufferedWriter bw = new BufferedWriter(fw);


            for (Object s : set.keySet()) {
                if ((int)set.get(s)>TIC || ((String) s ).length()< NUM){
//                result.add((String) s);
                bw.write((String) s);}
            } //


            bw.close();

            System.out.println("Done");

        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static void checkword (String word, Set set)
    {
        Set<String> result = new HashSet<String>();

        dLine_(word, NUM, result);
        Integer count = 0;
        Integer count_full = 0;


            for (Object f : result) {
                String strf =(String)f;

                if (NUM > strf.length())
                for (Object s : set) {
                    String strs = (String) s;
                    if (strs.contains(strf)) count++;
                }
                else if (set.contains(strf)) count ++;

        }
        System.out.println(result.size() + "/" + count  );
        }

    public static void dLine_(String str, int length, Set set){

        if (str.length() <= length) {
            set.add(str);
            return;}
        for (int i = 0;i<=(str.length()-length);i++){
            char[] buf = new char[length];
            str.getChars(i, i+length, buf, 0);
            String word = new String(buf);
            set.add(word);

        };
    };

    }





