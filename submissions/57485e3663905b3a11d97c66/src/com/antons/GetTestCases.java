package com.antons;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URL;
import java.net.URLConnection;
import java.nio.charset.Charset;

import org.json.JSONException;
import org.json.JSONObject;

public class GetTestCases {
	public static void main(String[] args) throws IOException, JSONException{
		System.out.println("Hello");
		JSONObject json = readJsonFromUrl("https://hola.org/challenges/word_classifier/testcase/1");
		
		for (int i = 0; i < 10000; i++) {
			String url_tmp = "https://hola.org/challenges/word_classifier/testcase/" + i;
			JSONObject jsn = readJsonFromUrl(url_tmp);
			writeJSON(jsn, "testcases//test"+i+".txt");
		}
		
	}
	
	public static void writeJSON(JSONObject jsn, String filename){
		try{
			BufferedWriter b = new BufferedWriter(new FileWriter(filename));
			char[] cbuf = jsn.toString().toCharArray();
			b.write(cbuf);
			b.close();
			}
			catch(Exception e){			
			}
	}
	
	public static JSONObject readJsonFromUrl(String url) throws IOException, JSONException {
	    InputStream is = new URL(url).openStream();
	    try {
	      BufferedReader rd = new BufferedReader(new InputStreamReader(is, Charset.forName("UTF-8")));
	      String jsonText = readAll(rd);
	      JSONObject json = new JSONObject(jsonText);
	      return json;
	    } finally {
	      is.close();
	    }
	  }
	
	 private static String readAll(Reader rd) throws IOException {
		    StringBuilder sb = new StringBuilder();
		    int cp;
		    while ((cp = rd.read()) != -1) {
		      sb.append((char) cp);
		    }
		    return sb.toString();
		  }
}
