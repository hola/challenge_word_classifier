using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace HolaChallenge
{
    public class InfixCalc
    {
        private readonly JsonSerializerMaster jsonSerializer;
        private readonly string dir;

        public InfixCalc(JsonSerializerMaster jsonSerializer, string dir)
        {
            this.jsonSerializer = jsonSerializer;
            this.dir = dir;
        }

		public string[] ReplaceInfix(string[] words)
		{
			var replaceDict = new Pairs<string, string>
			{
				//{"cativ" ,"cat"   }, //"ok":61,"fail":16},
				{"eabl"  ,""      }, //"ok":172,"fail":22},
				{"erativ","erat"  }, //"ok":51,"fail":5},
				//{"iase"  ,"iasi"  }, //"ok":41,"fail":12},
				//{"igerou","iferou"}, //"ok":58,"fail":18},
				{"rativ" ,"rat"   }, //"ok":123,"fail":23},
				//{"rrhaph","tom"   }, //"ok":39,"fail":12},
				//{"tmen"  ,""      }, //"ok":106,"fail":29},
				{"vabl"  ,"v"     }, //"ok":53,"fail":9}
			};

			var result = new List<string>();
			var count = 0;

			foreach (var word in words)
			{
				if (word.Length < 3) continue;

				var first = word[0];
				var middle = word.Substring(1, word.Length - 2);
				var last = word[word.Length - 1];

				var addme = word;

				foreach (var kvp in replaceDict)
					if (middle.Contains(kvp.Key))
					{
						addme = first.ToString() + middle.Replace(kvp.Key, kvp.Value) + last.ToString();
						count++;
						break;
					}

				result.Add(addme);
			}

			Console.WriteLine($"Infix replace {count} words");
			return result.ToArray();
		}

		public HashSet<string> CalcInfixFreqs(WordFeatureRow[] wordFeatures, int threshold)
		{
			var c2stats = wordFeatures.SelectMany(f => f.C2Parts.Distinct())
				.GroupBy(s => s)
				.Select(gr => new { c2 = gr.Key, count = gr.Count() })
				.OrderByDescending(a => a.count)
				.ToArray();

			var currentWordsC2Strings = wordFeatures.SelectMany(f => f.C2Parts).Distinct().ToArray();
			var lowFreqC2 = c2stats.Where(a => a.count <= threshold).Select(a => a.c2).ToHashSet();
			var impossibleC2 = Program.Alphabet.CartesianPower(2).ToArray().Except(currentWordsC2Strings).ToArray();
			var wordsToRemove = wordFeatures.Count(f => f.C2Parts.Intersect(lowFreqC2).Any());

			Console.WriteLine($"Total number of c2: {c2stats.Length}, threshold {threshold}, to remove {lowFreqC2.Count + impossibleC2.Length} parts");
			Console.WriteLine($"False negative: {wordsToRemove} words out of {wordFeatures.Length}");

			return impossibleC2.Concat(lowFreqC2).ToHashSet();
		}

		public void CalcInfixSubstitutions(string[] words)
		{
			var wordsHash = words.ToHashSet();

			const int minLenRemaining = 3;
			const int minRatio = 3;
			const int minPopularCount = 50;

			var ffixesDict = new DictionaryList<string, string>();
			for (var len = 1; len <= 8; len++)
				foreach (var word in words)
					if (word.Length - len >= minLenRemaining)
						for (var i = 1; i + len < word.Length; i++)
							ffixesDict.AddToList(word.Substring(i, len), word);

			ffixesDict.RemoveWhere((k, v) => v.Count < minPopularCount);

			var infixes = ffixesDict.Keys.OrderBy(s => s).ToArray();
			var infixSubsts = new Pairs<string, string>();
			var result = new List<SubstData>();

			for (var i = 0; i < infixes.Length; i++)
			{
				var infixFrom = infixes[i];
				Console.WriteLine(infixFrom);

				for (var j = 0; j < infixes.Length; j++)
				{
					var infixTo = i == j ? "" : infixes[j];

					if (infixTo.Length > infixFrom.Length) continue;

					var substOk = 0;
					var substFail = 0;

					foreach (var wordFrom in ffixesDict[infixFrom])
					{
						// Не очень точно - одновременные замены могут повлиять
						var first = wordFrom[0];
						var middle = wordFrom.Substring(1, wordFrom.Length - 2);
						var last = wordFrom[wordFrom.Length - 1];

						var wordTo = first.ToString() + middle.Replace(infixFrom, infixTo) + last.ToString();
						if (wordsHash.Contains(wordTo))
							substOk++;
						else
							substFail++;
					}

					if (substOk >= substFail * minRatio)
					{
						infixSubsts.Add(infixFrom, infixTo);
						var okRatio = ((double)substOk / substFail).ToString("0.00");
						Console.WriteLine($"Infix subst: {{\"{infixFrom}\", \"{infixTo}\"}},  // Ok {substOk}, fail {substFail}, r {okRatio}");
						result.Add(new SubstData
						{
							SuffixFrom = infixFrom,
							SuffixTo = infixTo,
							Ok = substOk,
							Fail = substFail,
						});
					}
				}
			}

			File.WriteAllText(Path.Combine(dir, "infix.json"), jsonSerializer.Serialize(result));
		}
	}
}
