package com.antons;

import java.io.FileInputStream;
import java.io.ObjectInputStream;
import java.nio.Buffer;
import java.util.Random;


public class MySolution {
	public static MyBufferData bd = null;
	
	public static void main(String[] args){
		System.out.println("start test");
			
		init(null);
		
		System.out.println(test("abyss"));
	}

	public static void init(Buffer data){
		System.out.println("init");
		bd = (MyBufferData)deserializeObject("tmp\\bufferData.ser");
	}
	
	public static Boolean test(String word){
		return test1(word);
	}
	
	private static Boolean test1(String word){
		Random r = new Random();
		return r.nextBoolean();		
	}
	
	private static Boolean test2(String word){
		return (word.length()>20) ? false : true;
	}
	
	private static Boolean test3(String word){
		Boolean prefixTest = true;		
		
		Boolean suffixTest = true;
		
		Boolean filterTest = true;
		
		
		
		return prefixTest & suffixTest & filterTest;
	}

	private static Object deserializeObject(String fileName){
		Object o = null;
		try
		{
			FileInputStream fileIn =  new FileInputStream(fileName);
			ObjectInputStream in = new ObjectInputStream(fileIn);

			o = in.readObject();
			in.close();
			fileIn.close();
			System.out.println("deserialized data from " + fileName);
		}catch(Exception e)
		{
			e.printStackTrace();
		}
		return o;
	}
}
