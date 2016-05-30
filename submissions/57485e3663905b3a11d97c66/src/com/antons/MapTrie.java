package com.antons;

import java.io.Serializable;
import java.util.HashMap;

public class MapTrie implements Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = 3752497115095911984L;
	int SIGMA = 26;
	public static long countNodes = 0;

	public class MyTrieNode implements Serializable{		
		/**
		 * 
		 */
		private static final long serialVersionUID = 7609089772488983483L;
		public HashMap map;
		
		MyTrieNode(){
			map = new HashMap<Character, MyTrieNode>();
			countNodes++;
		}
	}
	
	MyTrieNode root;
	
	MapTrie(){
		root = new MyTrieNode();
	}
	
	public void addWord(String s){
		if (s.length() > 5){
			s = s.substring(0, 4);
		}
		addWordRecursive(s,root);		
	}
	
	public void printNodeCount(){
		System.out.println("Node count is " + countNodes);
	}
	
	private void addWordRecursive(String s, MyTrieNode currNode){
		if (s.length() == 0 && currNode.map.containsKey('$')){
			return;
		}
		if (s.length() == 0 && !currNode.map.containsKey('$')){
			currNode.map.put('$', new MyTrieNode());
			return;
		}
		if (!currNode.map.containsKey(s.charAt(0))){			
			currNode.map.put(s.charAt(0), new MyTrieNode());
		}
		addWordRecursive(s.substring(1),(MyTrieNode)currNode.map.get(s.charAt(0)));
		
	}
	
}
