package com.antons;

import java.io.BufferedReader;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.ObjectOutputStream;
import java.util.HashMap;
import java.util.HashSet;


public class CompressDictionary{

	public static void main(String[] args){
		System.out.println("start");
		int ARR_LEN = 65;

		Long[] hist = new Long[ARR_LEN];
		for (int i=0;i<ARR_LEN;i++){
			hist[i] = new Long(0);
		}


		MyTrie trie = new MyTrie();		

		try{
			BufferedReader br = new BufferedReader(new FileReader("dict.txt"));
			String tmp_line = br.readLine();

			do{
				tmp_line = tmp_line.toLowerCase();
				
				trie.addWord(tmp_line);
				hist[tmp_line.length()]++;

				tmp_line = br.readLine();				
			}
			while(tmp_line != null);


		}
		catch (Exception e){
			System.out.println("Exception!!!!!!!!!!!!!!!!!");
			System.out.println(e.getLocalizedMessage());
		}

		trie.printNodeCount();

		try
		{
			FileOutputStream fileOut =  new FileOutputStream("tmp\\trie.txt");
			//ObjectOutputStream out = new ObjectOutputStream(fileOut);
			//out.writeObject(trie);
			trie.printTrie(fileOut);
			//out.close();
			fileOut.close();
			System.out.println("Serialized data is saved in trie.txt");
		}catch(IOException i)
		{
			i.printStackTrace();
		}

		for (int i=0;i<ARR_LEN;i++){
			System.out.print(i + "\t|");
		}
		System.out.println("");
		for (int i=0;i<ARR_LEN;i++){
			System.out.print(hist[i] + "\t|");
		}
		System.out.println("");

		int count = 0;
		for (int i=0;i<ARR_LEN;i++){
			count += hist[i];
		}
		System.out.println(count);

	}

	public static void serializeObject(String fileName, Object obj){
		try
		{
			FileOutputStream fileOut =  new FileOutputStream(fileName);
			ObjectOutputStream out = new ObjectOutputStream(fileOut);
			out.writeObject(obj);			
			out.close();
			fileOut.close();
			System.out.println("Serialized data is saved in" + fileName);
		}catch(IOException i)
		{
			i.printStackTrace();
		}
	}

}

