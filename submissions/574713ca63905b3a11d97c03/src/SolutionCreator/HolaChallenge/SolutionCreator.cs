using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace HolaChallenge
{
	public class SolutionCreator
	{
		private readonly string dir;
		private readonly SubstCalc substCalc;

		public SolutionCreator(string dir, SubstCalc substCalc)
		{
			this.dir = dir;
			this.substCalc = substCalc;
		}

		public BloomFilter PrefixFilter;
		public HashSet<string> NotWordsC2strings;

		public void WriteData(BloomFilter mainFilter)
		{
			var substCommandStrings = new List<string>();
			foreach (var substCommand in substCalc.Commands)
			{
				var sb = new StringBuilder();
				sb.Append(substCommand.IsPrefixNotSuffix ? "p" : "s");
				foreach (var kvp in substCommand.ReplaceMap)
					sb.Append($"{kvp.Key}-{kvp.Value};");
				substCommandStrings.Add(sb.ToString());
			}

			var substBytes = Encoding.ASCII.GetBytes(string.Join("*", substCommandStrings));
			var notC2Bytes = Encoding.ASCII.GetBytes(string.Join("", NotWordsC2strings));
			var mainBloomBytes = mainFilter.Body;
			var prefixBloomBytes = PrefixFilter.Body;

			var notC2Start = substBytes.Length;
			var mainBloomStart = notC2Start + notC2Bytes.Length;
			var prefixBloomStart = mainBloomStart + mainBloomBytes.Length;
			var jsCodeStart = prefixBloomStart + prefixBloomBytes.Length;

			var dataBytes = substBytes
				.Concat(notC2Bytes)
				.Concat(mainBloomBytes)
				.Concat(prefixBloomBytes)
				.ToArray();

			File.WriteAllBytes(@"D:\Develop\holachallenge\js\data", dataBytes);

			var solutionSource = File.ReadAllText(@"D:\Develop\holachallenge\js\solution.source.js");
			var solution = solutionSource
				.Replace("%NOT_C2_START%", notC2Start.ToString())
				.Replace("%MAIN_BLOOM_START%", mainBloomStart.ToString())
				.Replace("%PREFIX_BLOOM_START%", prefixBloomStart.ToString())
				.Replace("%JS_CODE_START%", jsCodeStart.ToString())
				.Replace("getBit", "a")
				.Replace("hashString", "b")
				.Replace("bloomContains", "c")
				.Replace("getMaxInRow", "d")
				.Replace("substCommands", "e")
				.Replace("notC2", "f")
				.Replace("prefixbloom", "g")
				.Replace("mainbloom", "h")
				.Replace("exportInit", "k")
				.Replace("exportTest", "l")
				;
			File.WriteAllText(@"D:\Develop\holachallenge\js\solution.middle.js", solution);

			var startPointSource = File.ReadAllText(@"D:\Develop\holachallenge\js\solution.startpoint.js");
			var startPoint = startPointSource
				.Replace("%JS_CODE_START%", jsCodeStart.ToString())
				;
			File.WriteAllText(@"D:\Develop\holachallenge\js\solution.js", startPoint);

			Console.WriteLine("Solution saved");
		}
	}
}
