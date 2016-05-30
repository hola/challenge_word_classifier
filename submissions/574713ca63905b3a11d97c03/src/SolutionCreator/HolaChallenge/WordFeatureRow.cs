using System;
using System.IO;
using System.Linq;

namespace HolaChallenge
{
	public class WordFeatureRow
	{
		public string Word;
		public int Length;
		public string[] C2Parts;
		public string[] C3Parts;
		public string[] C4Parts;
		public string VowConsMap;
		public int VowInRow;
		public int ConsInRow;

		public const string Vowels = "aeiouy";
		public static bool IsC3Enabled = false;
		public static bool IsC4Enabled = false;

		public WordFeatureRow(string word)
		{
			Word = word;

			Length = word.Length;

            C2Parts = GetDigrams(word);

            if (IsC3Enabled)
				C3Parts = GetTrigrams(word);

			if (IsC4Enabled)
			{
				C4Parts = word.Length > 2 ? new string[word.Length - 3] : new string[0];
				for (var i = 3; i < word.Length; i++)
					C4Parts[i - 3] = word[i - 3].ToString() + word[i - 2] + word[i - 1] + word[i];
			}

			var vowConsMapArr = new char[word.Length];
			for (var i = 0; i < word.Length; i++)
				vowConsMapArr[i] = Vowels.IndexOf(word[i]) >= 0 ? 'v' : 'c';
			VowConsMap = new string(vowConsMapArr);

			VowInRow = GetMaxInRow(VowConsMap, 'v');
			ConsInRow = GetMaxInRow(VowConsMap, 'c');
		}

        public static string[] GetDigrams(string word)
        {
            var digrams = word.Length > 0 ? new string[word.Length - 1] : new string[0];
            for (var i = 1; i < word.Length; i++)
                digrams[i - 1] = word[i - 1].ToString() + word[i];
            return digrams;
		}

		public static string[] GetTrigrams(string word)
		{
			var trigrams = word.Length > 1 ? new string[word.Length - 2] : new string[0];
			for (var i = 2; i < word.Length; i++)
				trigrams[i - 2] = word[i - 2].ToString() + word[i - 1] + word[i];
			return trigrams;
		}

		public static WordFeatureRow[] Read(JsonSerializerMaster jsonSerializer, string dir)
		{
			return jsonSerializer.Deserialize<WordFeatureRow[]>(File.ReadAllText(Path.Combine(dir, "word_features.json")));
		}

		public static void Save(JsonSerializerMaster jsonSerializer, string dir, string[] words)
		{
			var wordFeatures = Convert(words);
			File.WriteAllText(Path.Combine(dir, "word_features.json"), jsonSerializer.Serialize(wordFeatures));
		}

		public static WordFeatureRow[] Convert(string[] words)
		{
			var result = new WordFeatureRow[words.Length];
			for (var i = 0; i < words.Length; i++)
				result[i] = new WordFeatureRow(words[i]);
			return result;
		}

		private static int GetMaxInRow(string s, char c)
		{
			var result = 0;
			var acc = 0;

			for (var i = 0; i < s.Length; i++)
			{
				if (s[i] != c)
				{
					result = Math.Max(result, acc);
					acc = 0;
				}
				else acc++;
			}
			result = Math.Max(result, acc);

			return result;
		}

		public static void ShowHistograms(WordFeatureRow[] wordFeatures)
		{
			var groupsLen = wordFeatures.GroupBy(f => f.Length).Select(gr => new { len = gr.Key, count = gr.Count() })
					.OrderByDescending(a => a.count).ToArray();
			foreach (var gr in groupsLen)
				Console.WriteLine(gr);

			Console.WriteLine();

			var groupsVowsInRow = wordFeatures.GroupBy(f => f.VowInRow).Select(gr => new { vowInRow = gr.Key, count = gr.Count() })
					.OrderByDescending(a => a.count).ToArray();
			foreach (var gr in groupsVowsInRow)
				Console.WriteLine(gr);

			Console.WriteLine();

			var groupsConsInRow = wordFeatures.GroupBy(f => f.ConsInRow).Select(gr => new { consInRow = gr.Key, count = gr.Count() })
				.OrderByDescending(a => a.count).ToArray();
			foreach (var gr in groupsConsInRow)
				Console.WriteLine(gr);
		}
	}
}
