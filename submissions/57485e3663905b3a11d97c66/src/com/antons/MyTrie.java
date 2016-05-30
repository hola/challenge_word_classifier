package com.antons;

import java.io.BufferedOutputStream;
import java.io.FileOutputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.HashSet;

public class MyTrie implements Serializable{
	private static final long serialVersionUID = 3752497115095911984L;
	public static int SIGMA = 27; // [a-z']
	public static int NUM_BYTES = 3;
	public static int LEN_CUTOFF = 4;	
	public static long countNodes = 0;
	public static long countWords = 0;
	HashSet<String> totalWords;


	private MyTrieNode root = new MyTrieNode();

	public class MyTrieNode implements Serializable{		
		private static final long serialVersionUID = 7609089772488983483L;
		public MyTrieNode[] arr;
		public Byte Bits = 0;
		public HashSet<String> words;

		MyTrieNode(){
			arr = new MyTrieNode[SIGMA];
			words = new HashSet<String>();
			countNodes++;
		}



		public void setLeaf(){			
			Bits = setBit(Bits, 0, true);
		}

		public Boolean isLeaf(){					
			return getBit(Bits,0);
		}
	}

	public void addWord(String s){
		String substring = new String(s);

		if (s.length() > LEN_CUTOFF){
			substring = substring.substring(0, LEN_CUTOFF);
		}

		addWordRecursive(substring, s, root);		
	}

	private void addWordRecursive(String subString, String origString, MyTrieNode currNode){		
		if (subString.length() == 0){
			currNode.words.add(origString);

			if (!currNode.isLeaf()){
				currNode.setLeaf();
			}
			return;
		}

		if (currNode.arr[charToIndex(subString.charAt(0))] == null){
			currNode.arr[charToIndex(subString.charAt(0))] = new MyTrieNode();			
		}
		addWordRecursive(subString.substring(1), origString,currNode.arr[charToIndex(subString.charAt(0))]);		
	}



	private int charToIndex(char c){
		if (c == '\''){
			return SIGMA-1;
		}
		return (byte)Character.toLowerCase(c) - (byte)'a';		
	}

	private char indexToChar(int index){
		if (index == SIGMA-1){
			return '\'';
		}
		return (char) (index + (byte)'a');
	}

	private byte[] indexToByte(int index){
		if (index == SIGMA-1){
			return new byte[]{Byte.parseByte("39")};
		}
		return new byte[]{(byte) (index + (byte)'a')};
	}

	public Byte setBit(Byte b, int index, Boolean value){
		byte fireBit = 1;
		if (value){
			b = (byte) (b | (fireBit << index%8));
		}
		else{
			b = (byte) (b & (~(fireBit << index%8)));
		}
		return b;
	}


	public Boolean getBit(Byte b, int index){
		byte fireBit = 1;
		return ((b & (fireBit << index%8)) > 0) ? true : false;
	}


	//-----------------------------------------------------//

	public void printTrie(FileOutputStream o){
		totalWords = new HashSet<String>();
		printTrieRecursive(root, o);
		System.out.println(countWords);



		/*
		try{
			ObjectOutputStream b = new ObjectOutputStream(o);
			b.writeObject(totalWords.toString());
		}
		catch(Exception e){
			System.out.println("Exception");
		}*/

	}

	public void printNodeCount(){
		System.out.println("Node count is " + countNodes);
	}

	private void printTrieRecursive(MyTrieNode currNode, FileOutputStream o){
		try{
			for (int i=0; i<SIGMA; i++){
				if (currNode.arr[i] != null){				
					o.write(indexToByte(i));
					printTrieRecursive(currNode.arr[i], o);
				}
			}			
			byte[] buf = new byte[1];
			//buf[0] = currNode.Bits;

			int maxLen = 0;
			for(String word : currNode.words){


				if (word.length() > maxLen){
					maxLen = word.length();
				}				
			}
			buf[0] = (byte)maxLen;
			buf[0] = (byte) (buf[0]<<1);
			buf[0] = (byte) ((currNode.isLeaf()) ? buf[0] | 1 : buf[0]);

			countWords += currNode.words.size();
			totalWords.addAll(currNode.words);
			//System.out.println(currNode.words);


			o.write((byte)'{');
			o.write(buf);

			//byte[] bufHash = new byte[1];
			
			//bufHash[0]=calcHash(currNode.words);
			//o.write(bufHash);
			//o.write(new byte[]{'|'});
		}
		catch (Exception e){
			System.out.println("Exception");
		}
	}

	private byte calcHash(HashSet<String> words){
		byte hash = 0;

		for (String w : words){

			int hashInt =  myHashCode(w);
			if (hashInt < 0) hashInt = -hashInt;
			
			int index = hashInt % 7;			
			hash = setBit(hash,index,true);
		}

		return hash;
	}

	private int myHashCode(String s){
		int h = 0;
		for (int i = 0; i < s.length(); i++) {
			h = 31 * h + s.charAt(i);
		}
		return h;
	}


}
