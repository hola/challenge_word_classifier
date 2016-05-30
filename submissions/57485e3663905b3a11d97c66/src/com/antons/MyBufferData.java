package com.antons;

public class MyBufferData {
	static public MyTrie prefixTrie = null;
	static public String[] suffixArray = null;
	
	MyBufferData(MyTrie t, String[] a){
		prefixTrie = t;
		suffixArray = a;
	}
}
