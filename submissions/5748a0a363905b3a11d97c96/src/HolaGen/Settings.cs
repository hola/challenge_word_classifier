using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HolaGen
{
	public static class Settings
	{
		public static string RootFolder = @"..\";
		public static string DataFolder = Path.Combine(RootFolder, @"data");
		public static string DataPath = Path.Combine(DataFolder, "data.txt");
		public static string WordsPath = Path.Combine(Settings.DataFolder, "words.txt");
		public static string JavascriptBootstrapPath = Path.Combine(RootFolder, @"HolaGen\js\bootstrap.js");
		// public static string JavascriptBlobPath = Path.Combine(RootFolder, @"HolaGen\js\index.js");
		public static string JavascriptBlobPath = Path.Combine(RootFolder, @"HolaGen\js\index.min.js");
		public static string JavascriptBlobBloomFilterOnlyPath = Path.Combine(RootFolder, @"HolaGen\js\index-bfonly.min.js");
		public static string JavascriptBlobNoBZ2Path = Path.Combine(RootFolder, @"HolaGen\js\index-nobz2.min.js");
		public static string TestCasesPath = @"C:\Users\guill_000\Documents\Visual Studio 2013\Projects\HolaGen\testcases";
		public static string AllTestCasesPath = @"C:\Users\guill_000\Documents\Visual Studio 2013\Projects\HolaGen\testcases_all";
		//public static string TestCasesPath = Path.Combine(Settings.RootFolder, "testcases");
		public static string TempFolder = Path.Combine(RootFolder, "temp");
		public static string TestResults = Path.Combine(RootFolder, "test_results.csv");
		public static string TestRuns = Path.Combine(RootFolder, "test_runs.csv");
	}
}
