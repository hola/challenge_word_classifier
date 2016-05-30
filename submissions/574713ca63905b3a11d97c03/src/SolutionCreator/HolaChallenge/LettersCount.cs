using System;
using System.Collections.Generic;
using System.Linq;

namespace HolaChallenge
{
	public class LettersCount
	{
		private readonly JsonSerializerMaster jsonSerializer;
		private readonly Dictionary<char, int> thresholds;

		public LettersCount(JsonSerializerMaster jsonSerializer)
		{
			this.jsonSerializer = jsonSerializer;

			var stats = new Dictionary<char, int[]>
			{
				{ '\'', new int[] { 234279,226,2,0,0,0,0,0,0,0,0,0,0 } },
				{ 'a', new int[] { 94043,96525,36614,6568,717,39,1,0,0,0,0,0,0 } },
				{ 'b', new int[] { 201739,30462,2187,113,6,0,0,0,0,0,0,0,0 } },
				{ 'c', new int[] { 158387,64089,11043,917,63,7,1,0,0,0,0,0,0 } },
				{ 'd', new int[] { 178320,50227,5613,338,9,0,0,0,0,0,0,0,0 } },
				{ 'e', new int[] { 91271,95304,39346,7818,727,41,0,0,0,0,0,0,0 } },
				{ 'f', new int[] { 216231,16081,2109,77,9,0,0,0,0,0,0,0,0 } },
				{ 'g', new int[] { 196931,34803,2657,107,9,0,0,0,0,0,0,0,0 } },
				{ 'h', new int[] { 179544,49839,4991,131,2,0,0,0,0,0,0,0,0 } },
				{ 'i', new int[] { 105872,95363,28753,4196,317,6,0,0,0,0,0,0,0 } },
				{ 'j', new int[] { 229921,4513,72,0,1,0,0,0,0,0,0,0,0 } },
				{ 'k', new int[] { 216418,16803,1227,52,7,0,0,0,0,0,0,0,0 } },
				{ 'l', new int[] { 146909,71332,14708,1425,131,1,1,0,0,0,0,0,0 } },
				{ 'm', new int[] { 176480,51811,5883,320,13,0,0,0,0,0,0,0,0 } },
				{ 'n', new int[] { 134824,81728,16514,1391,49,1,0,0,0,0,0,0,0 } },
				{ 'o', new int[] { 123124,82043,25070,3869,386,15,0,0,0,0,0,0,0 } },
				{ 'p', new int[] { 180038,47779,6379,306,5,0,0,0,0,0,0,0,0 } },
				{ 'q', new int[] { 230828,3602,77,0,0,0,0,0,0,0,0,0,0 } },
				{ 'r', new int[] { 119267,95181,18759,1265,35,0,0,0,0,0,0,0,0 } },
				{ 's', new int[] { 147439,69917,15148,1861,127,14,1,0,0,0,0,0,0 } },
				{ 't', new int[] { 133724,80173,18907,1629,74,0,0,0,0,0,0,0,0 } },
				{ 'u', new int[] { 175077,53487,5587,332,24,0,0,0,0,0,0,0,0 } },
				{ 'v', new int[] { 217794,16096,607,10,0,0,0,0,0,0,0,0,0 } },
				{ 'w', new int[] { 223053,11001,442,11,0,0,0,0,0,0,0,0,0 } },
				{ 'x', new int[] { 227921,6534,49,3,0,0,0,0,0,0,0,0,0 } },
				{ 'y', new int[] { 198793,33684,1986,44,0,0,0,0,0,0,0,0,0 } },
				{ 'z', new int[] { 226260,7576,633,23,15,0,0,0,0,0,0,0,0 } },
			};

			thresholds = stats.ToDictionary(
				kvp => kvp.Key,
				kvp => kvp.Value.FirstIndexOf(i => i < 1500));
		}

		public bool IsOkByLettersCount(string word)
		{
			foreach (var letter in word)
				if (word.Count(l => l == letter) > thresholds[letter])
					return false;
			return true;
		}

		public void ShowStat(WordFeatureRow[] wordFeatures)
		{
			var maxLength = wordFeatures.Max(f => f.Word.Length);
			var stats = Program.Alphabet.ToDictionary(c => c, c => new int[maxLength]);

			foreach (var letter in Program.Alphabet)
				foreach (var wordFeature in wordFeatures)
				{
					var count = wordFeature.Word.Count(c => c == letter);
					stats[letter][count]++;
				}

			foreach (var kvp in stats)
				Console.WriteLine($"{{ '{kvp.Key}', new int[] {{ {string.Join(",", kvp.Value)} }} }},");
		}
	}
}
